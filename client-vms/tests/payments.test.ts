import { create, fromBinary } from "@bufbuild/protobuf";
import { createGrpcWebTransport } from "@connectrpc/connect-web";
import { PriceQuoteRequestSchema } from "@nillion/client-vms/gen-proto/nillion/payments/v1/quote_pb";
import { ReceiptSchema } from "@nillion/client-vms/gen-proto/nillion/payments/v1/receipt_pb";
import {
  type PaymentClient,
  PaymentClientBuilder,
  createSignerFromKey,
} from "@nillion/client-vms/payment";
import { fetchClusterDetails } from "@nillion/client-vms/vm";
import { describe, expect, it } from "vitest";
import { ZodError } from "zod";
import { Env, PrivateKeyPerSuite } from "./helpers";

describe("PaymentClient", () => {
  let client: PaymentClient;

  it("builder rejects if missing values", async () => {
    try {
      const builder = new PaymentClientBuilder();
      await builder.build();
    } catch (e) {
      expect(e).toBeInstanceOf(ZodError);
      expect((e as ZodError).issues).toHaveLength(3);
    }

    expect.assertions(2);
  });

  it("builder can create client", async () => {
    const cluster = await fetchClusterDetails(Env.bootnodeUrl);
    const signer = await createSignerFromKey(PrivateKeyPerSuite.Payments);
    const builder = new PaymentClientBuilder();

    const leader = createGrpcWebTransport({
      baseUrl: cluster.leader?.grpcEndpoint ?? "",
      useBinaryFormat: true,
    });

    client = await builder
      .chainUrl(Env.nilChainUrl)
      .leader(leader)
      .signer(signer)
      .build();

    expect(client).toBeDefined();
  });

  it("can pay for an operation", async () => {
    const request = create(PriceQuoteRequestSchema, {
      operation: {
        case: "poolStatus",
        value: {},
      },
    });
    const signedReceipt = await client.payForOperation(request);
    const receipt = fromBinary(ReceiptSchema, signedReceipt.receipt);
    expect(receipt.expiresAt?.seconds).toBeGreaterThan(new Date().getSeconds());
    expect(receipt.identifier).toHaveLength(16);
  });
});
