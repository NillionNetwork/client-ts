import { ProgramId, UserId } from "../types";
import * as Wasm from "@nillion/wasm";
import { Log } from "../logger";

export interface UserPermissions {
  delete: boolean;
  retrieve: boolean;
  update: boolean;
  compute: boolean;
}

export class Permissions {
  private constructor(
    public computeAcl = new Map<UserId, Set<ProgramId>>(),
    public deleteAcl = new Set<UserId>(),
    public retrieveAcl = new Set<UserId>(),
    public updateAcl = new Set<UserId>(),
  ) {}

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
      users.forEach((u) => this.deleteAcl.add(u));
    } else {
      this.deleteAcl.add(users);
    }
    return this;
  }

  allowRetrieve(users: UserId | UserId[]): Permissions {
    if (Array.isArray(users)) {
      users.forEach((u) => this.retrieveAcl.add(u));
    } else {
      this.retrieveAcl.add(users);
    }
    return this;
  }

  allowUpdate(users: UserId | UserId[]): Permissions {
    if (Array.isArray(users)) {
      users.forEach((u) => this.updateAcl.add(u));
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

    const computeAcl = new Map<UserId, ProgramId[]>();
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
