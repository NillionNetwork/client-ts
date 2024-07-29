import { z } from "zod";
import * as Wasm from "@nillion/client-wasm";
import { isBigInt, isNumber, isUint8Array } from "../type-guards";
import { Log } from "../logger";

export const NadaValueType = z.enum([
  "BlobSecret",
  "BooleanSecret",
  "IntegerPublic",
  "IntegerPublicUnsigned",
  "IntegerSecret",
  "IntegerSecretUnsigned",
]);
export type NadaValueType = z.infer<typeof NadaValueType>;

export const BlobSecret = z.instanceof(Uint8Array).brand<"BlobSecret">();
export type BlobSecret = z.infer<typeof BlobSecret>;

export const BooleanSecret = z.boolean().brand<"BooleanSecret">();
export type BooleanSecret = z.infer<typeof BooleanSecret>;

export const IntegerPublic = z.number().int().brand<"IntegerPublic">();
export type IntegerPublic = z.infer<typeof IntegerPublic>;

export const IntegerPublicUnsigned = z
  .bigint()
  .nonnegative()
  .brand<"IntegerPublicUnsigned">();
export type IntegerPublicUnsigned = z.infer<typeof IntegerPublicUnsigned>;

export const IntegerSecret = z.number().int().brand<"IntegerSecret">();
export type IntegerSecret = z.infer<typeof IntegerSecret>;

export const IntegerSecretUnsigned = z
  .bigint()
  .nonnegative()
  .brand<"IntegerSecretUnsigned">();
export type IntegerSecretUnsigned = z.infer<typeof IntegerSecretUnsigned>;

export type NadaPrimitiveValue = Uint8Array | number | bigint;

export class NadaValue {
  private constructor(
    public type: NadaValueType,
    public data: NadaPrimitiveValue,
  ) {}

  toString(): string {
    return `NadaValue(type=${this.type})`;
  }

  toWasm(): Wasm.NadaValue {
    switch (this.type) {
      case NadaValueType.enum.BlobSecret:
        return Wasm.NadaValue.new_secret_blob(this.data as Uint8Array);

      case NadaValueType.enum.BooleanSecret:
        throw new Error(
          "return Wasm.NadaValue.new_secret_boolean(this.data as boolean);",
        );

      case NadaValueType.enum.IntegerPublic:
        return Wasm.NadaValue.new_public_integer(String(this.data));

      case NadaValueType.enum.IntegerPublicUnsigned:
        return Wasm.NadaValue.new_public_unsigned_integer(String(this.data));

      case NadaValueType.enum.IntegerSecret:
        return Wasm.NadaValue.new_secret_integer(String(this.data));

      case NadaValueType.enum.IntegerSecretUnsigned:
        return Wasm.NadaValue.new_secret_unsigned_integer(String(this.data));
    }
  }

  static fromWasm(type: NadaValueType, wasm: Wasm.NadaValue): NadaValue {
    switch (type) {
      case NadaValueType.enum.BlobSecret: {
        const copiedFromMemory = Array.from(wasm.to_byte_array());
        const values = Uint8Array.from(copiedFromMemory);
        return NadaValue.createBlobSecret(values);
      }

      case NadaValueType.enum.BooleanSecret: {
        throw new Error("return NadaValue.createBooleanSecret(wasm.xyz())");
      }

      case NadaValueType.enum.IntegerPublic: {
        const data = wasm.to_integer();
        return NadaValue.createIntegerPublic(Number(data));
      }

      case NadaValueType.enum.IntegerPublicUnsigned: {
        const data = wasm.to_integer();
        return NadaValue.createIntegerPublicUnsigned(BigInt(data));
      }

      case NadaValueType.enum.IntegerSecret: {
        const data = wasm.to_integer();
        return NadaValue.createIntegerSecret(Number(data));
      }

      case NadaValueType.enum.IntegerSecretUnsigned: {
        const data = wasm.to_integer();
        return NadaValue.createIntegerSecretUnsigned(BigInt(data));
      }
    }
  }

  static fromPrimitive(args: {
    data: NadaPrimitiveValue;
    secret: boolean;
  }): NadaValue {
    const { data, secret } = args;

    if (isUint8Array(data)) {
      if (!secret) {
        Log("NadaValue.fromPrimitive data: Uint8Array is always secret");
      }
      return this.createBlobSecret(data);
    } else if (isBigInt(data)) {
      // bigint is treated as signed only
      return secret
        ? this.createIntegerSecretUnsigned(data)
        : this.createIntegerPublicUnsigned(data);
    } else if (isNumber(data)) {
      return secret
        ? this.createIntegerSecret(data)
        : this.createIntegerPublic(data);
    } else {
      throw new Error(
        "Invalid NadaValue.fromPrimitive() arguments: " + JSON.stringify(args),
      );
    }
  }

  static createBlobSecret(data: BlobSecret | Uint8Array): NadaValue {
    return new NadaValue(NadaValueType.enum.BlobSecret, BlobSecret.parse(data));
  }

  static createIntegerPublic(data: IntegerPublic | number): NadaValue {
    return new NadaValue(
      NadaValueType.enum.IntegerPublic,
      IntegerPublic.parse(data),
    );
  }

  static createIntegerSecret(data: IntegerSecret | number): NadaValue {
    return new NadaValue(
      NadaValueType.enum.IntegerSecret,
      IntegerSecret.parse(data),
    );
  }

  static createIntegerPublicUnsigned(
    data: IntegerPublicUnsigned | bigint,
  ): NadaValue {
    return new NadaValue(
      NadaValueType.enum.IntegerPublicUnsigned,
      IntegerPublicUnsigned.parse(data),
    );
  }

  static createIntegerSecretUnsigned(
    data: IntegerSecretUnsigned | bigint,
  ): NadaValue {
    return new NadaValue(
      NadaValueType.enum.IntegerSecretUnsigned,
      IntegerSecretUnsigned.parse(data),
    );
  }
}
