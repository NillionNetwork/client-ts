import { createSignerFromKey, NilChainPaymentClient } from "@nillion/payments";
import {
  Config,
  effectToResultAsync,
  PriceQuote,
  PrivateKeyBase16,
} from "@nillion/core";
import fixtureConfig from "../../fixture/network.json";

const SUITE_NAME = "@nillion/payments";

describe(SUITE_NAME, () => {
  let client: NilChainPaymentClient;

  beforeAll(async () => {
    console.log(`>>> Start ${SUITE_NAME}`);
  });

  afterAll(() => {
    console.log(`<<< Finish ${SUITE_NAME}\n\n`);
  });

  it("can create NilChainPaymentClient", async () => {
    const config = Config.TestFixture;
    const key = PrivateKeyBase16.parse(fixtureConfig.payments_key);
    const signer = await createSignerFromKey(key);
    client = await NilChainPaymentClient.create(config.chainEndpoint, signer);

    expect(client).toBeDefined();
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
    const hash = result.ok!;
    expect(hash).toBeDefined();
  });
});