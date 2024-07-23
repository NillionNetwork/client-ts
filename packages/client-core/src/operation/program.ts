import { IntoWasmQuotableOperation } from "../wasm";
import * as Wasm from "@nillion/wasm";
import { Operation, OperationType } from "./operation";
import { ProgramName } from "../types";

export interface ProgramStoreArgs {
  name: ProgramName;
  program: Uint8Array;
}

export class ProgramStore implements Operation, IntoWasmQuotableOperation {
  type = OperationType.enum.ProgramStore;

  constructor(public args: ProgramStoreArgs) {}

  intoQuotable(): Wasm.Operation {
    return Wasm.Operation.store_program(this.args.program);
  }

  toString(): string {
    return `Operation(type="ProgramStore")`;
  }
}
