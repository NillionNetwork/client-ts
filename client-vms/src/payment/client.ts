import { create, fromBinary } from "@bufbuild/protobuf";
import type { Client } from "@connectrpc/connect";
import { SigningStargateClient } from "@cosmjs/stargate";
import { MsgPayForSchema } from "@nillion/client-vms/gen-proto/nillion/meta/v1/tx_pb";
import {
  type PriceQuoteRequest,
  PriceQuoteSchema,
} from "@nillion/client-vms/gen-proto/nillion/payments/v1/quote_pb";
import {
  PaymentReceiptRequestSchema,
  type SignedReceipt,
} from "@nillion/client-vms/gen-proto/nillion/payments/v1/receipt_pb";
import type { Payments } from "@nillion/client-vms/gen-proto/nillion/payments/v1/service_pb";
import { Log } from "@nillion/client-vms/logger";
import { GrpcClient } from "@nillion/client-vms/types/grpc";
import { z } from "zod";

import { Quote } from "@nillion/client-vms/types/types";
import {
  NilChainAddress,
  NilChainProtobufTypeUrl,
  NilToken,
  TxHash,
} from "./types";

export const PaymentClientConfig = z.object({
  address: NilChainAddress,
  chain: z.custom<SigningStargateClient>(
    (value: unknown) => value instanceof SigningStargateClient,
  ),
  leader: GrpcClient,
});

export type PaymentClientConfig = z.infer<typeof PaymentClientConfig>;

export class PaymentClient {
  private readonly address: NilChainAddress;
  private readonly chain: SigningStargateClient;
  private readonly leader: Client<typeof Payments>;

  constructor(private readonly config: PaymentClientConfig) {
    this.address = config.address;
    this.chain = config.chain;
    this.leader = config.leader as Client<typeof Payments>;
  }

  async payForOperation(request: PriceQuoteRequest): Promise<SignedReceipt> {
    const quote = await this.quote(request);
    const txHash = await this.payOnChain(quote);
    return await this.validate(quote, txHash);
  }

  async quote(request: PriceQuoteRequest): Promise<Quote> {
    const signed = await this.leader.priceQuote(request);
    const quotePb = fromBinary(PriceQuoteSchema, signed.quote);
    const quote = Quote.parse(
      { ...quotePb, request, signed },
      { path: ["client.quote"] },
    );
    Log.info(
      "Quoted %s unil for %s",
      quote.fees.total.toString(),
      request.operation.case,
    );
    return quote;
  }

  async payOnChain(quote: Quote): Promise<TxHash> {
    const amount = String(quote.fees.total);

    const value = create(MsgPayForSchema, {
      fromAddress: this.address,
      resource: quote.nonce,
      amount: [{ denom: NilToken.Unil, amount }],
    });

    const result = await this.chain.signAndBroadcast(
      this.address,
      [{ typeUrl: NilChainProtobufTypeUrl, value }],
      "auto",
    );
    const hash = TxHash.parse(result.transactionHash);
    Log.info("Paid %d unil hash: %s", amount, hash);
    return hash;
  }

  async validate(quote: Quote, txHash: TxHash): Promise<SignedReceipt> {
    const request = create(PaymentReceiptRequestSchema, {
      signedQuote: quote.signed,
      txHash,
    });
    const receipt = await this.leader.paymentReceipt(request);
    Log.info("Validated payment with cluster");
    return receipt;
  }
}
