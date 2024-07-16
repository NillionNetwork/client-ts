import { IntoWasmQuotableOperation } from "../wasm";
import * as Wasm from "@nillion/wasm";
import { ExecuteOperationArgs, Operation, OperationType } from "./operation";
import { ProgramName } from "../types";

export type ProgramStoreArgs = {
  program: Uint8Array;
  name: ProgramName;
};

export class ProgramStore implements Operation, IntoWasmQuotableOperation {
  type = OperationType.enum.ProgramStore;

  constructor(public args: ProgramStoreArgs) {}

  intoQuotable(): Wasm.Operation {
    return Wasm.Operation.store_program(this.args.program);
  }

  toString(): string {
    return `Operation(type="ProgramStore")`;
  }

  async execute(_args: ExecuteOperationArgs): Promise<string> {
    throw "not implemented";
  }
}
