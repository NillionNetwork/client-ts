import * as Wasm from "@nillion/client-wasm";

import { NadaValues, NadaValueType, StoreAcl } from "../nada";
import { Days, NamedValue, StoreId } from "../types";
import { IntoWasmQuotableOperation } from "../wasm";
import { Operation, OperationType } from "./operation";

export interface FetchValueArgs {
  id: StoreId;
  name: NamedValue;
  type: NadaValueType;
}

export class FetchValue implements Operation, IntoWasmQuotableOperation {
  type = OperationType.enum.FetchValue;

  constructor(public args: FetchValueArgs) {}

  intoQuotable(): Wasm.Operation {
    return Wasm.Operation.retrieve_value();
  }

  toString(): string {
    return `Operation(type="FetchValue")`;
  }
}

export interface DeleteValueArgs {
  id: StoreId;
}

export class DeleteValue {
  type = OperationType.enum.DeleteValue;

  constructor(public args: DeleteValueArgs) {}

  toString(): string {
    return `Operation(type="DeleteValue")`;
  }
}

export interface StoreValueArgs {
  values: NadaValues;
  ttl: Days;
  acl?: StoreAcl;
}

export class StoreValue implements Operation, IntoWasmQuotableOperation {
  type = OperationType.enum.StoreValue;

  constructor(public args: StoreValueArgs) {}

  intoQuotable(): Wasm.Operation {
    return Wasm.Operation.store_values(this.args.values.into(), this.args.ttl);
  }

  toString(): string {
    return `Operation(type="StoreValue")`;
  }
}

export interface UpdateValueArgs {
  id: StoreId;
  values: NadaValues;
  ttl: Days;
}

export class UpdateValue implements Operation, IntoWasmQuotableOperation {
  type = OperationType.enum.UpdateValue;

  constructor(public args: UpdateValueArgs) {}

  intoQuotable(): Wasm.Operation {
    return Wasm.Operation.update_values(this.args.values.into(), this.args.ttl);
  }

  toString(): string {
    return `Operation(type="UpdateValue")`;
  }
}
