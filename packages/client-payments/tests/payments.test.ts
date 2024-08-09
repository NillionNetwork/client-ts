import { effectToResultAsync, PriceQuote } from "@nillion/client-core";
import { PaymentClientConfig, PaymentsClient } from "@nillion/client-payments";
import { expectOk, getPaymentsClientEnvConfig } from "../../test-utils";

const SUITE_NAME = "@nillion/client-payments";

describe(SUITE_NAME, () => {
  let client: PaymentsClient;
  let config: PaymentClientConfig;

  beforeAll(() => {
    console.log(`*** Start ${SUITE_NAME} ***`);
  });

  afterAll(() => {
    console.log(`*** Finish ${SUITE_NAME} *** \n\n`);
  });

  it("can create NilChainPaymentClient", async () => {
    config = await getPaymentsClientEnvConfig();
    client = PaymentsClient.create(config);
    expect(client).toBeDefined();
  });

  it("throws if not connected but access attempted", () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      client.address;
      expect(true).toBeFalse();
    } catch (e: unknown) {
      // @ts-expect-error for test simplicity
      expect(e.message).toContain("NilChainPaymentClient not ready");
    }
  });

  it("can connect", async () => {
    await client.connect();
    expect(client.address).toBe(
      "nillion14x7fd38t8wvh2ypy2fph270wkv8g754tjcny5j",
    );
  });

  it("can make a payment", async () => {
    const quote = PriceQuote.parse({
      expires: new Date(),
      nonce: new Uint8Array(),
      cost: {
        base: 1,
        compute: 1,
        congestion: 1,
        preprocessing: 1,
        storage: 1,
        total: 5,
      },
    });

    const effect = client.pay(quote);
    const result = await effectToResultAsync(effect);
    expectOk(result);
  });
});
