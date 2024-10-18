import { describe, expect } from "@jest/globals";
import { ZodError } from "zod";

import {
  Permissions,
  Permissions as ValuePermissions,
} from "@nillion/client-vms/gen-proto/nillion/permissions/v1/permissions_pb";
import { createSignerFromKey } from "@nillion/client-vms/payment";
import { ProgramId } from "@nillion/client-vms/types";
import { VmClient, VmClientBuilder } from "@nillion/client-vms/vm";
import { ValuesPermissionsBuilder } from "@nillion/client-vms/vm/operation";
import { NadaValue } from "@nillion/client-wasm";

import { Env, loadProgram, PrivateKeyPerSuite } from "./helpers";

describe("VmClient", () => {
  let client: VmClient;

  it("builder rejects if missing values", async () => {
    try {
      const builder = new VmClientBuilder();
      await builder.build();
    } catch (e) {
      expect(e).toBeInstanceOf(ZodError);
      expect((e as ZodError).issues).toHaveLength(5);
    }
    expect.assertions(2);
  });

  it("builder can create client", async () => {
    const signer = await createSignerFromKey(PrivateKeyPerSuite.VmClient);

    client = await new VmClientBuilder()
      .authTokenTtl(1)
      .seed("test-seed")
      .bootnodeUrl(Env.bootnodeUrl)
      .chainUrl(Env.nilChainJsonRpc)
      .signer(signer)
      .build();

    expect(client).toBeDefined();
  });

  it("can query pool status", async () => {
    const status = await client.queryPoolStatus();
    expect(status.offsets.length).toBeGreaterThan(0);
  });

  describe("values", () => {
    const expectedName = "foo";
    const expectedValue = 42;
    let expectedPermissions: ValuePermissions;
    let expectedId: string;

    it("can store", async () => {
      expectedId = await client
        .storeValues()
        .ttl(1)
        .defaultPermissions()
        .value(
          expectedName,
          NadaValue.new_secret_integer(expectedValue.toString()),
        )
        .build()
        .invoke();
      expect(expectedId).toHaveLength(36);
    });

    it("can retrieve", async () => {
      const nada = await client
        .retrieveValues()
        .id(expectedId)
        .build()
        .invoke();
      const values = nada[expectedName]!;
      expect(values).toBeDefined();
      expect(values.type).toBe("SecretInteger");
      expect(values.value).toBe("42");
    });

    it("can retrieve permissions", async () => {
      expectedPermissions = await client
        .retrievePermissions()
        .id(expectedId)
        .build()
        .invoke();

      expect(expectedPermissions).toBeDefined();
      expect(expectedPermissions.ownerUserId).toEqual(client.config.id);
    });

    it("can update permissions", async () => {
      const owner = expectedPermissions.ownerUserId;
      const updatedPermissions = ValuesPermissionsBuilder.empty()
        .owner(owner)
        .grantDelete(owner)
        .build();

      const permissions = await client
        .updatePermissions()
        .permissions(updatedPermissions)
        .id(expectedId)
        .build()
        .invoke();

      expect(permissions).toBeDefined();
      expect(permissions.ownerUserId).toEqual(owner);
      expect(permissions.deleteAllowedUserIds).toHaveLength(1);
      expect(permissions.retrieveAllowedUserIds).toHaveLength(0);
      expect(permissions.updateAllowedUserIds).toHaveLength(0);
      expect(permissions.computePermissions).toHaveLength(0);
    });

    it("can delete", async () => {
      const actual = await client
        .deleteValues()
        .id(expectedId)
        .build()
        .invoke();
      expect(actual).toEqual(expectedId);
    });
  });

  describe("programs", () => {
    let id: ProgramId;
    it("can store", async () => {
      const name = "simple_shares.nada.bin";
      const regex = new RegExp(`^.+\\/${name}$`);
      const program = loadProgram(name);

      id = await client
        .storeProgram()
        .name(name)
        .program(program)
        .build()
        .invoke();

      console.log(id);
      expect(id).toBeTruthy();
      expect(id).toMatch(regex);
    });
  });
});
