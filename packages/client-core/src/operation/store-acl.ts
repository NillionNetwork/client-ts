import * as Wasm from "@nillion/client-wasm";

import { StoreAcl } from "../nada";
import { StoreId } from "../types";
import { IntoWasmQuotableOperation } from "../wasm";
import { Operation, OperationType } from "./operation";

export interface SetAclArgs {
  id: StoreId;
  acl: StoreAcl;
}

export class SetStoreAcl implements Operation, IntoWasmQuotableOperation {
  type = OperationType.enum.SetStoreAcl;

  constructor(public args: SetAclArgs) {}

  intoQuotable(): Wasm.Operation {
    return Wasm.Operation.update_permissions();
  }

  toString(): string {
    return `Operation(type="SetStoreAcl")`;
  }
}

export interface FetchAclArgs {
  id: StoreId;
}

export class FetchStoreAcl implements Operation, IntoWasmQuotableOperation {
  type = OperationType.enum.FetchStoreAcl;

  constructor(public args: FetchAclArgs) {}

  intoQuotable(): Wasm.Operation {
    return Wasm.Operation.retrieve_permissions();
  }

  toString(): string {
    return `Operation(type="FetchStoreAcl")`;
  }
}
