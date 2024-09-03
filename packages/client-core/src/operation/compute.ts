import * as Wasm from "@nillion/client-wasm";

import { NadaValues, ProgramBindings } from "../nada";
import { ComputeOutputId, StoreId } from "../types";
import { IntoWasmQuotableOperation } from "../wasm";
import { Operation, OperationType } from "./operation";

export interface ComputeArgs {
  bindings: ProgramBindings;
  values: NadaValues;
  storeIds: StoreId[];
}

export class Compute implements Operation, IntoWasmQuotableOperation {
  type = OperationType.enum.Compute;

  constructor(public args: ComputeArgs) {}

  intoQuotable(): Wasm.Operation {
    return Wasm.Operation.compute(
      this.args.bindings.id,
      this.args.values.into(),
    );
  }

  toString(): string {
    return `Operation(type="Compute")`;
  }
}

export interface FetchComputeOutputArgs {
  id: ComputeOutputId;
}

export class FetchComputeOutput {
  type = OperationType.enum.FetchComputeOutput;

  constructor(public args: FetchComputeOutputArgs) {}

  toString(): string {
    return `Operation(type="FetchComputeOutput")`;
  }
}
