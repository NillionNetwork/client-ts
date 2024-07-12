import {
  NilChainAddress,
  NilChainProtobufTypeUrl,
  PriceQuote,
  Token,
  TxHash,
  Url,
} from "@nillion/core";
import { OfflineSigner, Registry } from "@cosmjs/proto-signing";
import {
  GasPrice,
  SigningStargateClient,
  SigningStargateClientOptions,
} from "@cosmjs/stargate";
import { MsgPayFor } from "./proto/nilchain";
import { Log } from "./logger";

export class NilChainPaymentClient {
  private constructor(
    private client: SigningStargateClient,
    public address: NilChainAddress,
  ) {}

  async pay(quote: PriceQuote): Promise<TxHash> {
    Log(`Paying ${quote.cost.total}unil`);

    const value = MsgPayFor.create({
      fromAddress: this.address,
      resource: quote.nonce,
      amount: [{ denom: Token.Unil, amount: String(quote.cost.total) }],
    });

    const result = await this.client.signAndBroadcast(
      this.address,
      [{ typeUrl: NilChainProtobufTypeUrl, value }],
      "auto",
    );

    const hash = TxHash.parse(result.transactionHash);
    Log(`transaction hash ${hash}`);

    return hash;
  }

  static async create(
    endpoint: Url,
    signer: OfflineSigner,
  ): Promise<NilChainPaymentClient> {
    const registry = new Registry();
    registry.register(NilChainProtobufTypeUrl, MsgPayFor);

    const accounts = await signer.getAccounts();
    const address = NilChainAddress.parse(accounts[0].address);

    const options: SigningStargateClientOptions = {
      gasPrice: GasPrice.fromString(Token.asUnil(0.0)),
      registry,
    };

    const client = await SigningStargateClient.connectWithSigner(
      endpoint,
      signer,
      options,
    );

    return new NilChainPaymentClient(client, address);
  }
}
