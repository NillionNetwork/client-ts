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
    private readonly grant: Map<UserId, Set<ProgramId>>,
    private readonly revoke: Map<UserId, Set<ProgramId>>,
  ) {}

  toProto(): ComputePermissionCommandProtobuf {
    return create(ComputePermissionCommandSchema, {
      grant: Array.from(this.grant).map(([id, programIds]) =>
        create(ComputePermissionsSchema, {
          user: id.toProto(),
          programIds: Array.from(programIds),
        }),
      ),
      revoke: Array.from(this.revoke).map(([id, programIds]) =>
        create(ComputePermissionsSchema, {
          user: id.toProto(),
          programIds: Array.from(programIds),
        }),
      ),
    });
  }
}

type ComputePermissionCommandAsObject = {
  grant: Map<string, string[]>;
  revoke: Map<string, string[]>;
};

export class ComputePermissionCommandBuilder {
  private constructor(
    private readonly _grant: Map<UserId, Set<ProgramId>> = new Map(),
    private readonly _revoke: Map<UserId, Set<ProgramId>> = new Map(),
  ) {}

  grant(id: UserId, program: ProgramId): this {
    if (this._revoke.has(id)) {
      throw new Error(
        `Cannot grant and revoke the same user id: ${id.toHex()}`,
      );
    }

    const entry = this._grant.get(id) ?? new Set<ProgramId>();
    entry.add(program);
    this._grant.set(id, entry);
    return this;
  }

  revoke(id: UserId, program: ProgramId): this {
    if (this._grant.has(id)) {
      throw new Error(
        `Cannot grant and revoke the same user id: ${id.toHex()}`,
      );
    }
    const entry = this._revoke.get(id) ?? new Set<ProgramId>();
    entry.add(program);
    this._revoke.set(id, entry);
    return this;
  }

  toObject(): ComputePermissionCommandAsObject {
    return {
      grant: convertMapSetToMapArray(this._grant),
      revoke: convertMapSetToMapArray(this._revoke),
    };
  }

  build(): ComputePermissionCommand {
    return new ComputePermissionCommand(this._grant, this._revoke);
  }

  static init(): ComputePermissionCommandBuilder {
    return new ComputePermissionCommandBuilder();
  }
}

const convertMapSetToMapArray = (
  map: Map<UserId, Set<ProgramId>>,
): Map<string, string[]> => {
  return new Map(
    Array.from(map.entries()).map(([userId, programSet]) => [
      userId.toString(),
      Array.from(programSet).map((program) => program.toString()),
    ]),
  );
};
