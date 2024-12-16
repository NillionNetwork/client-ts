import { create, fromBinary } from "@bufbuild/protobuf";
import { beforeAll, describe, expect, it } from "vitest";
import { ZodError } from "zod";
import { PriceQuoteRequestSchema } from "#/gen-proto/nillion/payments/v1/quote_pb";
import { ReceiptSchema } from "#/gen-proto/nillion/payments/v1/receipt_pb";
import { PaymentClientBuilder, createSignerFromKey } from "#/payment";
import { type VmClient, VmClientBuilder } from "#/vm";
import { Env, PrivateKeyPerSuite } from "./helpers";

describe("PaymentClient", () => {
  let client: VmClient;

  beforeAll(async () => {
    const signer = await createSignerFromKey(PrivateKeyPerSuite.VmClient);

    client = await new VmClientBuilder()
      // Random seed is required to avoid failures when the tests are run multiple times consecutively
      .seed(Math.random().toString(36))
      .bootnodeUrl(Env.bootnodeUrl)
      .chainUrl(Env.nilChainUrl)
      .signer(signer)
      .build();
  });

  it("builder rejects if missing values", async () => {
    try {
      const builder = new PaymentClientBuilder();
      await builder.build();
    } catch (e) {
      expect(e).toBeInstanceOf(ZodError);
      expect((e as ZodError).issues).toHaveLength(5);
    }

    expect.assertions(2);
  });

  it("can pay for an operation", async () => {
    const request = create(PriceQuoteRequestSchema, {
      operation: {
        case: "poolStatus",
        value: {},
      },
    });
    const signedReceipt = await client.payer.payForOperation(request);
    const receipt = fromBinary(ReceiptSchema, signedReceipt.receipt);
    expect(receipt.expiresAt?.seconds).toBeGreaterThan(new Date().getSeconds());
    expect(receipt.identifier).toHaveLength(16);
  });

  it("can query payments config", async () => {
    const paymentsConfig = await client.payer.paymentsConfig();
    expect(paymentsConfig.minimumAddFundsPayment).toBeDefined;
  });

  it("can query account balance", async () => {
    const account = await client.payer.accountBalance();
    expect(account.balance).toBe(BigInt(0));
  });

  it("add not enough funds", async () => {
    await expect(() => client.payer.addFunds(BigInt(0))).rejects.toThrowError(
      "Not enough unil amount",
    );
  });

  it("add enough funds", async () => {
    const result = await client.payer.addFunds(BigInt(10));
    expect(result).toBeNull;
  });

  it("account is funded", async () => {
    const account = await client.payer.accountBalance();
    expect(account.balance).toBe(BigInt(10));
  });

  it("can pay from balance", async () => {
    const request = create(PriceQuoteRequestSchema, {
      operation: {
        case: "poolStatus",
        value: {},
      },
    });
    await client.payer.payForOperation(request);
    const account = await client.payer.accountBalance();
    expect(account.balance).toBeLessThan(BigInt(10));
  });
});
