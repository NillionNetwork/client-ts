import { createClient } from "@connectrpc/connect";
import { PartyShares, decode_values } from "@nillion/client-wasm";
import { parse as parseUuid } from "uuid";
import { z } from "zod";
import { Compute } from "#/gen-proto/nillion/compute/v1/service_pb";
import { Log } from "#/logger";
import { NadaValuesRecord, Uuid } from "#/types/types";
import type { VmClient } from "#/vm/client";
import type { Operation } from "#/vm/operation/operation";

export const RetrieveComputeResultConfig = z.object({
  // due to import resolution order we cannot use instanceof because VmClient isn't defined first
  vm: z.custom<VmClient>(),
  id: Uuid,
});
export type RetrieveComputeResultConfig = z.infer<
  typeof RetrieveComputeResultConfig
>;

export class RetrieveComputeResult implements Operation<NadaValuesRecord> {
  private constructor(private readonly config: RetrieveComputeResultConfig) {}

  async invoke(): Promise<NadaValuesRecord> {
    const { nodes, masker } = this.config.vm;
    const computeId = parseUuid(this.config.id);

    const promises = nodes.map(async (node) => {
      const client = createClient(Compute, node.transport);
      const asyncIterable = client.retrieveResults({
        computeId,
      });

      for await (const response of asyncIterable) {
        const state = response.state.case;

        if (state !== "success" && state !== "waitingComputation") {
          throw new Error("Compute result failure from node", {
            cause: response,
          });
        }

        if (response.state.case === "success") {
          return new PartyShares(
            node.id.toWasm(),
            decode_values(response.state.value.bincodeValues),
          );
        }

        Log.info("Waiting for compute result from: %s", node.id.toBase64());
      }
    });

    const results = (await Promise.all(promises)) as PartyShares[];
    const shares = results.map((values) => values);
    const values = masker.unmask(shares);

    const record = values.to_record() as unknown;
    return NadaValuesRecord.parse(record);
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
