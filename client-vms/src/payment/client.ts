import { create, fromBinary, toBinary } from "@bufbuild/protobuf";
import type { Empty } from "@bufbuild/protobuf/wkt";
import { type Client, Code, ConnectError } from "@connectrpc/connect";
import { SigningStargateClient } from "@cosmjs/stargate";
import { sha256 } from "@noble/hashes/sha2";
import { randomBytes } from "@noble/hashes/utils";
import { Effect as E, pipe } from "effect";
import { UnknownException } from "effect/Cause";
import { z } from "zod";
import {
  type MsgPayFor,
  MsgPayForSchema,
} from "#/gen-proto/nillion/meta/v1/tx_pb";
import {
  type AccountBalanceResponse,
  AddFundsPayloadSchema,
  AddFundsRequestSchema,
} from "#/gen-proto/nillion/payments/v1/balance_pb";
import type { PaymentsConfigResponse } from "#/gen-proto/nillion/payments/v1/config_pb";
import {
  type PriceQuoteRequest,
  PriceQuoteSchema,
} from "#/gen-proto/nillion/payments/v1/quote_pb";
import {
  PaymentReceiptRequestSchema,
  type SignedReceipt,
} from "#/gen-proto/nillion/payments/v1/receipt_pb";
import type { Payments } from "#/gen-proto/nillion/payments/v1/service_pb";
import { Log } from "#/logger";
import { UserId } from "#/types";
import { GrpcClient } from "#/types/grpc";
import { Quote } from "#/types/types";
import { unwrapExceptionCause } from "#/util";
import {
  NilChainAddress,
  NilChainProtobufTypeUrl,
  NilToken,
  TxHash,
} from "./types";

export enum PaymentMode {
  PayPerOperation = "PayPerOperation",
  FromBalance = "FromBalance",
}

export const PaymentClientConfig = z.object({
  id: z.instanceof(UserId),
  address: NilChainAddress,
  chain: z.custom<SigningStargateClient>(
    (value: unknown) => value instanceof SigningStargateClient,
  ),
  leader: GrpcClient,
  paymentMode: z.nativeEnum(PaymentMode),
});

export type PaymentClientConfig = z.infer<typeof PaymentClientConfig>;

export class PaymentClient {
  private readonly address: NilChainAddress;
  private readonly chain: SigningStargateClient;
  private readonly leader: Client<typeof Payments>;
  private readonly paymentMode: PaymentMode;

  constructor(private readonly config: PaymentClientConfig) {
    this.address = config.address;
    this.chain = config.chain;
    this.leader = config.leader as Client<typeof Payments>;
    this.paymentMode = config.paymentMode;
  }

  get id(): UserId {
    return this.config.id;
  }

  async payForOperation(request: PriceQuoteRequest): Promise<SignedReceipt> {
    const quote = await this.quote(request);
    const txHash = await this.payOnChain(quote, this.paymentMode);
    return await this.validate(quote, txHash);
  }

  async quote(request: PriceQuoteRequest): Promise<Quote> {
    return pipe(
      E.tryPromise(() => this.leader.priceQuote(request)),
      E.map((signed) => {
        const quotePb = fromBinary(PriceQuoteSchema, signed.quote);
        return Quote.parse(
          { ...quotePb, request, signed },
          { path: ["client.quote"] },
        );
      }),
      E.catchAll(unwrapExceptionCause),
      E.tapBoth({
        onFailure: (e) => E.sync(() => Log("Quote request failed: %O", e)),
        onSuccess: (quote) =>
          E.sync(() =>
            Log(
              "Quoted %s unil for %s",
              quote.fees.total.toString(),
              request.operation.case,
            ),
          ),
      }),
      E.runPromise,
    );
  }

  async payOnChain(
    quote: Quote,
    paymentMode: PaymentMode,
  ): Promise<TxHash | undefined> {
    if (paymentMode === PaymentMode.FromBalance) {
      return;
    }
    const amount = String(quote.fees.total);
    const value = create(MsgPayForSchema, {
      fromAddress: this.address,
      resource: quote.nonce,
      amount: [{ denom: NilToken.Unil, amount }],
    });
    return pipe(
      E.tryPromise(() =>
        this.chain.signAndBroadcast(
          this.address,
          [{ typeUrl: NilChainProtobufTypeUrl, value }],
          "auto",
        ),
      ),
      E.map((result) => TxHash.parse(result.transactionHash)),
      E.catchAll(unwrapExceptionCause),
      E.tapBoth({
        onSuccess: (hash) =>
          E.sync(() => Log("Paid %d unil hash: %s", amount, hash)),
        onFailure: (e) => E.sync(() => Log("Pay failed: %O", e)),
      }),
      E.runPromise,
    );
  }

  async validate(
    quote: Quote,
    txHash: TxHash | undefined,
  ): Promise<SignedReceipt> {
    const request = create(PaymentReceiptRequestSchema, {
      signedQuote: quote.signed,
      txHash,
    });
    try {
      const receipt = await this.leader.paymentReceipt(request);
      Log("Validated payment with cluster");
      return receipt;
    } catch (error) {
      if (error instanceof UnknownException) {
        throw unwrapExceptionCause(error);
      }
      if (
        error instanceof ConnectError &&
        error.code === Code.FailedPrecondition &&
        error.rawMessage === "not enough funds"
      ) {
        const txHash = await this.payOnChain(
          quote,
          PaymentMode.PayPerOperation,
        );
        return await this.validate(quote, txHash);
      }
      throw error;
    }
  }

  async accountBalance(): Promise<AccountBalanceResponse> {
    return pipe(
      E.tryPromise(() => this.leader.accountBalance({})),
      E.catchAll(unwrapExceptionCause),
      E.tapBoth({
        onSuccess: (accountBalance) =>
          E.sync(() => Log("Account balance: %d unil", accountBalance.balance)),
        onFailure: (e) => E.sync(() => Log("Pay failed: %O", e)),
      }),
      E.runPromise,
    );
  }

  async paymentsConfig(): Promise<PaymentsConfigResponse> {
    return pipe(
      E.tryPromise(() => this.leader.paymentsConfig({})),
      E.catchAll(unwrapExceptionCause),
      E.tapBoth({
        onSuccess: (paymentsConfig) =>
          E.sync(() =>
            Log(
              "Minimum add unil amount: %d unil",
              paymentsConfig.minimumAddFundsPayment,
            ),
          ),
        onFailure: (e) =>
          E.sync(() => Log("Payment config request failed: %O", e)),
      }),
      E.runPromise,
    );
  }

  async addFunds(unilAmount: bigint): Promise<Empty> {
    const isAmountGreaterThanMinimum = (
      config: PaymentsConfigResponse,
      amount: bigint,
    ): E.Effect<bigint, Error> =>
      config.minimumAddFundsPayment > amount
        ? E.fail(Error("Not enough unil amount"))
        : E.succeed(amount);

    const payload = toBinary(
      AddFundsPayloadSchema,
      create(AddFundsPayloadSchema, {
        recipient: this.id.toProto(),
        nonce: randomBytes(32),
      }),
    );
    return pipe(
      E.tryPromise(() => this.paymentsConfig()),
      E.flatMap((config) => isAmountGreaterThanMinimum(config, unilAmount)),
      E.map((amount) => this.addBalanceRequest(payload, amount)),
      E.andThen((request) =>
        this.chain.signAndBroadcast(
          this.address,
          [{ typeUrl: NilChainProtobufTypeUrl, value: request }],
          "auto",
        ),
      ),
      E.map((result) =>
        create(AddFundsRequestSchema, {
          payload,
          txHash: TxHash.parse(result.transactionHash),
        }),
      ),
      E.andThen(this.leader.addFunds),
      E.catchAll(unwrapExceptionCause),
      E.runPromise,
    );
  }

  addBalanceRequest(payload: Uint8Array, unilAmount: bigint): MsgPayFor {
    const payloadHash = sha256(payload);
    return create(MsgPayForSchema, {
      fromAddress: this.address,
      resource: payloadHash,
      amount: [{ denom: NilToken.Unil, amount: String(unilAmount) }],
    });
  }
}
