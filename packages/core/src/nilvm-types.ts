import * as Wasm from "@nillion/client-wasm";
import { Log } from "./logger";
import { Days, TxHash } from "@nillion/types";
import { z } from "zod";

export const OperationType = z.enum(["StoreValues"]);
export type OperationType = z.infer<typeof OperationType>;

export class Operation {
  private constructor(
    public type: OperationType,
    public values: NadaValues,
    public ttl: Days,
  ) {}

  toString(): string {
    return `Operation(type=${this.type},ttl=${this.ttl},values=${this.values.toString()})`;
  }

  toWasm(): Wasm.Operation {
    switch (this.type) {
      case OperationType.enum.StoreValues:
        return Wasm.Operation.store_values(this.values.toWasm(), this.ttl);
      default:
        throw `unimplemented toWasm type: ${this.type}`;
    }
  }

  static storeValues(values: NadaValues, ttl: Days): Operation {
    return new Operation(OperationType.enum.StoreValues, values, ttl);
  }
}

export class NadaValues {
  private values: Map<string, NadaValue> = new Map();

  private constructor() {}

  insert(name: string, value: NadaValue): NadaValues {
    Log(`insert ${name}=${value}`);

    if (this.values.get(name)) {
      Log(`NadaValues ${name} overwritten`);
    }

    this.values.set(name, value);
    return this;
  }

  toString(): string {
    const values = JSON.stringify(this.values);
    return `NadaValues(${values})`;
  }

  toWasm(): Wasm.NadaValues {
    const wasmValues = new Wasm.NadaValues();
    for (const [key, value] of this.values) {
      const wasmValue = value.toWasm();
      wasmValues.insert(key, wasmValue);
    }

    return wasmValues;
  }

  static create(): NadaValues {
    return new NadaValues();
  }
}

const NadaValueType = z.enum(["SecretInteger", "SecretBlob"]);
type NadaValueType = z.infer<typeof NadaValueType>;

export class NadaValue {
  private constructor(
    private type: NadaValueType,
    private value: unknown,
  ) {}

  toString(): string {
    return `NadaValue(type=${this.type},value=${this.value})`;
  }

  toWasm(): Wasm.NadaValue {
    switch (this.type) {
      case NadaValueType.enum.SecretInteger:
        return Wasm.NadaValue.new_secret_integer(String(this.value));
      case NadaValueType.enum.SecretBlob:
        return Wasm.NadaValue.new_secret_blob(this.value as Uint8Array);
      default:
        throw `unimplemented toWasm type: ${this.type}`;
    }
  }

  // TODO(tim): how big will these go? Does it need to be `number | string | bigint`?
  static newSecretInteger(data: number): NadaValue {
    return new NadaValue(NadaValueType.enum.SecretInteger, data);
  }

  static newSecretBlob(data: Uint8Array) {
    return new NadaValue(NadaValueType.enum.SecretBlob, data);
  }
}

// to avoid exposing wasm types outside of core, the wasm quote is current held as
// unknown on the TS PriceQuote object until additional functionality is exposed in
// our wasm artefact to allow for the reconstruction of a quote object.
export const toWasmPaymentReceipt = (
  quote: unknown,
  hash: TxHash,
): Wasm.PaymentReceipt =>
  new Wasm.PaymentReceipt(quote as Wasm.PriceQuote, hash);
