import * as Wasm from "@nillion/client-wasm";

import { ProgramName } from "../types";
import { IntoWasmQuotableOperation } from "../wasm";
import { Operation, OperationType } from "./operation";

export interface StoreProgramArgs {
  name: ProgramName;
  program: Uint8Array;
}

export class StoreProgram implements Operation, IntoWasmQuotableOperation {
  type = OperationType.enum.StoreProgram;

  constructor(public args: StoreProgramArgs) {}

  intoQuotable(): Wasm.Operation {
    return Wasm.Operation.store_program(this.args.program);
  }

  toString(): string {
    return `Operation(type="StoreProgram")`;
  }
}
