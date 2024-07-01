import { PriceQuote } from "@nillion/client-wasm";
import { Context } from "./context";
import { MsgPayFor, PaymentReceipt, typeUrl } from "@nillion/core";

export async function pay(
  context: Context,
  quote: PriceQuote,
): Promise<PaymentReceipt> {
  const denom = "unil";
  const [account] = await context.chain.wallet.getAccounts();
  const from = account.address;

  const payload: MsgPayFor = {
    amount: [{ amount: quote.cost.total, denom }],
    fromAddress: from,
    resource: quote.nonce,
  };

  const result = await context.chain.client.signAndBroadcast(
    from,
    [{ typeUrl, value: payload }],
    "auto",
  );

  return new PaymentReceipt(quote, result.transactionHash);
}
