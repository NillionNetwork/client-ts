import * as Wasm from "@nillion/wasm";
import { Log } from "../logger";
import { IntoWasm } from "../wasm";
import { NadaValue } from "./value";
import { ValueName } from "../types";

export class NadaValues implements IntoWasm<Wasm.NadaValues> {
  private values: Map<string, NadaValue> = new Map();

  private constructor() {}

  get length() {
    return this.values.size;
  }

  insert(name: ValueName, value: NadaValue): NadaValues {
    Log(`insert ${name}=${value}`);

    if (this.values.get(name)) {
      Log(`NadaValues ${name} overwritten`);
    }

    this.values.set(name, value);
    return this;
  }

  toString(): string {
    const values = Array.from(this.values);
    const stringified = values.map(([key, value]) => `${key}=${value}`);
    return `NadaValues([${stringified}])`;
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
