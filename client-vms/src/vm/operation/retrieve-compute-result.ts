import { create } from "@bufbuild/protobuf";
import { type Client, createClient } from "@connectrpc/connect";
import { EncryptedNadaValues, PartyShares } from "@nillion/client-wasm";
import { Effect as E, pipe } from "effect";
import type { UnknownException } from "effect/Cause";
import { parse } from "uuid";
import { z } from "zod";
import {
  type RetrieveResultsRequest,
  RetrieveResultsRequestSchema,
} from "#/gen-proto/nillion/compute/v1/retrieve_pb";
import { Compute } from "#/gen-proto/nillion/compute/v1/service_pb";
import { Log } from "#/logger";
import { NadaValuesRecord, type PartyId, Uuid } from "#/types/types";
import { unwrapExceptionCause } from "#/util";
import type { VmClient } from "#/vm/client";
import type { Operation } from "#/vm/operation/operation";
import { retryGrpcRequestIfRecoverable } from "#/vm/operation/retry-client";
import { nadaValuesFromProto } from "#/vm/values";

export const RetrieveComputeResultConfig = z.object({
  // due to import resolution order we cannot use instanceof because VmClient isn't defined first
  vm: z.custom<VmClient>(),
  id: Uuid,
});
export type RetrieveComputeResultConfig = z.infer<
  typeof RetrieveComputeResultConfig
>;

type NodeRequestOptions = {
  nodeId: PartyId;
  client: Client<typeof Compute>;
  request: RetrieveResultsRequest;
};

export class RetrieveComputeResult implements Operation<NadaValuesRecord> {
  private constructor(private readonly config: RetrieveComputeResultConfig) {}

  async invoke(): Promise<NadaValuesRecord> {
    return pipe(
      this.prepareRequestPerNode(),
      E.all,
      E.map((requests) =>
        requests.map((request) =>
          retryGrpcRequestIfRecoverable<PartyShares>(
            "RetrieveComputeResults",
            this.invokeNodeRequest(request),
          ),
        ),
      ),
      E.flatMap((effects) =>
        E.all(effects, { concurrency: this.config.vm.nodes.length }),
      ),
      E.map((results) => {
        const shares = results.map((values) => values);
        const values = this.config.vm.masker.unmask(shares);
        const record = values.to_record() as unknown;
        return NadaValuesRecord.parse(record);
      }),
      E.catchAll(unwrapExceptionCause),
      E.tapBoth({
        onFailure: (e) =>
          E.sync(() => Log("Retrieve compute results failed: %O", e)),
        onSuccess: (data) =>
          E.sync(() => Log("Retrieved compute results: %O", data)),
      }),
      E.runPromise,
    );
  }

  prepareRequestPerNode(): E.Effect<NodeRequestOptions, UnknownException>[] {
    const computeId = parse(this.config.id);

    return this.config.vm.nodes.map((node) =>
      E.succeed({
        nodeId: node.id,
        client: createClient(Compute, node.transport),
        request: create(RetrieveResultsRequestSchema, {
          computeId,
        }),
      }),
    );
  }

  invokeNodeRequest(
    options: NodeRequestOptions,
  ): E.Effect<PartyShares, UnknownException> {
    const { nodeId, client, request } = options;
    return pipe(
      E.tryPromise(async () => {
        const asyncIterable = client.retrieveResults(request);

        for await (const response of asyncIterable) {
          const state = response.state.case;

          if (state !== "success" && state !== "waitingComputation") {
            throw new Error("Compute result failure from node", {
              cause: response,
            });
          }

          if (response.state.case === "success") {
            return new PartyShares(
              nodeId.toWasm(),
              EncryptedNadaValues.from_js_object(
                nadaValuesFromProto(response.state.value.values),
                this.config.vm.masker.modulo(),
              ),
            );
          }

          Log(`Compute result waiting on: node=${nodeId.toBase64()}`);
        }
      }),
      E.map((shares) => shares as PartyShares),
      E.tap(() =>
        Log(`Compute result shares retrieved: node=${nodeId.toBase64()}`),
      ),
    );
  }

  static new(config: RetrieveComputeResultConfig): RetrieveComputeResult {
    return new RetrieveComputeResult(config);
  }
}

export class RetrieveComputeResultBuilder {
  private _id?: Uuid;
  private constructor(private readonly vm: VmClient) {}

  id(value: Uuid): this {
    this._id = value;
    return this;
  }

  build(): RetrieveComputeResult {
    const config = RetrieveComputeResultConfig.parse({
      vm: this.vm,
      id: this._id,
    });
    return RetrieveComputeResult.new(config);
  }

  static init = (vm: VmClient): RetrieveComputeResultBuilder =>
    new RetrieveComputeResultBuilder(vm);
}
