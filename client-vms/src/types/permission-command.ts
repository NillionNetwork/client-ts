import { create } from "@bufbuild/protobuf";
import {
  type PermissionCommand as PermissionCommandProtobuf,
  PermissionCommandSchema,
} from "@nillion/client-vms/gen-proto/nillion/permissions/v1/update_pb";
import { UserId } from "@nillion/client-vms/types/user-id";

export class PermissionCommand {
  constructor(
    private readonly grant: Set<UserId>,
    private readonly revoke: Set<UserId>,
  ) {}

  toProto(): PermissionCommandProtobuf {
    return create(PermissionCommandSchema, {
      grant: Array.from(this.grant).map((id) => id.toProto()),
      revoke: Array.from(this.revoke).map((id) => id.toProto()),
    });
  }

  static from(value: PermissionCommandProtobuf): PermissionCommand {
    const grant = new Set(value.grant.map((id) => UserId.fromProto(id)));
    const revoke = new Set(value.revoke.map((id) => UserId.fromProto(id)));

    return new PermissionCommand(grant, revoke);
  }
}

type PermissionCommandAsObject = {
  grant: string[];
  revoke: string[];
};

export class PermissionCommandBuilder {
  private constructor(
    private readonly _grant: Set<UserId> = new Set(),
    private readonly _revoke: Set<UserId> = new Set(),
  ) {}

  grant(value: UserId): this {
    if (this._revoke.has(value)) {
      throw new Error(
        `Cannot grant and revoke the same user id: ${value.toHex()}`,
      );
    }
    this._grant.add(value);
    return this;
  }

  revoke(value: UserId): this {
    if (this._grant.has(value)) {
      throw new Error(
        `Cannot grant and revoke the same user id: ${value.toHex()}`,
      );
    }
    this._revoke.add(value);
    return this;
  }

  toObject(): PermissionCommandAsObject {
    return {
      grant: Array.from(this._grant).map((u) => u.toHex()),
      revoke: Array.from(this._revoke).map((u) => u.toHex()),
    };
  }

  build(): PermissionCommand {
    return new PermissionCommand(this._grant, this._revoke);
  }

  static init(): PermissionCommandBuilder {
    return new PermissionCommandBuilder();
  }
}
