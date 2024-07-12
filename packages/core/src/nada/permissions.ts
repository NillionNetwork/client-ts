import { PartyId, ProgramId } from "../types";
import * as Wasm from "@nillion/client-wasm";

export type UserPermissions = {
  delete: boolean;
  retrieve: boolean;
  update: boolean;
  compute: boolean;
};

export class Permissions {
  private computeAcl = new Map<PartyId, Set<ProgramId>>();
  private deleteAcl = new Set<PartyId>();
  private retrieveAcl = new Set<PartyId>();
  private updateAcl = new Set<PartyId>();

  private constructor() {}

  allowCompute(users: PartyId | PartyId[], program: ProgramId): Permissions {
    const listOfUsers = Array.isArray(users) ? users : [users];
    for (const user of listOfUsers) {
      const programs = this.computeAcl.get(user) ?? new Set();
      programs.add(program);
      this.computeAcl.set(user, programs);
    }
    return this;
  }

  allowDelete(users: PartyId | PartyId[]): Permissions {
    if (Array.isArray(users)) {
      users.forEach(this.deleteAcl.add);
    } else {
      this.deleteAcl.add(users);
    }
    return this;
  }

  allowRetrieve(users: PartyId | PartyId[]): Permissions {
    if (Array.isArray(users)) {
      users.forEach(this.retrieveAcl.add);
    } else {
      this.retrieveAcl.add(users);
    }
    return this;
  }

  allowUpdate(users: PartyId | PartyId[]): Permissions {
    if (Array.isArray(users)) {
      users.forEach(this.updateAcl.add);
    } else {
      this.updateAcl.add(users);
    }
    return this;
  }

  getPermissionsByUser(user: PartyId): UserPermissions {
    return {
      compute: this.computeAcl.has(user),
      delete: this.deleteAcl.has(user),
      retrieve: this.retrieveAcl.has(user),
      update: this.updateAcl.has(user),
    };
  }

  isComputeAllowed(user: PartyId, program: ProgramId): boolean {
    const permissions = this.computeAcl.get(user);
    return permissions ? permissions.has(program) : false;
  }

  isDeleteAllowed(user: PartyId): boolean {
    return this.deleteAcl.has(user);
  }

  isRetrieveAllowed(user: PartyId): boolean {
    return this.retrieveAcl.has(user);
  }

  isUpdateAllowed(user: PartyId): boolean {
    return this.updateAcl.has(user);
  }

  toWasm(): Wasm.Permissions {
    const asWasm = new Wasm.Permissions();

    asWasm.add_delete_permissions(Array.from(this.deleteAcl));
    asWasm.add_update_permissions(Array.from(this.updateAcl));
    asWasm.add_retrieve_permissions(Array.from(this.retrieveAcl));

    const computePermissions = new Map<PartyId, ProgramId[]>();
    this.computeAcl.forEach((programs, user) =>
      computePermissions.set(user, Array.from(programs)),
    );
    asWasm.add_compute_permissions(computePermissions);

    return asWasm;
  }

  static create(): Permissions {
    return new Permissions();
  }

  static createDefaultForUser(user: PartyId): Permissions {
    return new Permissions()
      .allowRetrieve(user)
      .allowUpdate(user)
      .allowDelete(user);
  }
}
