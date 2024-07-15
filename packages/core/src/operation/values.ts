import { IntoWasmQuotableOperation } from "../wasm";
import { Days, StoreId, ValueId } from "../types";
import * as Wasm from "@nillion/client-wasm";
import { NadaValue, NadaValues, Permissions } from "../nada";
import { ExecuteOperationArgs } from "./operation";

export type ValueRetrieveArgs = {
  storeId: StoreId;
  valueId: ValueId;
};

export class ValueRetrieve implements IntoWasmQuotableOperation {
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
  storeId: StoreId;
};

export class ValuesDelete {
  constructor(private args: ValuesDeleteArgs) {}

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

export class ValuesStore implements IntoWasmQuotableOperation {
  constructor(private args: ValuesStoreArgs) {}

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
  values: NadaValues;
  ttl: Days;
};

export class ValuesUpdate implements IntoWasmQuotableOperation {
  constructor(private args: ValuesUpdateArgs) {}

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
