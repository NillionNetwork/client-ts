import { create } from "@bufbuild/protobuf";
import { OfflineSigner, Registry } from "@cosmjs/proto-signing";
import {
  GasPrice,
  SigningStargateClient,
  SigningStargateClientOptions,
} from "@cosmjs/stargate";
import { Effect as E } from "effect";

import {
  NilChainAddress,
  PriceQuote,
  Token,
  TxHash,
} from "@nillion/client-core";

import {
  AccountNotFoundError,
  PaymentError,
  UnknownPaymentError,
} from "./errors";
import { MsgPayForSchema } from "./gen-proto/nillion/meta/v1/msg_pay_for_pb";
import { MsgPayForCompatWrapper } from "./grpc-compat";
import { Log } from "./logger";
import { NilChainProtobufTypeUrl, PaymentClientConfig } from "./types";
import { getKeplr } from "./wallet";

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

  private isReadyGuard(): void {
    if (!this.ready) {
      const message =
        "NilChainPaymentClient not ready. Call `await client.connect()`.";
      Log(message);
      throw new Error(message);
    }
  }

  async connect(): Promise<boolean> {
    const { endpoint, chainId } = this._config;
    const registry = new Registry();

    registry.register(NilChainProtobufTypeUrl, MsgPayForCompatWrapper);

    this._signer = this._config.signer;
    if (!this._signer) {
      // default to keplr signer
      const keplr = await getKeplr();
      if (keplr) {
        await keplr.enable(chainId);
        this._signer = keplr.getOfflineSigner(chainId);
      } else {
        throw new Error("No signer provided and keplr not found.");
      }
    }

    const accounts = await this._signer.getAccounts();
    if (!accounts[0]) {
      throw new Error("No accounts found for provided signer.");
    }

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

  pay(quote: PriceQuote): E.Effect<TxHash, PaymentError> {
    return E.Do.pipe(
      E.let("transferMessage", () =>
        create(MsgPayForSchema, {
          fromAddress: this.address,
          resource: quote.nonce,
          amount: [{ denom: Token.Unil, amount: String(quote.cost.total) }],
        }),
      ),
      E.flatMap(({ transferMessage }) =>
        E.tryPromise(() =>
          this.client.signAndBroadcast(
            this.address,
            [{ typeUrl: NilChainProtobufTypeUrl, value: transferMessage }],
            "auto",
          ),
        ),
      ),
      E.map((result) => {
        const hash = TxHash.parse(result.transactionHash);
        Log("Paid %d unil, tx hash %s", quote.cost.total, hash);
        return hash;
      }),
      E.mapError((e) => {
        const cause = e.cause;
        if (cause instanceof Error) {
          const message = cause.message;
          if (message.includes("does not exist on chain")) {
            Log("Payment failed because account not found %s.", this.address);
            return new AccountNotFoundError(this.address, cause);
          }
        }
        Log("Payment failed unknown error %O.", e);
        return new UnknownPaymentError(e);
      }),
    );
  }

  static create = (config: PaymentClientConfig) => new PaymentsClient(config);
}
