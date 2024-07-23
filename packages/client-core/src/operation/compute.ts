import { IntoWasmQuotableOperation } from "../wasm";
import * as Wasm from "@nillion/wasm";
import { Operation, OperationType } from "./operation";
import { NadaValues, ProgramBindings } from "../nada";
import { ComputeResultId, StoreId } from "../types";

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

export interface ComputeRetrieveResultsArgs {
  id: ComputeResultId;
}

export class ComputeRetrieveResult {
  type = OperationType.enum.ComputeRetrieveResult;

  constructor(public args: ComputeRetrieveResultsArgs) {}

  toString(): string {
    return `Operation(type="ComputeRetrieveResult")`;
  }
}
