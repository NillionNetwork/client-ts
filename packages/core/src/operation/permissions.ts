import { IntoWasmQuotableOperation } from "../wasm";
import * as Wasm from "@nillion/wasm";
import { ExecuteOperationArgs, Operation, OperationType } from "./operation";
import { StoreId } from "../types";
import { Permissions } from "../nada";

export type PermissionsUpdateArgs = {
  id: StoreId;
  permissions: Permissions;
};

export class PermissionsUpdate implements Operation, IntoWasmQuotableOperation {
  type = OperationType.enum.PermissionsUpdate;

  constructor(public args: PermissionsUpdateArgs) {}

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

export type PermissionsRetrieveArgs = {
  id: StoreId;
};

export class PermissionsRetrieve
  implements Operation, IntoWasmQuotableOperation
{
  type = OperationType.enum.PermissionsRetrieve;

  constructor(public args: PermissionsRetrieveArgs) {}

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
