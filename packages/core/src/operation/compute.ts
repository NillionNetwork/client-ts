import { IntoWasmQuotableOperation } from "../wasm";
import * as Wasm from "@nillion/client-wasm";
import { ExecuteOperationArgs, Operation, OperationType } from "./operation";
import { ComputeResultId, StoreId } from "../types";
import { NadaValues, NadaValueType, ProgramBindings } from "../nada";

export type ComputeArgs = {
  bindings: ProgramBindings;
  values: NadaValues;
  storeIds: StoreId[];
};

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

  async execute(_args: ExecuteOperationArgs): Promise<string> {
    throw "not implemented";
  }
}

export type ComputeRetrieveResultsArgs = {
  id: ComputeResultId;
};

export class ComputeRetrieveResult {
  type = OperationType.enum.ComputeRetrieveResult;

  constructor(public args: ComputeRetrieveResultsArgs) {}

  toString(): string {
    return `Operation(type="ComputeRetrieveResult")`;
  }

  async execute(_args: ExecuteOperationArgs): Promise<string> {
    throw "not implemented";
  }
}
