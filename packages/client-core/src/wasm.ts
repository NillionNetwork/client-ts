import * as Wasm from "@nillion/client-wasm";

import { OperationCost, PaymentReceipt, PriceQuote } from "./types";

export interface IntoWasmQuotableOperation {
  intoQuotable: () => Wasm.Operation;
}

export interface IntoWasm<T> {
  into: () => T;
}

export interface FromWasm<T> {
  from: () => T;
}

export const priceQuoteFrom = (wasm: Wasm.PriceQuote): PriceQuote => {
  return PriceQuote.parse({
    expires: wasm.expires_at,
    nonce: wasm.nonce,
    cost: OperationCost.parse({
      base: Number(wasm.cost.base_fee),
      compute: Number(wasm.cost.compute_fee),
      congestion: Number(wasm.cost.congestion_fee),
      preprocessing: Number(wasm.cost.preprocessing_fee),
      storage: Number(wasm.cost.storage_fee),
      total: Number(wasm.cost.total),
    }),
    inner: wasm,
  });
};

export const priceQuoteInto = (quote: PriceQuote): Wasm.PriceQuote =>
  quote.inner;

export const paymentReceiptInto = (
  receipt: PaymentReceipt,
): Wasm.PaymentReceipt =>
  new Wasm.PaymentReceipt(receipt.quote.inner, receipt.hash);
