import { create } from "@bufbuild/protobuf";
import { createClient } from "@connectrpc/connect";
import { stringify as stringifyUuid } from "uuid";
import { z } from "zod";

import { PriceQuoteRequestSchema } from "@nillion/client-vms/gen-proto/nillion/payments/v1/quote_pb";
import { SignedReceipt } from "@nillion/client-vms/gen-proto/nillion/payments/v1/receipt_pb";
import {
  ComputePermissionsSchema,
  Permissions,
  PermissionsSchema,
} from "@nillion/client-vms/gen-proto/nillion/permissions/v1/permissions_pb";
import { Values } from "@nillion/client-vms/gen-proto/nillion/values/v1/service_pb";
import { StoreValuesRequestSchema } from "@nillion/client-vms/gen-proto/nillion/values/v1/store_pb";
import { PaymentClient } from "@nillion/client-vms/payment";
import { PartyId, Uuid } from "@nillion/client-vms/types";
import { type NodeConfig, VmClient } from "@nillion/client-vms/vm/client";
import { Operation } from "@nillion/client-vms/vm/operation/operation";
import {
  compute_values_size,
  encode_values,
  NadaValue,
  NadaValues,
  SecretMasker,
} from "@nillion/client-wasm";

// domain primitives

export const TtlDays = z.number().positive();
export type TtlDays = z.infer<typeof TtlDays>;

// domain for store value operation

export const StoreValuesConfig = z.object({
  // due to import resolution order we cannot use instanceof because VmClient isn't defined first
  vm: z.custom<VmClient>(),
  id: Uuid.nullish(),
  values: z.instanceof(NadaValues),
  ttl: TtlDays,
  permissions: z.custom<Permissions>(),
});
export type StoreValuesConfig = z.infer<typeof StoreValuesConfig>;

export class StoreValues implements Operation<Uuid> {
  readonly name = "storeValues";

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

    const results = await Promise.all(promises);

    if (results.length === 0) throw new Error("Results array is empty");

    return results
      .map((result) => stringifyUuid(result.valuesId))
      .reduce<Uuid>((acc, cur) => {
        if (acc === "") {
          return cur;
        } else if (acc != cur) {
          throw new Error("Nodes returned different store ids");
        } else {
          return cur;
        }
      }, "");
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
          case: this.name,
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
  private _permissions?: Permissions;
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

  permissions(value: Permissions): this {
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

type UserId = string;
type ProgramId = string;

class ValuesPermissionsBuilder {
  private readonly _ownerUserId: UserId;
  private readonly _retrieveAllowedUserIds: UserId[];
  private readonly _updateAllowedUserIds: UserId[];
  private readonly _deleteAllowedUserIds: UserId[];
  private readonly _computePermissions: [UserId, ProgramId[]][];

  private constructor(owner: UserId) {
    this._ownerUserId = owner;
    this._retrieveAllowedUserIds = [this._ownerUserId];
    this._updateAllowedUserIds = [this._ownerUserId];
    this._deleteAllowedUserIds = [this._ownerUserId];
    this._computePermissions = [];
  }

  allowRetrieve(id: UserId): this {
    this._retrieveAllowedUserIds.push(id);
    return this;
  }

  allowUpdate(id: UserId): this {
    this._updateAllowedUserIds.push(id);
    return this;
  }

  allowDelete(id: UserId): this {
    this._deleteAllowedUserIds.push(id);
    return this;
  }

  allowCompute(id: UserId, programs: ProgramId[]): this {
    this._computePermissions.push([id, programs]);
    return this;
  }

  build(): Permissions {
    const computePermissions = this._computePermissions.map(
      ([userId, programIds]) =>
        create(ComputePermissionsSchema, {
          userId,
          programIds,
        }),
    );

    return create(PermissionsSchema, {
      ownerUserId: this._ownerUserId,
      retrieveAllowedUserIds: this._retrieveAllowedUserIds,
      updateAllowedUserIds: this._updateAllowedUserIds,
      deleteAllowedUserIds: this._deleteAllowedUserIds,
      computePermissions,
    });
  }

  static default(owner: UserId) {
    return new ValuesPermissionsBuilder(owner);
  }
}
