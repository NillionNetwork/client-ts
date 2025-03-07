import {
  type EcdsaSignature,
  type EddsaSignature,
  NadaValue,
  NadaValues,
} from "@nillion/client-wasm";
import { secp256k1 } from "@noble/curves/secp256k1";
import { sha256 } from "@noble/hashes/sha2";
import { describe, expect, it } from "vitest";
import { type NadaValuesRecord, PartyId } from "#/types";

const numericTypes = [
  "SecretInteger",
  "SecretUnsignedInteger",
  "PublicInteger",
  "PublicUnsignedInteger",
];

const booleanTypes = ["SecretBoolean", "PublicBoolean"];

const ecdsaPrivateKey = secp256k1.utils.randomPrivateKey();

const byteArray = Uint8Array.from([
  186, 236, 247, 198, 7, 225, 204, 147, 116, 47, 207, 45, 149, 49, 212, 168,
  136, 145, 98, 150, 152, 122, 50, 91, 141, 227, 182, 233, 8, 245, 72, 38,
]);

const privateKey = Uint8Array.from([
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1,
]);

const pubKey = Uint8Array.from([
  186, 236, 247, 198, 7, 225, 204, 147, 116, 47, 207, 45, 149, 49, 212, 168,
  136, 145, 98, 150, 152, 122, 50, 91, 141, 227, 182, 233, 8, 245, 72, 38, 56,
]);

const storeId = Uint8Array.from([
  186, 236, 247, 198, 7, 225, 204, 147, 116, 47, 207, 45, 149, 49, 212, 168,
]);

const eddsaSignatureR = Uint8Array.from([
  228, 118, 63, 53, 138, 161, 20, 164, 93, 86, 233, 11, 211, 204, 186, 63, 255,
  174, 220, 173, 222, 58, 64, 79, 108, 173, 130, 1, 134, 44, 244, 104,
]);

const eddsaSignatureZ = Uint8Array.from([
  137, 73, 233, 168, 34, 64, 148, 185, 177, 91, 184, 21, 246, 82, 65, 207, 83,
  158, 44, 181, 199, 94, 83, 178, 88, 238, 210, 220, 10, 49, 154, 1,
]);

const eddsaPublicKey = Uint8Array.from([
  186, 236, 247, 198, 7, 225, 204, 147, 116, 47, 207, 45, 149, 49, 212, 168,
  136, 145, 98, 150, 152, 122, 50, 91, 141, 227, 182, 233, 8, 245, 72, 38,
]);

const digestMessage = "A deep message with a deep number: 42";

const data = [
  {
    type: "PublicInteger",
    name: "a",
    value: -42,
    nadaValue: NadaValue.new_public_integer("-42"),
  },
  {
    type: "PublicUnsignedInteger",
    name: "b",
    value: 42,
    nadaValue: NadaValue.new_public_unsigned_integer("42"),
  },
  {
    type: "PublicBoolean",
    name: "c",
    value: true,
    nadaValue: NadaValue.new_public_boolean(true),
  },
  {
    type: "SecretInteger",
    name: "d",
    value: -100,
    nadaValue: NadaValue.new_secret_integer("-100"),
  },
  {
    type: "SecretUnsignedInteger",
    name: "e",
    value: 100,
    nadaValue: NadaValue.new_secret_unsigned_integer("100"),
  },
  {
    type: "SecretBoolean",
    name: "f",
    value: true,
    nadaValue: NadaValue.new_secret_boolean(true),
  },
  {
    type: "SecretBlob",
    name: "g",
    value: Uint8Array.from([1, 2, 3]),
    nadaValue: NadaValue.new_secret_blob(Uint8Array.from([1, 2, 3])),
  },
  {
    type: "EcdsaPrivateKey",
    name: "h",
    value: ecdsaPrivateKey,
    nadaValue: NadaValue.new_ecdsa_private_key(ecdsaPrivateKey),
  },
  {
    type: "EcdsaDigestMessage",
    name: "i",
    value: sha256(digestMessage),
    nadaValue: NadaValue.new_ecdsa_digest_message(sha256(digestMessage)),
  },
  {
    type: "EcdsaSignature",
    name: "j",
    value: byteArray,
    nadaValue: NadaValue.new_ecdsa_signature(byteArray, byteArray),
  },
  {
    type: "EcdsaPublicKey",
    name: "k",
    value: pubKey,
    nadaValue: NadaValue.new_ecdsa_public_key(pubKey),
  },
  {
    type: "StoreId",
    name: "l",
    value: storeId,
    nadaValue: NadaValue.new_store_id(storeId),
  },
  {
    type: "EddsaPrivateKey",
    name: "m",
    value: privateKey,
    nadaValue: NadaValue.new_eddsa_private_key(privateKey),
  },
  {
    type: "EddsaMessage",
    name: "n",
    value: sha256(digestMessage),
    nadaValue: NadaValue.new_eddsa_message(sha256(digestMessage)),
  },
  {
    type: "EddsaSignature",
    name: "o",
    r: eddsaSignatureR,
    z: eddsaSignatureZ,
    nadaValue: NadaValue.new_eddsa_signature(eddsaSignatureR, eddsaSignatureZ),
  },
  {
    type: "EddsaPublicKey",
    name: "p",
    value: eddsaPublicKey,
    nadaValue: NadaValue.new_eddsa_public_key(eddsaPublicKey),
  },
];

describe("Wasm compatability", () => {
  describe("NadaValues", () => {
    const values = new NadaValues();

    data.forEach((test, index) => {
      describe(test.type, () => {
        it("can insert into NadaValues", () => {
          values.insert(test.name, test.nadaValue);
          expect(values).toHaveLength(index + 1);
        });

        it("can retrieve from NadaValues", () => {
          const record = values.to_record() as unknown as NadaValuesRecord;
          const actual = record[test.name];
          expect(actual).toBeDefined();
          expect(actual?.type).toEqual(test.type);

          let value: unknown = actual?.value;
          if (actual?.type === "EcdsaSignature") {
            const signature = actual?.value as EcdsaSignature;
            expect(signature.r()).toEqual(test.value);
            expect(signature.s()).toEqual(test.value);
          } else if (actual?.type === "EddsaSignature") {
            const signature = actual?.value as EddsaSignature;
            expect(signature.r()).toEqual(test.r);
            expect(signature.z()).toEqual(test.z);
          } else {
            if (numericTypes.includes(actual?.type)) {
              value = Number(actual?.value);
            }
            if (booleanTypes.includes(actual?.type)) {
              value = Boolean(actual?.value);
            }
            expect(value).toEqual(test.value);
          }
        });
      });
    });
  });

  describe("PartyId", () => {
    const expectedBase58 = "uuz3xgfhzJN0L88tlTHUqIiRYpaYejJbjeO26Qj1SCY=";
    it("can construct a party id from a uint array", () => {
      const id = PartyId.from(byteArray);
      expect(id.toBase64()).toEqual(expectedBase58);
      expect(id.toWasm().to_byte_array()).toEqual(byteArray);
    });
  });
});
