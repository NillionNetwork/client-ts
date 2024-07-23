import {
  createSignerFromKey,
  PaymentClientConfig,
  PaymentsClient,
} from "@nillion/payments";
import {
  PartialConfig,
  effectToResultAsync,
  PriceQuote,
  PrivateKeyBase16,
} from "@nillion/core";
import fixtureConfig from "../../fixture/network.json";
import { expectOk } from "../../fixture/helpers";

const SUITE_NAME = "@nillion/payments";

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
    const key = PrivateKeyBase16.parse(fixtureConfig.payments_key);
    config = PaymentClientConfig.parse({
      ...PartialConfig.TestFixture,
      signer: await createSignerFromKey(key),
    });
    client = PaymentsClient.create(config);
    expect(client).toBeDefined();
  });

  it("throws if not connected but access attempted", () => {
    try {
      const _result = client.address;
      expect(true).toBeFalse();
    } catch (e: unknown) {
      // @ts-expect-error for test simplicity
      expect(e.message).toContain("NilChainPaymentClient not ready");
    }
  });

  it("can connect", async () => {
    await client.connect();
    expect(client.address).toBe(
      "nillion1uumg9ckysacwrkpljxavhjtw9vgkk86wtvu7w9",
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
