import * as Wasm from "@nillion/client-wasm";
import { Days } from "@nillion/types";
import { z } from "zod";
import { NadaValues } from "./nada";

export const OperationType = z.enum(["StoreValues", "RetrieveValue"]);
export type OperationType = z.infer<typeof OperationType>;

export class Operation {
  // TODO(tim): not all quote request operation types need the same parameters, eg retrieve doesn't need values or ttl
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
      case OperationType.enum.RetrieveValue:
        return Wasm.Operation.retrieve_value();
      default:
        throw `unsupported wasm conversion for OperationType: ${this.type}`;
    }
  }

  static storeValues(values: NadaValues, ttl: Days): Operation {
    if (values.length === 0) {
      throw new Error("Cannot create an operation with no values");
    }
    return new Operation(OperationType.enum.StoreValues, values, ttl);
  }

  static retrieveValue(): Operation {
    return new Operation(
      OperationType.enum.RetrieveValue,
      NadaValues.create(),
      Days.parse(1),
    );
  }
}
