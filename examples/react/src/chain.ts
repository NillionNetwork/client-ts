import { DirectSecp256k1Wallet, Registry } from "@cosmjs/proto-signing";
import {
  GasPrice,
  SigningStargateClient,
  SigningStargateClientOptions,
} from "@cosmjs/stargate";
import {
  MsgPayFor,
  NillionConfig,
  PaymentReceipt,
  PriceQuote,
  typeUrl,
} from "@nillion/core";
import { logger } from "./index";

export async function pay(
  config: NillionConfig,
  quote: PriceQuote,
): Promise<PaymentReceipt> {
  const walletKey = Uint8Array.from(
    config.chain.keys[0].match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)),
  );
  DirectSecp256k1Wallet;
  const nilChainWallet = await DirectSecp256k1Wallet.fromKey(
    walletKey,
    "nillion",
  );
  const registry = new Registry();
  registry.register(typeUrl, MsgPayFor);

  const options: SigningStargateClientOptions = {
    gasPrice: GasPrice.fromString("0.025unil"),
    registry,
  };

  const nilChainClient = await SigningStargateClient.connectWithSigner(
    config.chain.endpoint,
    nilChainWallet,
    options,
  );

  const denom = "unil";
  const [account] = await nilChainWallet.getAccounts();
  const from = account.address;

  const payload: MsgPayFor = {
    amount: [{ amount: quote.cost.total, denom }],
    fromAddress: from,
    resource: quote.nonce,
  };

  const result = await nilChainClient.signAndBroadcast(
    from,
    [{ typeUrl, value: payload }],
    "auto",
  );

  logger("paid for operation");

  return new PaymentReceipt(quote, result.transactionHash);
}
