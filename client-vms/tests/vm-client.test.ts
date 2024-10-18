import { describe, expect } from "@jest/globals";
import { ZodError } from "zod";

import { createSignerFromKey } from "@nillion/client-vms/payment";
import { VmClient, VmClientBuilder } from "@nillion/client-vms/vm";
import { NadaValue } from "@nillion/client-wasm";

import { Env, PrivateKeyPerSuite } from "./helpers";

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
      const permissions = await client
        .retrievePermissions()
        .id(expectedId)
        .build()
        .invoke();

      expect(permissions).toBeDefined();
      expect(permissions.ownerUserId).toEqual(client.config.id);
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
});
