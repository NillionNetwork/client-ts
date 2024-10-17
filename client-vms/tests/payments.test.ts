import { create, fromBinary } from "@bufbuild/protobuf";
import { createGrpcWebTransport } from "@connectrpc/connect-web";
import { describe, expect, test } from "@jest/globals";
import { ZodError } from "zod";

import { PriceQuoteRequestSchema } from "@nillion/client-vms/gen-proto/nillion/payments/v1/quote_pb";
import { ReceiptSchema } from "@nillion/client-vms/gen-proto/nillion/payments/v1/receipt_pb";
import {
  createSignerFromKey,
  PaymentClient,
  PaymentClientBuilder,
} from "@nillion/client-vms/payment";
import { fetchClusterDetails } from "@nillion/client-vms/vm";

import { Env, PrivateKeyPerSuite } from "./helpers";

describe("PaymentClient", () => {
  let client: PaymentClient;

  test("builder rejects if missing values", async () => {
    try {
      const builder = new PaymentClientBuilder();
      await builder.build();
    } catch (e) {
      expect(e).toBeInstanceOf(ZodError);
      expect((e as ZodError).issues).toHaveLength(3);
    }

    expect.assertions(2);
  });

  test("builder can create client", async () => {
    const cluster = await fetchClusterDetails(Env.bootnodeUrl);
    const signer = await createSignerFromKey(PrivateKeyPerSuite.Payments);
    const builder = new PaymentClientBuilder();

    const leader = createGrpcWebTransport({
      baseUrl: cluster.leader?.grpcEndpoint ?? "",
      useBinaryFormat: true,
    });

    client = await builder
      .chainUrl(Env.nilChainJsonRpc)
      .leader(leader)
      .signer(signer)
      .build();

    expect(client).toBeDefined();
  });

  test("can pay for an operation", async () => {
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
