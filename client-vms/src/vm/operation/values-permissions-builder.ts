import { create } from "@bufbuild/protobuf";

import {
  ComputePermissionsSchema,
  Permissions as ValuesPermissions,
  PermissionsSchema,
} from "@nillion/client-vms/gen-proto/nillion/permissions/v1/permissions_pb";
import { ProgramId, UserId } from "@nillion/client-vms/types";

export class ValuesPermissionsBuilder {
  private _ownerUserId?: UserId;
  private readonly _retrieveAllowedUserIds: UserId[] = [];
  private readonly _updateAllowedUserIds: UserId[] = [];
  private readonly _deleteAllowedUserIds: UserId[] = [];
  private readonly _computePermissions: [UserId, ProgramId[]][] = [];

  private constructor() {}

  owner(id: UserId): this {
    this._ownerUserId = id;
    return this;
  }

  grantRetrieve(id: UserId): this {
    this._retrieveAllowedUserIds.push(id);
    return this;
  }

  grantUpdate(id: UserId): this {
    this._updateAllowedUserIds.push(id);
    return this;
  }

  grantDelete(id: UserId): this {
    this._deleteAllowedUserIds.push(id);
    return this;
  }

  grantCompute(id: UserId, programs: ProgramId[]): this {
    this._computePermissions.push([id, programs]);
    return this;
  }

  build(): ValuesPermissions {
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
    return new ValuesPermissionsBuilder()
      .owner(owner)
      .grantUpdate(owner)
      .grantRetrieve(owner)
      .grantUpdate(owner);
  }

  static empty() {
    return new ValuesPermissionsBuilder();
  }
}
