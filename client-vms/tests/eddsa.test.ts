import { type EddsaSignature, NadaValue } from "@nillion/client-wasm";
import { mod } from "@noble/curves/abstract/modular";
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

type EddsaKeyPair = {
  privateKey: Uint8Array;
  publicKey: Uint8Array;
};

/**
 * Generates a random EdDSA (Ed25519) key pair, consisting of a private key (scalar) and a public key.
 * The private key is generated using a random 32-byte seed, which is then processed and reduced modulo the order of the curve (L) to ensure it is within the valid scalar range.
 * The public key is derived by multiplying the base point of the curve by the valid private scalar.
 *
 * This function ensures that the generated private key is valid according to the Ed25519 curve, and that the corresponding public key can be used for cryptographic operations.
 *
 * @returns {EddsaKeyPair} An object containing the `publicKey` (the public key as a compressed byte array) and the `privateKey` (the private key as a Uint8Array).
 */
function generateRandomEddsaKeyPair(): EddsaKeyPair {
  const seed = ed25519.utils.randomPrivateKey();
  let num = BigInt(`0x${Buffer.from(seed).toString("hex")}`);

  // Apply modulus with L (the order of the Ed25519 curve) to ensure the scalar is valid
  num = mod(num, ed25519.CURVE.n);

  const privateKeyBuffer = Buffer.alloc(32);
  // Split the BigInt into four 64-bit chunks and store them in the private key buffer
  privateKeyBuffer.writeBigUInt64LE(num & BigInt("0xFFFFFFFFFFFFFFFF"), 0);
  privateKeyBuffer.writeBigUInt64LE(
    (num >> BigInt(64)) & BigInt("0xFFFFFFFFFFFFFFFF"),
    8,
  );
  privateKeyBuffer.writeBigUInt64LE(
    (num >> BigInt(128)) & BigInt("0xFFFFFFFFFFFFFFFF"),
    16,
  );
  privateKeyBuffer.writeBigUInt64LE(
    (num >> BigInt(192)) & BigInt("0xFFFFFFFFFFFFFFFF"),
    24,
  );

  return {
    publicKey: ed25519.ExtendedPoint.BASE.multiply(num).toRawBytes(true),
    privateKey: new Uint8Array(privateKeyBuffer),
  };
}

describe("Eddsa Signature", () => {
  // Program id
  const teddsaProgramId = "builtin/teddsa_sign";
  // Input store name
  const teddsaKeyName = "teddsa_private_key";
  const teddsaMessageName = "teddsa_message";
  const teddsaSignatureName = "teddsa_signature";
  // Party names
  const teddsaKeyParty = "teddsa_key_party";
  const teddsaMessageParty = "teddsa_message_party";
  const teddsaOutputParty = "teddsa_output_party";

  const { privateKey, publicKey } = generateRandomEddsaKeyPair();

  let message: Uint8Array;

  let client: VmClient;

  beforeAll(async () => {
    const signer = await createSignerFromKey(
      PrivateKeyPerSuite.EddsaSignatures,
    );
    message = sha256("A deep message with a deep number: 42");

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
      .value(teddsaMessageName, NadaValue.new_eddsa_message(message))
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

    const values = data[teddsaMessageName]!;
    expect(values).toBeDefined();
    expect(values.type).toBe("EddsaMessage");
    expect(values.value).toEqual(message);
  });

  let computeResultId: Uuid;
  it("sign message", async () => {
    computeResultId = await client
      .invokeCompute()
      .program(teddsaProgramId)
      .inputParty(teddsaKeyParty, client.id)
      .inputParty(teddsaMessageParty, client.id)
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
    expect(ed25519.verify(signature.signature(), message, publicKey)).true;
  });
});
