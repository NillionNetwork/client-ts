import * as Wasm from "@nillion/client-wasm";

import { Log } from "../logger";
import { ProgramId, UserId } from "../types";

export interface StoreAclForUser {
  user: UserId;
  delete: boolean;
  retrieve: boolean;
  update: boolean;
  compute: boolean;
}

export class StoreAcl {
  private constructor(
    public computeAllowed = new Map<UserId, Set<ProgramId>>(),
    public deleteAllowed = new Set<UserId>(),
    public retrieveAllowed = new Set<UserId>(),
    public updateAllowed = new Set<UserId>(),
  ) {}

  allowCompute(users: UserId | UserId[], program: ProgramId): this {
    const listOfUsers = Array.isArray(users) ? users : [users];
    for (const user of listOfUsers) {
      const programs = this.computeAllowed.get(user) ?? new Set();
      programs.add(program);
      this.computeAllowed.set(user, programs);
    }
    return this;
  }

  allowDelete(users: UserId | UserId[]): this {
    if (Array.isArray(users)) {
      users.forEach((u) => this.deleteAllowed.add(u));
    } else {
      this.deleteAllowed.add(users);
    }
    return this;
  }

  allowRetrieve(users: UserId | UserId[]): this {
    if (Array.isArray(users)) {
      users.forEach((u) => this.retrieveAllowed.add(u));
    } else {
      this.retrieveAllowed.add(users);
    }
    return this;
  }

  allowUpdate(users: UserId | UserId[]): this {
    if (Array.isArray(users)) {
      users.forEach((u) => this.updateAllowed.add(u));
    } else {
      this.updateAllowed.add(users);
    }
    return this;
  }

  getPermissionsByUser(user: UserId): StoreAclForUser {
    return {
      user,
      compute: this.computeAllowed.has(user),
      delete: this.deleteAllowed.has(user),
      retrieve: this.retrieveAllowed.has(user),
      update: this.updateAllowed.has(user),
    };
  }

  isComputeAllowed(user: UserId, program: ProgramId): boolean {
    const permissions = this.computeAllowed.get(user);
    return permissions ? permissions.has(program) : false;
  }

  isDeleteAllowed(user: UserId): boolean {
    return this.deleteAllowed.has(user);
  }

  isRetrieveAllowed(user: UserId): boolean {
    return this.retrieveAllowed.has(user);
  }

  isUpdateAllowed(user: UserId): boolean {
    return this.updateAllowed.has(user);
  }

  into(): Wasm.Permissions {
    const wasm = new Wasm.Permissions();
    wasm.add_update_permissions(Array.from(this.updateAllowed));
    wasm.add_delete_permissions(Array.from(this.deleteAllowed));
    wasm.add_retrieve_permissions(Array.from(this.retrieveAllowed));

    const computeAcl = new Map<UserId, ProgramId[]>();
    this.computeAllowed.forEach((programs, user) => {
      computeAcl.set(user, Array.from(programs));
    });

    wasm.add_compute_permissions(computeAcl);
    return wasm;
  }

  static from(_wasm: Wasm.Permissions): StoreAcl {
    Log("Converting Wasm.Permissions into StoreAcl is not yet supported.");
    return StoreAcl.create();
  }

  static create(): StoreAcl {
    return new StoreAcl();
  }

  static createDefaultForUser(user: UserId): StoreAcl {
    return new StoreAcl()
      .allowRetrieve(user)
      .allowUpdate(user)
      .allowDelete(user);
  }
}
