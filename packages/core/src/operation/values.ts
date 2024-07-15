import { ExecuteOperationArgs, Operation, OperationType } from "./operation";
import { IntoWasmQuotableOperation } from "../wasm";
import { Days, StoreId, ValueName } from "../types";
import { NadaValue, NadaValues, NadaValueType, Permissions } from "../nada";
import * as Wasm from "@nillion/client-wasm";

export type ValueRetrieveArgs = {
  id: StoreId;
  name: ValueName;
  type: NadaValueType;
};

export class ValueRetrieve implements Operation, IntoWasmQuotableOperation {
  type = OperationType.enum.ValueRetrieve;

  constructor(public args: ValueRetrieveArgs) {}

  intoQuotable(): Wasm.Operation {
    return Wasm.Operation.retrieve_value();
  }

  toString(): string {
    return `Operation(type="ValueRetrieve")`;
  }

  async execute(_args: ExecuteOperationArgs): Promise<NadaValue> {
    throw "not implemented";
  }
}

export type ValuesDeleteArgs = {
  id: StoreId;
};

export class ValuesDelete {
  type = OperationType.enum.ValuesDelete;

  constructor(public args: ValuesDeleteArgs) {}

  toString(): string {
    return `Operation(type="ValuesDelete")`;
  }

  async execute(_args: ExecuteOperationArgs): Promise<StoreId> {
    throw "not implemented";
  }
}

export type ValuesStoreArgs = {
  values: NadaValues;
  ttl: Days;
  permissions?: Permissions;
};

export class ValuesStore implements Operation, IntoWasmQuotableOperation {
  type = OperationType.enum.ValuesStore;

  constructor(public args: ValuesStoreArgs) {}

  intoQuotable(): Wasm.Operation {
    return Wasm.Operation.store_values(this.args.values.into(), this.args.ttl);
  }

  toString(): string {
    return `Operation(type="ValuesStore")`;
  }

  async execute(_args: ExecuteOperationArgs): Promise<StoreId> {
    throw "not implemented";
  }
}

export type ValuesUpdateArgs = {
  id: StoreId;
  values: NadaValues;
  ttl: Days;
};

export class ValuesUpdate implements Operation, IntoWasmQuotableOperation {
  type = OperationType.enum.ValuesUpdate;

  constructor(public args: ValuesUpdateArgs) {}

  intoQuotable(): Wasm.Operation {
    return Wasm.Operation.update_values(this.args.values.into(), this.args.ttl);
  }

  toString(): string {
    return `Operation(type="ValuesUpdate")`;
  }

  async execute(_args: ExecuteOperationArgs): Promise<StoreId> {
    throw "not implemented";
  }
}
