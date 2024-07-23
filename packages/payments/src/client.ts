import { NilChainAddress, PriceQuote, Token, TxHash } from "@nillion/core";
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
import { NilChainProtobufTypeUrl, PaymentClientConfig } from "./types";
import { getKeplr } from "./wallet";
import { ChainConfig } from "./chains";

export class PaymentsClient {
  private _client: SigningStargateClient | undefined = undefined;
  private _address: NilChainAddress | undefined = undefined;
  private _signer: OfflineSigner | undefined = undefined;

  private constructor(private _config: PaymentClientConfig) {}

  get ready(): boolean {
    return (
      Boolean(this._client) && Boolean(this._address) && Boolean(this._signer)
    );
  }

  get client(): SigningStargateClient {
    this.isReadyGuard();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this._client!;
  }

  get signer(): OfflineSigner {
    this.isReadyGuard();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this._signer!;
  }

  get address(): NilChainAddress {
    this.isReadyGuard();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this._address!;
  }

  private isReadyGuard(): void | never {
    if (!this.ready) {
      const message =
        "NilChainPaymentClient not ready. Call `await client.connect()`.";
      Log(message);
      throw new Error(message);
    }
  }

  async connect(): Promise<boolean> {
    const { endpoint, chain } = this._config;
    const registry = new Registry();
    registry.register(NilChainProtobufTypeUrl, MsgPayFor);

    this._signer = this._config.signer;
    if (!this._signer) {
      // default to keplr signer
      const keplr = await getKeplr();
      if (keplr) {
        await keplr.experimentalSuggestChain(ChainConfig.Devnet);
        this._signer = keplr.getOfflineSigner(chain);
      } else {
        throw new Error("No signer provided and keplr not found");
      }
    }

    const accounts = await this._signer.getAccounts();
    this._address = NilChainAddress.parse(accounts[0].address);

    const options: SigningStargateClientOptions = {
      gasPrice: GasPrice.fromString(Token.asUnil(0.0)),
      registry,
    };

    this._client = await SigningStargateClient.connectWithSigner(
      endpoint,
      this._signer,
      options,
    );

    Log("Connected to chain using address %s", this._address);
    return this.ready;
  }

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

  static create = (config: PaymentClientConfig) => new PaymentsClient(config);
}
