import * as Wasm from "@nillion/client-wasm";

import { Log } from "../logger";
import { NamedValue } from "../types";
import { IntoWasm } from "../wasm";
import { NadaValue } from "./value";

export class NadaValues implements IntoWasm<Wasm.NadaValues> {
  private constructor(private values: Map<string, NadaValue> = new Map()) {}

  get length() {
    return this.values.size;
  }

  insert(name: NamedValue, value: NadaValue): this {
    Log(`Inserting into NadaValues ${name}=`, value);
    if (this.values.get(name)) {
      Log(`Insertion overwrote: ${name}`);
    }
    this.values.set(name, value);
    return this;
  }

  toString(): string {
    const values = Array.from(this.values);
    const stringified = values
      .map(([key, value]) => `${key}=${value.toString()}`)
      .join(",");
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
