import * as Wasm from "@nillion/client-wasm";

export interface IntoWasmQuotableOperation {
  intoQuotable: () => Wasm.Operation;
}

export interface IntoWasm<T> {
  into: () => T;
}
