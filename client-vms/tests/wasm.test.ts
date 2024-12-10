import {
  type EcdsaSignature,
  NadaValue,
  NadaValues,
} from "@nillion/client-wasm";
import { describe, expect, it } from "vitest";
import { type NadaValuesRecord, PartyId } from "#/types";

const numeric_types = [
  "SecretInteger",
  "SecretUnsignedInteger",
  "PublicInteger",
  "PublicUnsignedInteger",
];

const byte_array = Uint8Array.from([
  186, 236, 247, 198, 7, 225, 204, 147, 116, 47, 207, 45, 149, 49, 212, 168,
  136, 145, 98, 150, 152, 122, 50, 91, 141, 227, 182, 233, 8, 245, 72, 38,
]);

const digest_message = "A deep message with a deep number: 42";

async function hash(message: string): Promise<Uint8Array> {
  const encoded_message = new TextEncoder().encode(message);
  const hash_buffer = await crypto.subtle.digest("SHA-256", encoded_message);
  return new Uint8Array(hash_buffer);
}

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
    type: "SecretInteger",
    name: "c",
    value: -100,
    nadaValue: NadaValue.new_secret_integer("-100"),
  },
  {
    type: "SecretUnsignedInteger",
    name: "d",
    value: 100,
    nadaValue: NadaValue.new_secret_unsigned_integer("100"),
  },
  {
    type: "SecretBlob",
    name: "e",
    value: Uint8Array.from([1, 2, 3]),
    nadaValue: NadaValue.new_secret_blob(Uint8Array.from([1, 2, 3])),
  },
  {
    type: "EcdsaPrivateKey",
    name: "f",
    value: byte_array,
    nadaValue: NadaValue.new_ecdsa_private_key(byte_array),
  },
  {
    type: "EcdsaDigestMessage",
    name: "g",
    value: await hash(digest_message),
    nadaValue: NadaValue.new_ecdsa_digest_message(await hash(digest_message)),
  },
  {
    type: "EcdsaSignature",
    name: "h",
    value: byte_array,
    nadaValue: NadaValue.new_ecdsa_signature(byte_array, byte_array),
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
          } else {
            if (numeric_types.includes(actual?.type)) {
              value = Number(actual?.value);
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
      const id = PartyId.from(byte_array);
      expect(id.toBase64()).toEqual(expectedBase58);
      expect(id.toWasm().to_byte_array()).toEqual(byte_array);
    });
  });
});
