import { type EddsaSignature, NadaValue } from "@nillion/client-wasm";
import { ed25519 } from "@noble/curves/ed25519";
import { sha256 } from "@noble/hashes/sha2";
import { beforeAll, describe, expect, it } from "vitest";
import { createSignerFromKey } from "#/payment";
import {
  type NadaValuesRecord,
  type Uuid,
  ValuesPermissionsBuilder,
} from "#/types";
import { UpdatePermissionsBuilder, type VmClient, VmClientBuilder } from "#/vm";
import { Env, PrivateKeyPerSuite } from "./helpers";

// This is ignored because NadaValue::new_eddsa_private_key fails for random private keys. This should be fixed
// in nilvm side
describe.skip("Eddsa Signature", () => {
  // Program id
  const teddsaProgramId = "builtin/teddsa_sign";
  // Input store name
  const teddsaKeyName = "teddsa_private_key";
  const teddsaDigestName = "teddsa_digest_message";
  const teddsaSignatureName = "teddsa_signature";
  // Party names
  const teddsaKeyParty = "teddsa_key_party";
  const teddsaDigestParty = "teddsa_digest_message_party";
  const teddsaOutputParty = "teddsa_output_party";

  const privateKey: Uint8Array = ed25519.utils.randomPrivateKey();
  const publicKey: Uint8Array = ed25519.getPublicKey(privateKey);

  let digestMessage: Uint8Array;

  let client: VmClient;

  beforeAll(async () => {
    const signer = await createSignerFromKey(
      PrivateKeyPerSuite.EddsaSignatures,
    );
    digestMessage = sha256("A deep message with a deep number: 42");

    client = await new VmClientBuilder()
      .seed("tests")
      .bootnodeUrl(Env.bootnodeUrl)
      .chainUrl(Env.nilChainUrl)
      .signer(signer)
      .build();
  });

  let privateKeyStoreId: Uuid;
  it("store private key", async () => {
    privateKeyStoreId = await client
      .storeValues()
      .ttl(1)
      .value(teddsaKeyName, NadaValue.new_eddsa_private_key(privateKey))
      .build()
      .invoke();
    expect(privateKeyStoreId).toHaveLength(36);
  });

  it("update private key permissions", async () => {
    const permissions = UpdatePermissionsBuilder.init(client)
      .valuesId(privateKeyStoreId)
      .grantCompute(client.id, teddsaProgramId)
      .build();
    await permissions.invoke();
  });

  it("retrieve private key", async () => {
    const data = await client
      .retrieveValues()
      .id(privateKeyStoreId)
      .build()
      .invoke();

    const values = data[teddsaKeyName]!;
    expect(values).toBeDefined();
    expect(values.type).toBe("EddsaPrivateKey");
    expect(values.value).toEqual(privateKey);
  });

  let digestMessageStoreId: Uuid;
  it("store digest message", async () => {
    const permissions = ValuesPermissionsBuilder.defaultOwner(client.id)
      .grantCompute(client.id, teddsaProgramId)
      .build();
    digestMessageStoreId = await client
      .storeValues()
      .ttl(1)
      .value(teddsaDigestName, NadaValue.new_eddsa_message(digestMessage))
      .permissions(permissions)
      .build()
      .invoke();
    expect(digestMessageStoreId).toHaveLength(36);
  });

  it("retrieve digest message", async () => {
    const data = await client
      .retrieveValues()
      .id(digestMessageStoreId)
      .build()
      .invoke();

    const values = data[teddsaDigestName]!;
    expect(values).toBeDefined();
    expect(values.type).toBe("EddsaDigestMessage");
    expect(values.value).toEqual(digestMessage);
  });

  let computeResultId: Uuid;
  it("sign message", async () => {
    computeResultId = await client
      .invokeCompute()
      .program(teddsaProgramId)
      .inputParty(teddsaKeyParty, client.id)
      .inputParty(teddsaDigestParty, client.id)
      .outputParty(teddsaOutputParty, [client.id])
      .valueIds(privateKeyStoreId, digestMessageStoreId)
      .build()
      .invoke();
    expect(computeResultId).toHaveLength(36);
  });

  let computeResult: NadaValuesRecord;
  it("retrieve signature", async () => {
    computeResult = await client
      .retrieveComputeResult()
      .id(computeResultId)
      .build()
      .invoke();

    const values = computeResult[teddsaSignatureName]!;
    expect(values).toBeDefined();
  });

  it("eddsa verify", async () => {
    const signature = computeResult[teddsaSignatureName]
      ?.value as EddsaSignature;
    expect(ed25519.verify(signature.signature(), digestMessage, publicKey))
      .true;
  });
});
