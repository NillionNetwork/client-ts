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
import { MsgPayFor } from "./proto";
import { Log } from "./logger";
import { Effect as E } from "effect";
import { UnknownException } from "effect/Cause";

export class NilChainPaymentClient {
  private constructor(
    private client: SigningStargateClient,
    public address: NilChainAddress,
  ) {}

  pay(quote: PriceQuote): E.Effect<TxHash, UnknownException> {
    return E.tryPromise(async () => {
      Log("Paying %d unil", quote.cost.total);

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
    });
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
