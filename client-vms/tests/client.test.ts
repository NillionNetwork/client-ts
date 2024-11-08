import { Log } from "@nillion/client-vms/logger";
import { createSignerFromKey } from "@nillion/client-vms/payment";
import type { ProgramId, Uuid } from "@nillion/client-vms/types";
import {
  type ValuesPermissions,
  ValuesPermissionsBuilder,
} from "@nillion/client-vms/types";
import { type VmClient, VmClientBuilder } from "@nillion/client-vms/vm";
import { NadaValue } from "@nillion/client-wasm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ZodError } from "zod";
import { Env, PrivateKeyPerSuite, loadProgram } from "./helpers";

describe("Client", () => {
  let client: VmClient;

  beforeAll(async () => {
    const signer = await createSignerFromKey(PrivateKeyPerSuite.VmClient);

    client = await new VmClientBuilder()
      .authTokenTtl(1)
      .seed("tests")
      .bootnodeUrl(Env.bootnodeUrl)
      .chainUrl(Env.nilChainUrl)
      .signer(signer)
      .build();
  });

  afterAll(async () => {
    await new Promise((resolve) => Log.flush(resolve));
  });

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

  it("can query pool status", async () => {
    const status = await client.queryPoolStatus().build().invoke();
    expect(status.offsets.length).toBeGreaterThan(0);
  });

  describe("values", () => {
    const expectedName = "foo";
    const expectedValue = "42";
    const expectedUpdatedValue = "39";
    let expectedPermissions: ValuesPermissions;
    let expectedId: string;

    it("can store", async () => {
      expectedId = await client
        .storeValues()
        .ttl(1)
        .value(expectedName, NadaValue.new_secret_integer(expectedValue))
        .build()
        .invoke();
      expect(expectedId).toHaveLength(36);
    });

    it("can retrieve", async () => {
      const data = await client
        .retrieveValues()
        .id(expectedId)
        .build()
        .invoke();

      const values = data[expectedName]!;
      expect(values).toBeDefined();
      expect(values.type).toBe("SecretInteger");
      expect(values.value).toBe(expectedValue);
    });

    it("can update", async () => {
      await client
        .storeValues()
        .ttl(1)
        .update("ad138eb3-1af2-4e05-ab99-cddb66e923f5")
        .value(expectedName, NadaValue.new_secret_integer(expectedUpdatedValue))
        .build()
        .invoke();

      const data = await client
        .retrieveValues()
        .id("ad138eb3-1af2-4e05-ab99-cddb66e923f5")
        .build()
        .invoke();

      const values = data[expectedName]!;
      expect(values.type).toBe("SecretInteger");
      expect(values.value).toBe(expectedUpdatedValue);
    });

    it("can retrieve permissions", async () => {
      expectedPermissions = await client
        .retrievePermissions()
        .id(expectedId)
        .build()
        .invoke();

      expect(expectedPermissions).toBeDefined();
      expect(expectedPermissions.owner).toEqual(client.id);
      expect(expectedPermissions.retrieve).toContainEqual(client.id);
      expect(expectedPermissions.update).toContainEqual(client.id);
      expect(expectedPermissions._delete).toContainEqual(client.id);
    });

    it("can update permissions", async () => {
      await client
        .updatePermissions()
        .valuesId(expectedId)
        .revokeDelete(client.id)
        .build()
        .invoke();

      const updatedPermissions = await client
        .retrievePermissions()
        .id(expectedId)
        .build()
        .invoke();

      expect(updatedPermissions).toBeDefined();
      expect(updatedPermissions.owner).toEqual(client.id);
      expect(updatedPermissions.retrieve).toContainEqual(client.id);
      expect(updatedPermissions.update).toContainEqual(client.id);
      expect(updatedPermissions._delete).not.toContainEqual(client.id);
    });

    it("can overwrite permissions", async () => {
      const next = ValuesPermissionsBuilder.default(client.id);

      const permissions = await client
        .overwritePermissions()
        .permissions(next)
        .id(expectedId)
        .build()
        .invoke();

      expect(permissions).toBeDefined();
      expect(permissions.owner).toEqual(client.id);
      expect(permissions.retrieve).toContainEqual(client.id);
      expect(permissions.update).toContainEqual(client.id);
      expect(permissions._delete).toContainEqual(client.id);
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
      const program = loadProgram(name);

      programId = await client
        .storeProgram()
        .name(name)
        .program(program)
        .build()
        .invoke();

      expect(programId).toBeTruthy();
    });

    it("can invoke compute", async () => {
      computeResultId = await client
        .invokeCompute()
        .program(programId)
        .inputParty("Party1", client.id)
        .outputParty("Party1", [client.id])
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
