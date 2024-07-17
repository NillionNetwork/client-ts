import { z } from "zod";
import * as Wasm from "@nillion/wasm";

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
  .number()
  .int()
  .nonnegative()
  .brand<"IntegerPublicUnsigned">();
export type IntegerPublicUnsigned = z.infer<typeof IntegerPublicUnsigned>;

export const IntegerSecret = z.number().int().brand<"IntegerSecret">();
export type IntegerSecret = z.infer<typeof IntegerSecret>;

export const IntegerSecretUnsigned = z
  .number()
  .int()
  .nonnegative()
  .brand<"IntegerSecretUnsigned">();
export type IntegerSecretUnsigned = z.infer<typeof IntegerSecretUnsigned>;

export type NadaWrappedValue = Uint8Array | boolean | number | bigint;

export class NadaValue<T extends NadaWrappedValue = NadaWrappedValue> {
  private constructor(
    public type: NadaValueType,
    public data: T,
  ) {}

  toString(): string {
    return `NadaValue(type=${this.type})`;
  }

  toWasm(): Wasm.NadaValue {
    switch (this.type) {
      case NadaValueType.enum.BlobSecret:
        return Wasm.NadaValue.new_secret_blob(this.data as Uint8Array);

      case NadaValueType.enum.BooleanSecret:
        throw "return Wasm.NadaValue.new_secret_boolean(this.data as boolean);";

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
        throw "return NadaValue.createBooleanSecret(wasm.xyz())";
      }

      case NadaValueType.enum.IntegerPublic: {
        return NadaValue.createIntegerPublic(wasm.to_integer());
      }

      case NadaValueType.enum.IntegerPublicUnsigned: {
        return NadaValue.createIntegerPublicUnsigned(wasm.to_integer());
      }

      case NadaValueType.enum.IntegerSecret: {
        return NadaValue.createIntegerSecret(wasm.to_integer());
      }

      case NadaValueType.enum.IntegerSecretUnsigned: {
        return NadaValue.createIntegerSecretUnsigned(wasm.to_integer());
      }
    }
  }

  static createBlobSecret(
    data: BlobSecret | Uint8Array,
  ): NadaValue<BlobSecret> {
    return new NadaValue<BlobSecret>(
      NadaValueType.enum.BlobSecret,
      BlobSecret.parse(data),
    );
  }

  static createBooleanSecret(
    data: BooleanSecret | boolean,
  ): NadaValue<BooleanSecret> {
    return new NadaValue<BooleanSecret>(
      NadaValueType.enum.BooleanSecret,
      BooleanSecret.parse(data),
    );
  }

  static createIntegerPublic(
    data: IntegerPublic | number | string,
  ): NadaValue<IntegerPublic> {
    return new NadaValue<IntegerPublic>(
      NadaValueType.enum.IntegerPublic,
      IntegerPublic.parse(Number(data)),
    );
  }

  static createIntegerPublicUnsigned(
    data: IntegerPublicUnsigned | number | string,
  ): NadaValue<IntegerPublicUnsigned> {
    return new NadaValue<IntegerPublicUnsigned>(
      NadaValueType.enum.IntegerPublicUnsigned,
      IntegerPublicUnsigned.parse(Number(data)),
    );
  }

  static createIntegerSecret(
    data: IntegerSecret | number | string,
  ): NadaValue<IntegerSecret> {
    return new NadaValue<IntegerSecret>(
      NadaValueType.enum.IntegerSecret,
      IntegerSecret.parse(Number(data)),
    );
  }

  static createIntegerSecretUnsigned(
    data: IntegerSecretUnsigned | number | string | bigint,
  ): NadaValue<IntegerSecretUnsigned> {
    return new NadaValue<IntegerSecretUnsigned>(
      NadaValueType.enum.IntegerSecretUnsigned,
      IntegerSecretUnsigned.parse(Number(data)),
    );
  }
}
