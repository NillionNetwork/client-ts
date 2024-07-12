import * as Wasm from "@nillion/client-wasm";
import { Days } from "./types";
import { z } from "zod";
import { NadaValues, ProgramBindings } from "./nada";

export const OperationType = z.enum([
  "Compute",
  "RetrieveValue",
  "StoreValues",
]);
export type OperationType = z.infer<typeof OperationType>;

export class Operation {
  // TODO(tim): not all quote request operation types need the same parameters, eg retrieve doesn't need values or ttl
  private constructor(
    public type: OperationType,
    public values: NadaValues,
    public ttl: Days,
    public bindings: ProgramBindings,
  ) {}

  toString(): string {
    return `Operation(type=${this.type},ttl=${this.ttl},values=${this.values.toString()})`;
  }

  toWasm(): Wasm.Operation {
    switch (this.type) {
      case OperationType.enum.Compute:
        return Wasm.Operation.compute(this.bindings.id, this.values.toWasm());

      case OperationType.enum.StoreValues:
        return Wasm.Operation.store_values(this.values.toWasm(), this.ttl);

      case OperationType.enum.RetrieveValue:
        return Wasm.Operation.retrieve_value();

      default:
        throw `unsupported wasm conversion for OperationType: ${this.type}`;
    }
  }

  static compute(bindings: ProgramBindings, values: NadaValues): Operation {
    return new Operation(
      OperationType.enum.Compute,
      values,
      Days.parse(1),
      bindings,
    );
  }

  static storeValues(values: NadaValues, ttl: Days): Operation {
    if (values.length === 0) {
      throw new Error("Cannot create an operation with no values");
    }
    return new Operation(
      OperationType.enum.StoreValues,
      values,
      ttl,
      ProgramBindings.create("foo/bar"),
    );
  }

  static retrieveValue(): Operation {
    return new Operation(
      OperationType.enum.RetrieveValue,
      NadaValues.create(),
      Days.parse(1),
      ProgramBindings.create("foo/bar"),
    );
  }
}
