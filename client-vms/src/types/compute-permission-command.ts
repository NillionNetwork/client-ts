import { create } from "@bufbuild/protobuf";
import { ComputePermissionsSchema } from "@nillion/client-vms/gen-proto/nillion/permissions/v1/permissions_pb";
import {
  type ComputePermissionCommand as ComputePermissionCommandProtobuf,
  ComputePermissionCommandSchema,
} from "@nillion/client-vms/gen-proto/nillion/permissions/v1/update_pb";
import type { ProgramId } from "@nillion/client-vms/types/types";
import type { UserId } from "@nillion/client-vms/types/user-id";

export class ComputePermissionCommand {
  constructor(
    private readonly grant: Map<UserId, ProgramId[]>,
    private readonly revoke: Map<UserId, ProgramId[]>,
  ) {}

  toProto(): ComputePermissionCommandProtobuf {
    return create(ComputePermissionCommandSchema, {
      grant: Array.from(this.grant).map(([id, programIds]) =>
        create(ComputePermissionsSchema, {
          user: id.toProto(),
          programIds,
        }),
      ),
      revoke: Array.from(this.revoke).map(([id, programIds]) =>
        create(ComputePermissionsSchema, {
          user: id.toProto(),
          programIds,
        }),
      ),
    });
  }
}

export class ComputePermissionCommandBuilder {
  private constructor(
    private readonly _grant: Map<UserId, ProgramId[]> = new Map(),
    private readonly _revoke: Map<UserId, ProgramId[]> = new Map(),
  ) {}

  grant(id: UserId, programs: ProgramId[]): this {
    if (this._revoke.has(id)) {
      throw new Error(
        `Cannot grant and revoke the same user id: ${id.toHex()}`,
      );
    }
    this._grant.set(id, programs);
    return this;
  }

  revoke(id: UserId, programs: ProgramId[]): this {
    if (this._revoke.has(id)) {
      throw new Error(
        `Cannot grant and revoke the same user id: ${id.toHex()}`,
      );
    }
    this._revoke.set(id, programs);
    return this;
  }

  build(): ComputePermissionCommand {
    return new ComputePermissionCommand(this._grant, this._revoke);
  }

  static init(): ComputePermissionCommandBuilder {
    return new ComputePermissionCommandBuilder();
  }
}
