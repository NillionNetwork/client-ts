import { create } from "@bufbuild/protobuf";
import { createClient } from "@connectrpc/connect";
import { parse as parseUuid } from "uuid";
import { z } from "zod";

import { PriceQuoteRequestSchema } from "#/gen-proto/nillion/payments/v1/quote_pb";
import type { SignedReceipt } from "#/gen-proto/nillion/payments/v1/receipt_pb";
import { Permissions as PermissionsService } from "#/gen-proto/nillion/permissions/v1/service_pb";
import { UpdatePermissionsRequestSchema } from "#/gen-proto/nillion/permissions/v1/update_pb";
import {
  ComputePermissionCommand,
  ComputePermissionCommandBuilder,
  PermissionCommand,
  PermissionCommandBuilder,
  type ProgramId,
  type UserId,
  Uuid,
} from "#/types";
import { collapse } from "#/util";
import type { VmClient } from "#/vm/client";
import type { Operation } from "#/vm/operation/operation";

export const UpdatePermissionsConfig = z.object({
  // due to import resolution order we cannot use instanceof because VmClient isn't defined first
  vm: z.custom<VmClient>(),
  id: Uuid,
  retrieve: z.instanceof(PermissionCommand),
  update: z.instanceof(PermissionCommand),
  _delete: z.instanceof(PermissionCommand),
  compute: z.instanceof(ComputePermissionCommand),
});
export type UpdatePermissionsConfig = z.infer<typeof UpdatePermissionsConfig>;

export class UpdatePermissions implements Operation<void> {
  private constructor(private readonly config: UpdatePermissionsConfig) {}

  async invoke(): Promise<void> {
    const signedReceipt = await this.pay();

    const { nodes } = this.config.vm;
    const retrieve = this.config.retrieve.toProto();
    const update = this.config.update.toProto();
    const _delete = this.config._delete.toProto();
    const compute = this.config.compute.toProto();

    const promises = nodes.map((node) => {
      const client = createClient(PermissionsService, node.transport);
      return client.updatePermissions(
        create(UpdatePermissionsRequestSchema, {
          signedReceipt,
          retrieve,
          update,
          delete: _delete,
          compute,
        }),
      );
    });

    collapse(await Promise.all(promises));
  }

  private pay(): Promise<SignedReceipt> {
    const {
      id,
      vm: { payer },
    } = this.config;

    return payer.payForOperation(
      create(PriceQuoteRequestSchema, {
        operation: {
          case: "updatePermissions",
          value: {
            valuesId: parseUuid(id),
          },
        },
      }),
    );
  }

  static new(config: UpdatePermissionsConfig): UpdatePermissions {
    return new UpdatePermissions(config);
  }
}

export class UpdatePermissionsBuilder {
  private _valuesId?: Uuid;
  private retrieve = PermissionCommandBuilder.init();
  private update = PermissionCommandBuilder.init();
  private _delete = PermissionCommandBuilder.init();
  private compute = ComputePermissionCommandBuilder.init();

  private constructor(private readonly vm: VmClient) {}

  valuesId(value: Uuid): this {
    this._valuesId = value;
    return this;
  }

  grantRetrieve(id: UserId): this {
    this.retrieve.grant(id);
    return this;
  }

  revokeRetrieve(id: UserId): this {
    this.retrieve.revoke(id);
    return this;
  }

  grantUpdate(id: UserId): this {
    this.update.grant(id);
    return this;
  }

  revokeUpdate(id: UserId): this {
    this.update.revoke(id);
    return this;
  }

  grantDelete(id: UserId): this {
    this._delete.grant(id);
    return this;
  }

  revokeDelete(id: UserId): this {
    this._delete.revoke(id);
    return this;
  }

  grantCompute(id: UserId, programs: ProgramId[]): this {
    this.compute.grant(id, programs);
    return this;
  }

  revokeCompute(id: UserId, programs: ProgramId[]): this {
    this.compute.revoke(id, programs);
    return this;
  }

  build(): UpdatePermissions {
    const config = UpdatePermissionsConfig.parse({
      vm: this.vm,
      id: this._valuesId,
      retrieve: this.retrieve.build(),
      update: this.update.build(),
      _delete: this._delete.build(),
      compute: this.compute.build(),
    });
    return UpdatePermissions.new(config);
  }

  static init = (vm: VmClient): UpdatePermissionsBuilder =>
    new UpdatePermissionsBuilder(vm);
}
