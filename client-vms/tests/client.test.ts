import { NadaValue } from "@nillion/client-wasm";
import { describe, expect, it } from "vitest";
import { ZodError } from "zod";
import type { ProgramId, Uuid } from "#/types/types";
import {
  type ValuesPermissions,
  ValuesPermissionsBuilder,
} from "#/types/values-permissions";
import { VmClientBuilder } from "#/vm/builder";
import type { VmClient } from "#/vm/client";

import { createSignerFromKey } from "#/payment/wallet";
import { Env, PrivateKeyPerSuite, loadProgram } from "./helpers";

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
      .seed("tests")
      .bootnodeUrl(Env.bootnodeUrl)
      .chainUrl(Env.nilChainUrl)
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
    let expectedPermissions: ValuesPermissions;
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
