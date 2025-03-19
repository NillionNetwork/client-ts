import { createClient } from "@connectrpc/connect";
import { type OfflineSigner, Registry } from "@cosmjs/proto-signing";
import { GasPrice, SigningStargateClient } from "@cosmjs/stargate";
import { z } from "zod";
import type { PublicKey } from "#/gen-proto/nillion/auth/v1/public_key_pb";
import { Payments } from "#/gen-proto/nillion/payments/v1/service_pb";
import { UserId } from "#/types";
import { GrpcTransport, OfflineSignerSchema } from "#/types/grpc";
import { PaymentClient, PaymentClientConfig, PaymentMode } from "./client";
import { MsgPayForCompatWrapper } from "./grpc-compat";
import { NilChainProtobufTypeUrl, NilToken } from "./types";

const PaymentClientBuilderConfig = z.object({
  signer: OfflineSignerSchema,
  chainUrl: z.string().url("Invalid chain url"),
  transport: GrpcTransport,
  id: z.instanceof(UserId),
  paymentMode: z.nativeEnum(PaymentMode),
});

export class PaymentClientBuilder {
  private _signer?: OfflineSigner;
  private _chainUrl?: string;
  private _transport?: GrpcTransport;
  private _id?: UserId;
  private _paymentMode?: PaymentMode;
  private _leaderPublicKey?: PublicKey;

  chainUrl(url: string): this {
    this._chainUrl = url;
    return this;
  }

  paymentMode(paymentMode: PaymentMode): this {
    this._paymentMode = paymentMode;
    return this;
  }

  signer(signer: OfflineSigner): this {
    this._signer = signer;
    return this;
  }

  id(id: UserId): this {
    this._id = id;
    return this;
  }

  leader(transport: GrpcTransport): this {
    this._transport = transport;
    return this;
  }

  leaderPublicKey(publicKey: PublicKey): this {
    this._leaderPublicKey = publicKey;
    return this;
  }

  async build(): Promise<PaymentClient> {
    const { signer, chainUrl, transport, id, paymentMode } =
      PaymentClientBuilderConfig.parse({
        signer: this._signer,
        chainUrl: this._chainUrl,
        transport: this._transport,
        id: this._id,
        paymentMode: this._paymentMode,
        leaderPublicKey: this._leaderPublicKey,
      });

    const registry = new Registry();
    registry.register(NilChainProtobufTypeUrl, MsgPayForCompatWrapper);

    const accounts = await signer.getAccounts();
    if (accounts.length === 0) {
      throw new Error("No accounts on the offline signer");
    }
    const address = accounts[0]?.address ?? "";

    const chain = await SigningStargateClient.connectWithSigner(
      z.string().url().parse(chainUrl),
      signer,
      {
        gasPrice: GasPrice.fromString(NilToken.asUnil(0.0)),
        registry,
      },
    );

    const leader = createClient(Payments, transport);

    const config = PaymentClientConfig.parse({
      id,
      address,
      chain,
      leader,
      paymentMode,
    });

    return new PaymentClient(config);
  }
}
