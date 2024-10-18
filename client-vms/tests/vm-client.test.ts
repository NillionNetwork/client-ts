import { describe, expect } from "@jest/globals";
import { ZodError } from "zod";

import { Permissions as ValuePermissions } from "@nillion/client-vms/gen-proto/nillion/permissions/v1/permissions_pb";
import { createSignerFromKey } from "@nillion/client-vms/payment";
import { ProgramId, Uuid } from "@nillion/client-vms/types";
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
      .seed("test")
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

  describe("compute", () => {
    const name = "addition_division.nada.bin";
    let programId: ProgramId;
    let computeResultId: Uuid;

    it("can upload program", async () => {
      const regex = new RegExp(`^.+\\/${name}$`);
      const program = loadProgram(name);

      programId = await client
        .storeProgram()
        .name(name)
        .program(program)
        .build()
        .invoke();

      expect(programId).toBeTruthy();
      expect(programId).toMatch(regex);
    });

    it("can invoke compute", async () => {
      computeResultId = await client
        .invokeCompute()
        .program(programId)
        .inputParty("Party1", client.config.id)
        .outputParty("Party1", [client.config.id])
        .computeTimeValues("A", NadaValue.new_secret_integer("1"))
        .computeTimeValues("B", NadaValue.new_secret_integer("4"))
        .build()
        .invoke();

      expect(computeResultId).toBeTruthy();
    });

    it("can retrieve compute result", async () => {
      const result = await client
        .retrieveComputeResult()
        .id(computeResultId)
        .build()
        .invoke();

      expect(result).toBeTruthy();
      expect(result.my_output?.value).toBe("3");
    });
  });
});
