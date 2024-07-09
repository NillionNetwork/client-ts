import { Log } from "../logger";
import { NadaValue } from "./value";
import * as Wasm from "@nillion/client-wasm";

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
