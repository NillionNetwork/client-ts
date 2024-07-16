import { ProgramId, UserId } from "../types";
import * as Wasm from "@nillion/wasm";
import { Log } from "../logger";

export type UserPermissions = {
  delete: boolean;
  retrieve: boolean;
  update: boolean;
  compute: boolean;
};

export class Permissions {
  computeAcl = new Map<UserId, Set<ProgramId>>();
  deleteAcl = new Set<UserId>();
  retrieveAcl = new Set<UserId>();
  updateAcl = new Set<UserId>();

  private constructor() {}

  allowCompute(users: UserId | UserId[], program: ProgramId): Permissions {
    const listOfUsers = Array.isArray(users) ? users : [users];
    for (const user of listOfUsers) {
      const programs = this.computeAcl.get(user) ?? new Set();
      programs.add(program);
      this.computeAcl.set(user, programs);
    }
    return this;
  }

  allowDelete(users: UserId | UserId[]): Permissions {
    if (Array.isArray(users)) {
      users.forEach(this.deleteAcl.add);
    } else {
      this.deleteAcl.add(users);
    }
    return this;
  }

  allowRetrieve(users: UserId | UserId[]): Permissions {
    if (Array.isArray(users)) {
      users.forEach(this.retrieveAcl.add);
    } else {
      this.retrieveAcl.add(users);
    }
    return this;
  }

  allowUpdate(users: UserId | UserId[]): Permissions {
    if (Array.isArray(users)) {
      users.forEach(this.updateAcl.add);
    } else {
      this.updateAcl.add(users);
    }
    return this;
  }

  getPermissionsByUser(user: UserId): UserPermissions {
    return {
      compute: this.computeAcl.has(user),
      delete: this.deleteAcl.has(user),
      retrieve: this.retrieveAcl.has(user),
      update: this.updateAcl.has(user),
    };
  }

  isComputeAllowed(user: UserId, program: ProgramId): boolean {
    const permissions = this.computeAcl.get(user);
    return permissions ? permissions.has(program) : false;
  }

  isDeleteAllowed(user: UserId): boolean {
    return this.deleteAcl.has(user);
  }

  isRetrieveAllowed(user: UserId): boolean {
    return this.retrieveAcl.has(user);
  }

  isUpdateAllowed(user: UserId): boolean {
    return this.updateAcl.has(user);
  }

  into(): Wasm.Permissions {
    const wasm = new Wasm.Permissions();
    wasm.add_update_permissions(Array.from(this.updateAcl));
    wasm.add_delete_permissions(Array.from(this.deleteAcl));
    wasm.add_retrieve_permissions(Array.from(this.retrieveAcl));

    const computeAcl: Map<UserId, ProgramId[]> = new Map();
    this.computeAcl.forEach((programs, user) => {
      computeAcl.set(user, Array.from(programs));
    });

    wasm.add_compute_permissions(computeAcl);
    return wasm;
  }

  static from(_wasm: Wasm.Permissions): Permissions {
    Log("Converting Wasm.Permissions into native permissions not supported.");
    return Permissions.create();
  }

  static create(): Permissions {
    return new Permissions();
  }

  static createDefaultForUser(user: UserId): Permissions {
    return new Permissions()
      .allowRetrieve(user)
      .allowUpdate(user)
      .allowDelete(user);
  }
}
