import { IntoWasmQuotableOperation } from "../wasm";
import * as Wasm from "@nillion/client-wasm";
import { ExecuteOperationArgs } from "./operation";

export type PermissionsUpdateArgs = {};

export class PermissionsUpdate implements IntoWasmQuotableOperation {
  constructor(private args: PermissionsUpdateArgs) {}

  intoQuotable(): Wasm.Operation {
    return Wasm.Operation.update_permissions();
  }

  toString(): string {
    return `Operation(type="PermissionsUpdate")`;
  }

  async execute(_args: ExecuteOperationArgs): Promise<string> {
    throw "not implemented";
  }
}

export type PermissionsRetrieveArgs = {};

export class PermissionsRetrieve implements IntoWasmQuotableOperation {
  constructor(private args: PermissionsRetrieveArgs) {}

  intoQuotable(): Wasm.Operation {
    return Wasm.Operation.retrieve_permissions();
  }

  toString(): string {
    return `Operation(type="PermissionsRetrieve")`;
  }

  async execute(_args: ExecuteOperationArgs): Promise<string> {
    throw "not implemented";
  }
}
