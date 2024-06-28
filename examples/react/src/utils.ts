import {
  Denon,
  MsgPayFor,
  NillionConfig,
  PaymentReceipt,
  typeUrl,
} from "@nillion/core";
import { DirectSecp256k1Wallet, Registry } from "@cosmjs/proto-signing";
import { GasPrice, SigningStargateClient } from "@cosmjs/stargate";
import { PriceQuote } from "@nillion/client-wasm";

export async function pay(
  config: NillionConfig,
  quote: PriceQuote,
): Promise<PaymentReceipt> {
  const key = Uint8Array.from(
    config.chain.keys[0].match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)),
  );
  const wallet = await DirectSecp256k1Wallet.fromKey(key, "nillion");

  const registry = new Registry();
  registry.register(typeUrl, MsgPayFor);

  const options = {
    gasPrice: GasPrice.fromString(`0.0${Denon.unil}`),
    registry,
  };

  const client = await SigningStargateClient.connectWithSigner(
    config.chain.endpoint,
    wallet,
    options,
  );

  const [account] = await wallet.getAccounts();
  const from = account.address;

  const payload: MsgPayFor = {
    amount: [{ amount: quote.cost.total, denom: Denon.unil }],
    fromAddress: from,
    resource: quote.nonce,
  };

  const result = await client.signAndBroadcast(
    from,
    [{ typeUrl, value: payload }],
    "auto",
  );

  return new PaymentReceipt(quote, result.transactionHash);
}
