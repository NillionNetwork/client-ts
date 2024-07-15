import { IntoWasmQuotableOperation } from "../wasm";
import * as Wasm from "@nillion/client-wasm";
import { ExecuteOperationArgs } from "./operation";
import { ProgramId } from "../types";
import { NadaValues } from "../nada";

export type ComputeArgs = {
  programId: ProgramId;
  values: NadaValues;
};

export class Compute implements IntoWasmQuotableOperation {
  constructor(private args: ComputeArgs) {}

  intoQuotable(): Wasm.Operation {
    return Wasm.Operation.compute(this.args.programId, this.args.values.into());
  }

  toString(): string {
    return `Operation(type="Compute")`;
  }

  async execute(_args: ExecuteOperationArgs): Promise<string> {
    throw "not implemented";
  }
}

export type ComputeRetrieveResultsArgs = {
  programId: ProgramId;
  values: NadaValues;
};

export class ComputeRetrieveResult {
  constructor(private args: ComputeRetrieveResultsArgs) {}

  toString(): string {
    return `Operation(type="ComputeRetrieveResult")`;
  }

  async execute(_args: ExecuteOperationArgs): Promise<string> {
    throw "not implemented";
  }
}
