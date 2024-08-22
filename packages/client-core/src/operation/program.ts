import * as Wasm from "@nillion/client-wasm";

import { ProgramName } from "../types";
import { IntoWasmQuotableOperation } from "../wasm";
import { Operation, OperationType } from "./operation";

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
