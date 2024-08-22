import { z } from "zod";

import * as Wasm from "@nillion/client-wasm";

import { Log } from "../logger";
import { isBigInt, isNumber, isUint8Array } from "../type-guards";

export const NadaValueType = z.enum([
  "SecretString", // not a native nada type but provided for improved DX
  "SecretBlob",
  "SecretBoolean",
  "PublicInteger",
  "PublicIntegerUnsigned",
  "SecretInteger",
  "SecretIntegerUnsigned",
]);
export type NadaValueType = z.infer<typeof NadaValueType>;

export const SecretString = z.string().brand<"SecretString">();
export type SecretString = z.infer<typeof SecretString>;

export const SecretBlob = z.instanceof(Uint8Array).brand<"SecretBlob">();
export type SecretBlob = z.infer<typeof SecretBlob>;

export const SecretBoolean = z.boolean().brand<"SecretBoolean">();
export type SecretBoolean = z.infer<typeof SecretBoolean>;

export const PublicInteger = z.number().int().brand<"PublicInteger">();
export type PublicInteger = z.infer<typeof PublicInteger>;

export const PublicIntegerUnsigned = z
  .bigint()
  .nonnegative()
  .brand<"PublicIntegerUnsigned">();
export type PublicIntegerUnsigned = z.infer<typeof PublicIntegerUnsigned>;

export const SecretInteger = z.number().int().brand<"SecretInteger">();
export type SecretInteger = z.infer<typeof SecretInteger>;

export const SecretIntegerUnsigned = z
  .bigint()
  .nonnegative()
  .brand<"SecretIntegerUnsigned">();
export type SecretIntegerUnsigned = z.infer<typeof SecretIntegerUnsigned>;

export type NadaPrimitiveValue = Uint8Array | string | number | bigint;

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
      case NadaValueType.enum.SecretString: {
        const data = new TextEncoder().encode(this.data as string);
        return Wasm.NadaValue.new_secret_blob(data);
      }

      case NadaValueType.enum.SecretBlob: {
        return Wasm.NadaValue.new_secret_blob(this.data as Uint8Array);
      }

      case NadaValueType.enum.SecretBoolean: {
        throw new Error(
          "return Wasm.NadaValue.new_secret_boolean(this.data as boolean);",
        );
      }

      case NadaValueType.enum.PublicInteger: {
        return Wasm.NadaValue.new_public_integer(String(this.data));
      }

      case NadaValueType.enum.PublicIntegerUnsigned: {
        return Wasm.NadaValue.new_public_unsigned_integer(String(this.data));
      }

      case NadaValueType.enum.SecretInteger: {
        return Wasm.NadaValue.new_secret_integer(String(this.data));
      }

      case NadaValueType.enum.SecretIntegerUnsigned: {
        return Wasm.NadaValue.new_secret_unsigned_integer(String(this.data));
      }
    }
  }

  static fromWasm(type: NadaValueType, wasm: Wasm.NadaValue): NadaValue {
    switch (type) {
      case NadaValueType.enum.SecretString: {
        const copiedFromMemory = Array.from(wasm.to_byte_array());
        const values = Uint8Array.from(copiedFromMemory);
        const data = new TextDecoder().decode(values);
        return NadaValue.createSecretString(data);
      }

      case NadaValueType.enum.SecretBlob: {
        const copiedFromMemory = Array.from(wasm.to_byte_array());
        const values = Uint8Array.from(copiedFromMemory);
        return NadaValue.createSecretBlob(values);
      }

      case NadaValueType.enum.SecretBoolean: {
        throw new Error("return NadaValue.createSecretBoolean(wasm.xyz())");
      }

      case NadaValueType.enum.PublicInteger: {
        const data = wasm.to_integer();
        return NadaValue.createPublicInteger(Number(data));
      }

      case NadaValueType.enum.PublicIntegerUnsigned: {
        const data = wasm.to_integer();
        return NadaValue.createPublicIntegerUnsigned(BigInt(data));
      }

      case NadaValueType.enum.SecretInteger: {
        const data = wasm.to_integer();
        return NadaValue.createSecretInteger(Number(data));
      }

      case NadaValueType.enum.SecretIntegerUnsigned: {
        const data = wasm.to_integer();
        return NadaValue.createSecretIntegerUnsigned(BigInt(data));
      }
    }
  }

  static fromPrimitive(args: {
    data: NadaPrimitiveValue;
    secret: boolean;
  }): NadaValue {
    const { secret } = args;
    let data = args.data;

    if (typeof data === "string") {
      data = new TextEncoder().encode(data);
    }

    if (isUint8Array(data)) {
      if (!secret) {
        Log("NadaValue.fromPrimitive data: Uint8Array is always secret");
      }
      return this.createSecretBlob(data);
    } else if (isBigInt(data)) {
      // bigint is treated as signed only
      return secret
        ? this.createSecretIntegerUnsigned(data)
        : this.createPublicIntegerUnsigned(data);
    } else if (isNumber(data)) {
      return secret
        ? this.createSecretInteger(data)
        : this.createPublicInteger(data);
    } else {
      throw new Error(
        "Invalid NadaValue.fromPrimitive() arguments: " + JSON.stringify(args),
      );
    }
  }

  static createSecretString(data: string): NadaValue {
    return new NadaValue(
      NadaValueType.enum.SecretString,
      SecretString.parse(data),
    );
  }

  static createSecretBlob(data: SecretBlob | Uint8Array): NadaValue {
    return new NadaValue(NadaValueType.enum.SecretBlob, SecretBlob.parse(data));
  }

  static createPublicInteger(data: PublicInteger | number): NadaValue {
    return new NadaValue(
      NadaValueType.enum.PublicInteger,
      PublicInteger.parse(data),
    );
  }

  static createSecretInteger(data: SecretInteger | number): NadaValue {
    return new NadaValue(
      NadaValueType.enum.SecretInteger,
      SecretInteger.parse(data),
    );
  }

  static createPublicIntegerUnsigned(
    data: PublicIntegerUnsigned | bigint,
  ): NadaValue {
    return new NadaValue(
      NadaValueType.enum.PublicIntegerUnsigned,
      PublicIntegerUnsigned.parse(data),
    );
  }

  static createSecretIntegerUnsigned(
    data: SecretIntegerUnsigned | bigint,
  ): NadaValue {
    return new NadaValue(
      NadaValueType.enum.SecretIntegerUnsigned,
      SecretIntegerUnsigned.parse(data),
    );
  }
}
