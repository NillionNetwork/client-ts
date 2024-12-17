import { type EcdsaSignature, NadaValue } from "@nillion/client-wasm";
import { secp256k1 } from "@noble/curves/secp256k1";
import { sha256 } from "@noble/hashes/sha2";
import { beforeAll, describe, expect, it } from "vitest";
import { createSignerFromKey } from "#/payment";
import {
  type NadaValuesRecord,
  type Uuid,
  ValuesPermissionsBuilder,
} from "#/types";
import { type VmClient, VmClientBuilder } from "#/vm";
import { Env, PrivateKeyPerSuite } from "./helpers";

describe("Signature", () => {
  // Program id
  const tecdsaProgramId = "builtin/tecdsa_sign";
  // Input store name
  const tecdsaKeyName = "tecdsa_private_key";
  const tecdsaDigestName = "tecdsa_digest_message";
  const tecdsaSignatureName = "tecdsa_signature";
  // Party names
  const tecdsaKeyParty = "tecdsa_key_party";
  const tecdsaDigestParty = "tecdsa_digest_message_party";
  const tecdsaOutputParty = "tecdsa_output_party";

  const privateKey: Uint8Array = secp256k1.utils.randomPrivateKey();
  const publicKey: Uint8Array = secp256k1.getPublicKey(privateKey);

  let digestMessage: Uint8Array;

  let client: VmClient;

  beforeAll(async () => {
    const signer = await createSignerFromKey(PrivateKeyPerSuite.Signatures);
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
    const permissions = ValuesPermissionsBuilder.defaultOwner(client.id)
      .grantCompute(client.id, tecdsaProgramId)
      .build();
    privateKeyStoreId = await client
      .storeValues()
      .ttl(1)
      .value(tecdsaKeyName, NadaValue.new_ecdsa_private_key(privateKey))
      .permissions(permissions)
      .build()
      .invoke();
    expect(privateKeyStoreId).toHaveLength(36);
  });

  it("retrieve private key", async () => {
    const data = await client
      .retrieveValues()
      .id(privateKeyStoreId)
      .build()
      .invoke();

    const values = data[tecdsaKeyName]!;
    expect(values).toBeDefined();
    expect(values.type).toBe("EcdsaPrivateKey");
    expect(values.value).toEqual(privateKey);
  });

  let digestMessageStoreId: Uuid;
  it("store digest message", async () => {
    const permissions = ValuesPermissionsBuilder.defaultOwner(client.id)
      .grantCompute(client.id, tecdsaProgramId)
      .build();
    digestMessageStoreId = await client
      .storeValues()
      .ttl(1)
      .value(
        tecdsaDigestName,
        NadaValue.new_ecdsa_digest_message(digestMessage),
      )
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

    const values = data[tecdsaDigestName]!;
    expect(values).toBeDefined();
    expect(values.type).toBe("EcdsaDigestMessage");
    expect(values.value).toEqual(digestMessage);
  });

  let computeResultId: Uuid;
  it("sign message", async () => {
    computeResultId = await client
      .invokeCompute()
      .program(tecdsaProgramId)
      .inputParty(tecdsaKeyParty, client.id)
      .inputParty(tecdsaDigestParty, client.id)
      .outputParty(tecdsaOutputParty, [client.id])
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

    const values = computeResult[tecdsaSignatureName]!;
    expect(values).toBeDefined();
  });

  it("ecdsa verify", async () => {
    const signature = computeResult[tecdsaSignatureName]
      ?.value as EcdsaSignature;
    const r = toBigInt(signature.r());
    const s = toBigInt(signature.s());
    expect(secp256k1.verify({ r: r, s: s }, digestMessage, publicKey)).true;
  });
});

function toBigInt(bytes: Uint8Array) {
  let ret = 0n;
  for (const value of bytes.values()) {
    ret = (ret << 8n) + BigInt(value);
  }
  return ret;
}
