import { Log } from "../logger";
import { z } from "zod";
import * as Wasm from "@nillion/client-wasm";

export const NadaValueType = z.enum(["SecretInteger", "SecretBlob"]);
export type NadaValueType = z.infer<typeof NadaValueType>;

export interface NadaValue {
  type: NadaValueType;
  toWasm: () => Wasm.NadaValue;
}

export class NadaSecretInteger implements NadaValue {
  public type = NadaValueType.enum.SecretInteger;

  private constructor(public data: number) {}

  toString(): string {
    return `${this.constructor.name}(data=${this.data})`;
  }

  toInteger(): number {
    return this.data;
  }

  toWasm(): Wasm.NadaValue {
    return Wasm.NadaValue.new_secret_integer(String(this.data));
  }

  // TODO(tim): Does it need to be `number | string | bigint`?
  static create(value: number): NadaSecretInteger {
    return new NadaSecretInteger(value);
  }

  // TODO(tim): need discriminator on the wasm object since all Wasm.NadaValue
  //  have to_integer, to_byte_array, etc, but each is only valid on a specific
  //  nada type
  static from(data: Wasm.NadaValue): NadaSecretInteger {
    return new NadaSecretInteger(Number(data.to_integer()));
  }
}

export class NadaSecretBlob implements NadaValue {
  public type = NadaValueType.enum.SecretBlob;

  private constructor(public data: Uint8Array) {}

  toString(): string {
    return `${this.constructor.name}(data=${this.data})`;
  }

  toByteArray(): Uint8Array {
    return this.data;
  }

  toWasm(): Wasm.NadaValue {
    return Wasm.NadaValue.new_secret_blob(this.data);
  }

  static create(data: Uint8Array): NadaSecretBlob {
    return new NadaSecretBlob(data);
  }

  static from(value: Wasm.NadaValue): NadaSecretBlob {
    return new NadaSecretBlob(value.to_byte_array());
  }
}

export const toTypedNadaValue = <T extends NadaValue>(
  type: NadaValueType,
  value: Wasm.NadaValue,
): T => {
  switch (type) {
    case NadaValueType.enum.SecretInteger:
      return NadaSecretInteger.from(value) as unknown as T;
    case NadaValueType.enum.SecretBlob:
      return NadaSecretBlob.from(value) as unknown as T;
    default:
      throw `conversion not implemented for type ${type}`;
  }
};
