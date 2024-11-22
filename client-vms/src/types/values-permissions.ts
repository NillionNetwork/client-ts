import { create } from "@bufbuild/protobuf";
import {
  type Permissions as PermissionsProtobuf,
  PermissionsSchema,
} from "#/gen-proto/nillion/permissions/v1/permissions_pb";
import type { ProgramId } from "#/types/types";
import { UserId } from "#/types/user-id";
import { assertIsDefined } from "#/util";

type ValuesPermissionsAsObject = {
  owner: string;
  retrieve: string[];
  update: string[];
  delete: string[];
  compute: {
    user: string;
    programIds: string[];
  }[];
};

export class ValuesPermissions {
  constructor(
    public owner: UserId,
    public readonly retrieve: Set<UserId>,
    public readonly update: Set<UserId>,
    public readonly _delete: Set<UserId>,
    public readonly compute: Map<UserId, Set<ProgramId>>,
  ) {}

  toProto(): PermissionsProtobuf {
    return create(PermissionsSchema, {
      owner: this.owner.toProto(),
      retrieve: Array.from(this.retrieve.values()).map((e) => e.toProto()),
      update: Array.from(this.update.values()).map((e) => e.toProto()),
      delete: Array.from(this._delete.values()).map((e) => e.toProto()),
    });
  }

  toObject(): ValuesPermissionsAsObject {
    return {
      owner: this.owner.toHex(),
      retrieve: Array.from(this.retrieve.values()).map((u) => u.toHex()),
      update: Array.from(this.update.values()).map((u) => u.toHex()),
      delete: Array.from(this._delete.values()).map((u) => u.toHex()),
      compute: Array.from(this.compute.entries()).map(([user, programIds]) => ({
        user: user.toHex(),
        programIds: Array.from(programIds),
      })),
    };
  }

  static from(value: PermissionsProtobuf): ValuesPermissions {
    assertIsDefined(value.owner, "owner");

    const owner = UserId.fromProto(value.owner);
    const retrieve = new Set(value.retrieve.map((id) => UserId.fromProto(id)));
    const update = new Set(value.update.map((id) => UserId.fromProto(id)));
    const _delete = new Set(value.delete.map((id) => UserId.fromProto(id)));

    const compute = new Map<UserId, Set<ProgramId>>();

    for (const perms of value.compute) {
      assertIsDefined(perms.user, "user");

      compute.set(UserId.fromProto(perms.user), new Set(perms.programIds));
    }

    return new ValuesPermissions(owner, retrieve, update, _delete, compute);
  }
}

export class ValuesPermissionsBuilder {
  private constructor(
    private _owner?: UserId,
    private _retrieve: Set<UserId> = new Set(),
    private _update: Set<UserId> = new Set(),
    private _delete: Set<UserId> = new Set(),
    private _compute: Map<UserId, Set<ProgramId>> = new Map(),
  ) {}

  owner(id: UserId): this {
    this._owner = id;
    return this;
  }

  grantRetrieve(id: UserId): this {
    this._retrieve.add(id);
    return this;
  }

  grantUpdate(id: UserId): this {
    this._update.add(id);
    return this;
  }

  grantDelete(id: UserId): this {
    this._delete.add(id);
    return this;
  }

  grantCompute(id: UserId, program: ProgramId): this {
    const entry = this._compute.get(id) ?? new Set<ProgramId>();
    entry.add(program);
    this._compute.set(id, entry);
    return this;
  }

  permissions(permissions: ValuesPermissions): this {
    this._owner = permissions.owner;
    this._retrieve = permissions.retrieve;
    this._update = permissions.update;
    this._delete = permissions.update;
    this._compute = permissions.compute;
    return this;
  }

  build(): ValuesPermissions {
    assertIsDefined(this._owner, "_owner");

    return new ValuesPermissions(
      this._owner,
      this._retrieve,
      this._update,
      this._delete,
      this._compute,
    );
  }

  static default(owner: UserId): ValuesPermissions {
    return new ValuesPermissions(
      owner,
      new Set([owner]),
      new Set([owner]),
      new Set([owner]),
      new Map(),
    );
  }

  static init(): ValuesPermissionsBuilder {
    return new ValuesPermissionsBuilder();
  }
}
