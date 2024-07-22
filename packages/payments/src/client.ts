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

export interface ConnectionArgs {
  endpoint: Url;
  signerOrCreateFn: OfflineSigner | (() => Promise<OfflineSigner>);
}

export class PaymentsClient {
  // These fields are lazily loaded to avoid top level awaits required in the initiation of the Signer
  // @ts-expect-error lazily loaded on `connect()` to avoid top level waits
  private _client: SigningStargateClient;
  // @ts-expect-error lazily loaded on `connect()` to avoid top level waits
  private _address: NilChainAddress;
  private _ready = false;

  get ready(): boolean {
    return this._ready;
  }

  get address(): NilChainAddress {
    this.isReadyGuard();
    return this._address;
  }

  get client(): SigningStargateClient {
    this.isReadyGuard();
    return this._client;
  }

  private isReadyGuard(): void | never {
    if (!this._ready) {
      const message =
        "NilChainPaymentClient not ready. Call `await client.connect()`.";
      Log(message);
      throw new Error(message);
    }
  }

  async connect(args: ConnectionArgs): Promise<boolean> {
    const { endpoint, signerOrCreateFn } = args;
    const registry = new Registry();
    registry.register(NilChainProtobufTypeUrl, MsgPayFor);

    const signer =
      typeof signerOrCreateFn === "function"
        ? await signerOrCreateFn()
        : signerOrCreateFn;

    const accounts = await signer.getAccounts();
    this._address = NilChainAddress.parse(accounts[0].address);

    const options: SigningStargateClientOptions = {
      gasPrice: GasPrice.fromString(Token.asUnil(0.0)),
      registry,
    };

    this._client = await SigningStargateClient.connectWithSigner(
      endpoint,
      signer,
      options,
    );

    this._ready = true;
    Log("Connected to chain using address %s", this._address);
    return this._ready;
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

  static create = () => new PaymentsClient();
}
