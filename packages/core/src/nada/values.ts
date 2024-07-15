import * as Wasm from "@nillion/client-wasm";
import { Log } from "../logger";
import { IntoWasm } from "../wasm";
import { NadaValue } from "./value";

export class NadaValues implements IntoWasm<Wasm.NadaValues> {
  private values: Map<string, NadaValue> = new Map();

  private constructor() {}

  get length() {
    return this.values.size;
  }

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

  into(): Wasm.NadaValues {
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
