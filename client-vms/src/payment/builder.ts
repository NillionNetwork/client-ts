import { createClient } from "@connectrpc/connect";
import { type OfflineSigner, Registry } from "@cosmjs/proto-signing";
import { GasPrice, SigningStargateClient } from "@cosmjs/stargate";
import { z } from "zod";
import { Payments } from "#/gen-proto/nillion/payments/v1/service_pb";
import { GrpcTransport, OfflineSignerSchema } from "#/types/grpc";
import { PaymentClient, PaymentClientConfig } from "./client";
import { MsgPayForCompatWrapper } from "./grpc-compat";
import { NilChainProtobufTypeUrl, NilToken } from "./types";

const PaymentClientBuilderConfig = z.object({
  signer: OfflineSignerSchema,
  chainUrl: z.string().url("Invalid chain url"),
  transport: GrpcTransport,
});

export class PaymentClientBuilder {
  private _signer?: OfflineSigner;
  private _chainUrl?: string;
  private _transport?: GrpcTransport;

  chainUrl(url: string): this {
    this._chainUrl = url;
    return this;
  }

  signer(signer: OfflineSigner): this {
    this._signer = signer;
    return this;
  }

  leader(transport: GrpcTransport): this {
    this._transport = transport;
    return this;
  }

  async build(): Promise<PaymentClient> {
    const { signer, chainUrl, transport } = PaymentClientBuilderConfig.parse({
      signer: this._signer,
      chainUrl: this._chainUrl,
      transport: this._transport,
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
      address,
      chain,
      leader,
    });

    return new PaymentClient(config);
  }
}
