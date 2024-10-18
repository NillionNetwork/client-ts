import { create } from "@bufbuild/protobuf";
import { createClient } from "@connectrpc/connect";
import { stringify as stringifyUuid } from "uuid";
import { z } from "zod";

import { PriceQuoteRequestSchema } from "@nillion/client-vms/gen-proto/nillion/payments/v1/quote_pb";
import { SignedReceipt } from "@nillion/client-vms/gen-proto/nillion/payments/v1/receipt_pb";
import { Permissions as ValuesPermissions } from "@nillion/client-vms/gen-proto/nillion/permissions/v1/permissions_pb";
import { Values } from "@nillion/client-vms/gen-proto/nillion/values/v1/service_pb";
import { StoreValuesRequestSchema } from "@nillion/client-vms/gen-proto/nillion/values/v1/store_pb";
import { PaymentClient } from "@nillion/client-vms/payment";
import { PartyId, TtlDays, Uuid } from "@nillion/client-vms/types";
import { collapse } from "@nillion/client-vms/util";
import { type NodeConfig, VmClient } from "@nillion/client-vms/vm/client";
import { Operation } from "@nillion/client-vms/vm/operation/operation";
import { ValuesPermissionsBuilder } from "@nillion/client-vms/vm/operation/values-permissions-builder";
import {
  compute_values_size,
  encode_values,
  NadaValue,
  NadaValues,
  SecretMasker,
} from "@nillion/client-wasm";

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

  private get payer(): PaymentClient {
    return this.config.vm.config.payer;
  }

  private get nodes(): NodeConfig[] {
    return this.config.vm.config.nodes;
  }

  private get masker(): SecretMasker {
    return this.config.vm.config.masker;
  }

  async invoke(): Promise<Uuid> {
    const { masker, nodes, config } = this;
    const { values, permissions } = config;

    const signedReceipt = await this.pay();
    const shares = masker.mask(values).map((share) => ({
      node: PartyId.from(share.party.to_byte_array()),
      bincodeValues: encode_values(share.shares),
    }));

    const updateIdentifier = this.isUpdate
      ? new TextEncoder().encode(this.config.id ?? undefined)
      : undefined;

    const promises = nodes.map((node) => {
      const client = createClient(Values, node.transport);
      const share = shares.find(
        (share) => share.node.toBase64() === node.id.toBase64(),
      );

      if (!share)
        throw new Error("Failed to match share.party with a known node.id");

      return client.storeValues(
        create(StoreValuesRequestSchema, {
          signedReceipt,
          bincodeValues: share.bincodeValues,
          permissions: permissions,
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
    const { masker, payer, config } = this;
    const { ttl: ttlDays, values } = config;

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
    this._permissions = ValuesPermissionsBuilder.default(
      this.vm.config.id,
    ).build();
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
