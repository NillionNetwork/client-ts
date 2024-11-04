import { create } from "@bufbuild/protobuf";
import { createClient } from "@connectrpc/connect";
import {
  type NadaValue,
  NadaValues,
  compute_values_size,
  encode_values,
} from "@nillion/client-wasm";
import { stringify as stringifyUuid } from "uuid";
import { z } from "zod";
import { PriceQuoteRequestSchema } from "#/gen-proto/nillion/payments/v1/quote_pb";
import type { SignedReceipt } from "#/gen-proto/nillion/payments/v1/receipt_pb";
import { Values } from "#/gen-proto/nillion/values/v1/service_pb";
import { StoreValuesRequestSchema } from "#/gen-proto/nillion/values/v1/store_pb";
import { PartyId, TtlDays, Uuid } from "#/types/types";
import {
  type ValuesPermissions,
  ValuesPermissionsBuilder,
} from "#/types/values-permissions";
import { collapse } from "#/util";
import type { VmClient } from "#/vm/client";
import type { Operation } from "#/vm/operation/operation";

export const StoreValuesConfig = z.object({
  // due to import resolution order we cannot use instanceof because VmClient isn't defined first
  vm: z.custom<VmClient>(),
  id: Uuid.nullish(),
  values: z.instanceof(NadaValues),
  ttl: TtlDays,
  permissions: z.custom<ValuesPermissions>(),
});
export type StoreValuesConfig = z.infer<typeof StoreValuesConfig>;

export class StoreValues implements Operation<Uuid> {
  private constructor(private readonly config: StoreValuesConfig) {}

  async invoke(): Promise<Uuid> {
    const signedReceipt = await this.pay();

    const {
      values,
      vm: { masker, nodes },
    } = this.config;

    const shares = masker.mask(values).map((share) => ({
      node: PartyId.from(share.party.to_byte_array()),
      bincodeValues: encode_values(share.shares),
    }));

    const updateIdentifier = this.isUpdate
      ? new TextEncoder().encode(this.config.id ?? undefined)
      : undefined;

    const permissions = this.config.permissions.toProto();

    const promises = nodes.map((node) => {
      const client = createClient(Values, node.transport);
      const share = shares.find(
        (share) => share.node.toBase64() === node.id.toBase64(),
      );

      if (!share) {
        throw new Error("Failed to match share.party with a known node.id");
      }

      return client.storeValues(
        create(StoreValuesRequestSchema, {
          signedReceipt,
          bincodeValues: share.bincodeValues,
          permissions,
          updateIdentifier,
        }),
      );
    });

    const results = (await Promise.all(promises)).map((e) => e.valuesId);
    return stringifyUuid(collapse(results));
  }

  get isUpdate(): boolean {
    return Boolean(this.config.id);
  }

  private pay(): Promise<SignedReceipt> {
    const {
      ttl: ttlDays,
      values,
      vm: { payer, masker },
    } = this.config;

    const payloadSize = compute_values_size(values);
    const classify = masker.classify_values(values);

    return payer.payForOperation(
      create(PriceQuoteRequestSchema, {
        operation: {
          case: "storeValues",
          value: {
            particlesCount: classify.particles,
            secretSharedCount: classify.shares,
            publicValuesCount: classify.public,
            ttlDays,
            payloadSize,
          },
        },
      }),
    );
  }

  static new(config: StoreValuesConfig): StoreValues {
    return new StoreValues(config);
  }
}

export class StoreValuesBuilder {
  private _id?: Uuid;
  private _ttl?: TtlDays;
  private _permissions?: ValuesPermissions;
  private readonly _values = new NadaValues();

  private constructor(private readonly vm: VmClient) {}

  value(name: string, value: NadaValue): this {
    this._values.insert(name, value);
    return this;
  }

  ttl(value: TtlDays): this {
    this._ttl = value;
    return this;
  }

  update(value: Uuid): this {
    this._id = value;
    return this;
  }

  defaultPermissions(): this {
    this._permissions = ValuesPermissionsBuilder.default(this.vm.id);
    return this;
  }

  permissions(value: ValuesPermissions): this {
    this._permissions = value;
    return this;
  }

  build(): StoreValues {
    const config = StoreValuesConfig.parse({
      vm: this.vm,
      id: this._id,
      values: this._values,
      ttl: this._ttl,
      permissions: this._permissions,
    });
    return StoreValues.new(config);
  }

  static init = (vm: VmClient) => new StoreValuesBuilder(vm);
}
