import { NadaValue } from "@nillion/client-wasm";
import { beforeAll, describe, expect, it } from "vitest";
import { ZodError } from "zod";
import { createSignerFromKey } from "#/payment";
import type { ProgramId, Uuid } from "#/types";
import { type ValuesPermissions, ValuesPermissionsBuilder } from "#/types";
import { type VmClient, VmClientBuilder } from "#/vm";
import { Env, PrivateKeyPerSuite, loadProgram } from "./helpers";

describe("Client", () => {
  let client: VmClient;

  beforeAll(async () => {
    const signer = await createSignerFromKey(PrivateKeyPerSuite.VmClient);

    client = await new VmClientBuilder()
      .seed("tests")
      .bootnodeUrl(Env.bootnodeUrl)
      .chainUrl(Env.nilChainUrl)
      .signer(signer)
      .build();
  });

  it("builder rejects if missing values", async () => {
    try {
      const builder = new VmClientBuilder();
      await builder.build();
    } catch (e) {
      expect(e).toBeInstanceOf(ZodError);
      expect((e as ZodError).issues).toHaveLength(4);
    }
    expect.assertions(2);
  });

  it("can query pool status", async () => {
    const status = await client.queryPoolStatus().build().invoke();
    expect(status.offsets.length).toBeGreaterThan(0);
  });

  describe.sequential("values", () => {
    const fooExpectedName = "foo";
    const fooExpectedValue = "42";
    const fooExpectedUpdatedValue = "39";
    const barExpectedName = "bar";
    const barExpectedValue = Uint8Array.from([45, 18, 122]);
    const bazExpectedName = "baz";
    const bazExpectedValue = "true";
    const publicKeyName = "publicKey";
    const publicKeyExpectedValue = Uint8Array.from([
      186, 236, 247, 198, 7, 225, 204, 147, 116, 47, 207, 45, 149, 49, 212, 168,
      136, 145, 98, 150, 152, 122, 50, 91, 141, 227, 182, 233, 8, 245, 72, 38,
      56
    ]);
    const storeIdName = "storeId";
    const storeIdExpectedValue = Uint8Array.from([
      186, 236, 247, 198, 7, 225, 204, 147, 116, 47, 207, 45, 149, 49, 212, 168,
    ]);

    let expectedPermissions: ValuesPermissions;
    let expectedId: string;

    it("can store", async () => {
      expectedId = await client
        .storeValues()
        .ttl(1)
        .value(fooExpectedName, NadaValue.new_secret_integer(fooExpectedValue))
        .value(barExpectedName, NadaValue.new_secret_blob(barExpectedValue))
        .value(bazExpectedName, NadaValue.new_secret_boolean((bazExpectedValue === "true")))
        .value(publicKeyName, NadaValue.new_ecdsa_public_key(publicKeyExpectedValue))
        .value(storeIdName, NadaValue.new_store_id(storeIdExpectedValue))
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

      const foo = data[fooExpectedName]!;
      expect(foo).toBeDefined();
      expect(foo.type).toBe("SecretInteger");
      expect(foo.value).toBe(fooExpectedValue);

      const bar = data[barExpectedName]!;
      expect(bar).toBeDefined();
      expect(bar.type).toBe("SecretBlob");
      expect(bar.value).toStrictEqual(barExpectedValue);

      const baz = data[bazExpectedName]!;
      expect(baz).toBeDefined();
      expect(baz.type).toBe("SecretBoolean");
      expect(baz.value).toStrictEqual(bazExpectedValue);

      const publicKey = data[publicKeyName]!;
      expect(publicKey).toBeDefined();
      expect(publicKey.type).toBe("EcdsaPublicKey");
      expect(publicKey.value).toStrictEqual(publicKeyExpectedValue);

      const storeId = data[storeIdName]!;
      expect(storeId).toBeDefined();
      expect(storeId.type).toBe("StoreId");
      expect(storeId.value).toStrictEqual(storeIdExpectedValue);
    });

    it("can update", async () => {
      await client
        .storeValues()
        .ttl(1)
        .id(expectedId)
        .value(
          fooExpectedName,
          NadaValue.new_secret_integer(fooExpectedUpdatedValue),
        )
        .build()
        .invoke();

      const data = await client
        .retrieveValues()
        .id(expectedId)
        .build()
        .invoke();

      const values = data[fooExpectedName]!;
      expect(values.type).toBe("SecretInteger");
      expect(values.value).toBe(fooExpectedUpdatedValue);
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

  describe.sequential("compute", () => {
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

    it("missing compute permissions", async () => {
      const storeId = await client
        .storeValues()
        .ttl(1)
        .value("B", NadaValue.new_secret_integer("4"))
        .build()
        .invoke();

      await expect(() =>
        client
          .invokeCompute()
          .program(programId)
          .inputParty("Party1", client.id)
          .outputParty("Party1", [client.id])
          .computeTimeValues("A", NadaValue.new_secret_integer("1"))
          .valueIds(storeId)
          .build()
          .invoke(),
      ).rejects.toThrowError(
        "[permission_denied] user does not have permissions for action",
      );
    });
  });
});
