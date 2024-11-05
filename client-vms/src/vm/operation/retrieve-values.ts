import { create } from "@bufbuild/protobuf";
import { createClient } from "@connectrpc/connect";
import { PartyShares, decode_values } from "@nillion/client-wasm";
import { parse as parseUuid } from "uuid";
import { z } from "zod";
import { PriceQuoteRequestSchema } from "#/gen-proto/nillion/payments/v1/quote_pb";
import type { SignedReceipt } from "#/gen-proto/nillion/payments/v1/receipt_pb";
import { RetrieveValuesRequestSchema } from "#/gen-proto/nillion/values/v1/retrieve_pb";
import { Values } from "#/gen-proto/nillion/values/v1/service_pb";
import { NadaValuesRecord, Uuid } from "#/types/types";
import type { VmClient } from "#/vm/client";
import type { Operation } from "#/vm/operation/operation";

export const RetrieveValuesConfig = z.object({
  // due to import resolution order we cannot use instanceof because VmClient isn't defined first
  vm: z.custom<VmClient>(),
  id: Uuid,
});
export type RetrieveValuesConfig = z.infer<typeof RetrieveValuesConfig>;

export class RetrieveValues implements Operation<NadaValuesRecord> {
  private constructor(private readonly config: RetrieveValuesConfig) {}

  async invoke(): Promise<NadaValuesRecord> {
    const { nodes, masker } = this.config.vm;
    const signedReceipt = await this.pay();

    const promises = nodes.map(async (node) => {
      const client = createClient(Values, node.transport);
      const result = await client.retrieveValues(
        create(RetrieveValuesRequestSchema, {
          signedReceipt,
        }),
      );

      return new PartyShares(
        node.id.toWasm(),
        decode_values(result.bincodeValues),
      );
    });

    const results = await Promise.all(promises);
    if (results.length !== nodes.length) {
      throw new Error("Results length does not match nodes length");
    }

    const record = masker.unmask(results).to_record() as unknown;
    return NadaValuesRecord.parse(record);
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
