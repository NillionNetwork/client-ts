import { IntoWasmQuotableOperation } from "../wasm";
import * as Wasm from "@nillion/client-wasm";
import { ExecuteOperationArgs } from "./operation";

export type ProgramStoreArgs = {
  program: Uint8Array;
};

export class ProgramStore implements IntoWasmQuotableOperation {
  constructor(private args: ProgramStoreArgs) {}

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
