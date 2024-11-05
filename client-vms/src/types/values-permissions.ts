import { create } from "@bufbuild/protobuf";
import {
  type Permissions as PermissionsProtobuf,
  PermissionsSchema,
} from "#/gen-proto/nillion/permissions/v1/permissions_pb";
import type { ProgramId } from "#/types/types";
import { UserId } from "#/types/user-id";

export class ValuesPermissions {
  constructor(
    public owner: UserId,
    public readonly retrieve: Set<UserId>,
    public readonly update: Set<UserId>,
    public readonly _delete: Set<UserId>,
    public readonly compute: Map<UserId, ProgramId[]>,
  ) {}

  toProto(): PermissionsProtobuf {
    return create(PermissionsSchema, {
      owner: this.owner.toProto(),
      retrieve: Array.from(this.retrieve.values()).map((e) => e.toProto()),
      update: Array.from(this.update.values()).map((e) => e.toProto()),
      delete: Array.from(this._delete.values()).map((e) => e.toProto()),
    });
  }

  static from(value: PermissionsProtobuf): ValuesPermissions {
    const owner = UserId.fromProto(value.owner!);
    const retrieve = new Set(value.retrieve.map((id) => UserId.fromProto(id)));
    const update = new Set(value.update.map((id) => UserId.fromProto(id)));
    const _delete = new Set(value.delete.map((id) => UserId.fromProto(id)));

    const compute = new Map<UserId, ProgramId[]>();

    for (const perms of value.compute) {
      compute.set(UserId.fromProto(perms.user!), perms.programIds);
    }

    return new ValuesPermissions(owner, retrieve, update, _delete, compute);
  }
}

export class ValuesPermissionsBuilder {
  private constructor(
    private _owner?: UserId,
    private readonly _retrieve: UserId[] = [],
    private readonly _update: UserId[] = [],
    private readonly _delete: UserId[] = [],
    private readonly _compute: [UserId, ProgramId[]][] = [],
  ) {}

  owner(id: UserId): this {
    this._owner = id;
    return this;
  }

  grantRetrieve(id: UserId): this {
    this._retrieve.push(id);
    return this;
  }

  grantUpdate(id: UserId): this {
    this._update.push(id);
    return this;
  }

  grantDelete(id: UserId): this {
    this._delete.push(id);
    return this;
  }

  grantCompute(id: UserId, programs: ProgramId[]): this {
    this._compute.push([id, programs]);
    return this;
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
}
