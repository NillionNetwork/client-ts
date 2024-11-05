import { create } from "@bufbuild/protobuf";
import { type Client, createClient } from "@connectrpc/connect";
import { PartyShares, decode_values } from "@nillion/client-wasm";
import { Effect as E, pipe } from "effect";
import type { UnknownException } from "effect/Cause";
import { parse as parseUuid } from "uuid";
import { z } from "zod";
import { PriceQuoteRequestSchema } from "#/gen-proto/nillion/payments/v1/quote_pb";
import type { SignedReceipt } from "#/gen-proto/nillion/payments/v1/receipt_pb";
import {
  type RetrieveValuesRequest,
  RetrieveValuesRequestSchema,
} from "#/gen-proto/nillion/values/v1/retrieve_pb";
import { Values } from "#/gen-proto/nillion/values/v1/service_pb";
import { Log } from "#/logger";
import { NadaValuesRecord, type PartyId, Uuid } from "#/types/types";
import type { VmClient } from "#/vm/client";
import type { Operation } from "#/vm/operation/operation";
import { retryGrpcRequestIfRecoverable } from "#/vm/operation/retry-client";

export const RetrieveValuesConfig = z.object({
  // due to import resolution order we cannot use instanceof because VmClient isn't defined first
  vm: z.custom<VmClient>(),
  id: Uuid,
});
export type RetrieveValuesConfig = z.infer<typeof RetrieveValuesConfig>;

type NodeRequestOptions = {
  nodeId: PartyId;
  client: Client<typeof Values>;
  request: RetrieveValuesRequest;
};

export class RetrieveValues implements Operation<NadaValuesRecord> {
  private constructor(private readonly config: RetrieveValuesConfig) {}

  async invoke(): Promise<NadaValuesRecord> {
    return pipe(
      E.tryPromise(() => this.pay()),
      E.map((receipt) => this.prepareRequestPerNode(receipt)),
      E.flatMap(E.all),
      E.map((requests) =>
        requests.map((request) =>
          retryGrpcRequestIfRecoverable<PartyShares>(
            "RetrieveValues",
            this.invokeNodeRequest(request),
          ),
        ),
      ),
      E.flatMap((effects) =>
        E.all(effects, { concurrency: this.config.vm.nodes.length }),
      ),
      E.map((shares) => {
        const values = this.config.vm.masker.unmask(shares);
        const record = values.to_record() as unknown;
        return NadaValuesRecord.parse(record);
      }),
      E.tapBoth({
        onFailure: (e) =>
          E.sync(() => Log.error("Retrieve values failed: %O", e)),
        onSuccess: (data) =>
          E.sync(() => Log.info("Retrieved values: %O", data)),
      }),
      E.runPromise,
    );
  }

  prepareRequestPerNode(
    signedReceipt: SignedReceipt,
  ): E.Effect<NodeRequestOptions, UnknownException>[] {
    return this.config.vm.nodes.map((node) =>
      E.succeed({
        nodeId: node.id,
        client: createClient(Values, node.transport),
        request: create(RetrieveValuesRequestSchema, {
          signedReceipt,
        }),
      }),
    );
  }

  invokeNodeRequest(
    options: NodeRequestOptions,
  ): E.Effect<PartyShares, UnknownException> {
    const { nodeId, client, request } = options;
    return pipe(
      E.tryPromise(() => client.retrieveValues(request)),
      E.map(
        (response) =>
          new PartyShares(
            nodeId.toWasm(),
            decode_values(response.bincodeValues),
          ),
      ),
      E.tap((id) =>
        Log.debug(
          `Retrieved values shares: node=${nodeId.toBase64()} values=${id}`,
        ),
      ),
    );
  }

  private pay(): Promise<SignedReceipt> {
    const {
      id,
      vm: { payer },
    } = this.config;

    return payer.payForOperation(
      create(PriceQuoteRequestSchema, {
        operation: {
          case: "retrieveValues",
          value: {
            valuesId: parseUuid(id),
          },
        },
      }),
    );
  }

  static new(config: RetrieveValuesConfig): RetrieveValues {
    return new RetrieveValues(config);
  }
}

export class RetrieveValuesBuilder {
  private _id?: Uuid;
  private constructor(private readonly vm: VmClient) {}

  id(value: Uuid): this {
    this._id = value;
    return this;
  }

  build(): RetrieveValues {
    const config = RetrieveValuesConfig.parse({
      vm: this.vm,
      id: this._id,
    });
    return RetrieveValues.new(config);
  }

  static init = (vm: VmClient): RetrieveValuesBuilder =>
    new RetrieveValuesBuilder(vm);
}
