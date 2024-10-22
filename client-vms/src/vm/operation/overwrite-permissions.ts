import { create } from "@bufbuild/protobuf";
import { createClient } from "@connectrpc/connect";
import { parse as parseUuid } from "uuid";
import { z } from "zod";

import { PriceQuoteRequestSchema } from "@nillion/client-vms/gen-proto/nillion/payments/v1/quote_pb";
import { SignedReceipt } from "@nillion/client-vms/gen-proto/nillion/payments/v1/receipt_pb";
import { OverwritePermissionsRequestSchema } from "@nillion/client-vms/gen-proto/nillion/permissions/v1/overwrite_pb";
import { Permissions as PermissionsService } from "@nillion/client-vms/gen-proto/nillion/permissions/v1/service_pb";
import { Uuid, ValuesPermissions } from "@nillion/client-vms/types";
import { collapse } from "@nillion/client-vms/util";
import { VmClient } from "@nillion/client-vms/vm/client";
import { Operation } from "@nillion/client-vms/vm/operation/operation";

export const OverwritePermissionsConfig = z.object({
  // due to import resolution order we cannot use instanceof because VmClient isn't defined first
  vm: z.custom<VmClient>(),
  id: Uuid,
  permissions: z.custom<ValuesPermissions>(),
});
export type OverwritePermissionsConfig = z.infer<
  typeof OverwritePermissionsConfig
>;

export class OverwritePermissions implements Operation<ValuesPermissions> {
  private constructor(private readonly config: OverwritePermissionsConfig) {}

  async invoke(): Promise<ValuesPermissions> {
    const {
      permissions,
      vm: { nodes },
    } = this.config;

    const signedReceipt = await this.pay();

    const promises = nodes.map((node) => {
      const client = createClient(PermissionsService, node.transport);
      return client.overwritePermissions(
        create(OverwritePermissionsRequestSchema, {
          signedReceipt,
          permissions: permissions.toProto(),
        }),
      );
    });

    collapse(await Promise.all(promises));
    return permissions;
  }

  private pay(): Promise<SignedReceipt> {
    const {
      id,
      vm: { payer },
    } = this.config;

    return payer.payForOperation(
      create(PriceQuoteRequestSchema, {
        operation: {
          case: "overwritePermissions",
          value: {
            valuesId: parseUuid(id),
          },
        },
      }),
    );
  }

  static new(config: OverwritePermissionsConfig): OverwritePermissions {
    return new OverwritePermissions(config);
  }
}

export class OverwritePermissionsBuilder {
  private _id?: Uuid;
  private _permissions?: ValuesPermissions;
  private constructor(private readonly vm: VmClient) {}

  id(value: Uuid): this {
    this._id = value;
    return this;
  }

  permissions(value: ValuesPermissions): this {
    this._permissions = value;
    return this;
  }

  build(): OverwritePermissions {
    const config = OverwritePermissionsConfig.parse({
      vm: this.vm,
      id: this._id,
      permissions: this._permissions,
    });
    return OverwritePermissions.new(config);
  }

  static init = (vm: VmClient): OverwritePermissionsBuilder =>
    new OverwritePermissionsBuilder(vm);
}
