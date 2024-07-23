import {
  PartialConfig,
  effectToResultAsync,
  init,
  VmClient,
  StoreId,
  VmClientConfig,
} from "@nillion/client-core";
import { expectOk } from "../../fixture/helpers";
import { Effect as E } from "effect";

const SUITE_NAME = `@nillion/client-core > initialization`;

describe(SUITE_NAME, () => {
  let client: VmClient;
  const config = VmClientConfig.parse(PartialConfig.TestFixture);

  beforeAll(() => {
    console.log(`*** Start ${SUITE_NAME} ***`);
  });

  afterAll(() => {
    console.log(`*** Finish ${SUITE_NAME} *** \n\n`);
  });

  it("handles multiple init() calls", async () => {
    await init();
    await init();
    expect(true).toBeTruthy();
  });

  it("window.__NILLION should be defined", () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const nillion = globalThis.__NILLION!;
    expect(nillion).toBeDefined();
    expect(nillion.initialized).toBeTruthy();
    expect(nillion.enableTelemetry).toBeDefined();
    expect(nillion.enableLogging).toBeDefined();
    expect(nillion.enableWasmLogging).toBeDefined();
  });

  it("can create NilVmClient", () => {
    client = VmClient.create(config);
    expect(client).toBeDefined();
  });

  it("throws if not connected but access attempted", async () => {
    try {
      const _result = await E.runPromise(
        client.deleteValues({ id: "" as StoreId }),
      );
      expect(true).toBeFalse();
    } catch (e: unknown) {
      // @ts-expect-error for test simplicity
      expect(e.message).toContain("NilVmClient not ready");
    }
  });

  it("can connect", async () => {
    await client.connect();
    expect(client.ready).toBeTrue();
  });

  it("can compute stable partyId from seed 'nillion-testnet-seed-1'", () => {
    const partyId = client.partyId;
    expect(partyId).toBeDefined();
    expect(partyId).toEqual(
      "12D3KooWGq5MCUuLARrwM95muvipNWy4MqmCk41g9k9JVth6AF6e",
    );
  });

  it("can fetch the cluster descriptor", async () => {
    const result = await effectToResultAsync(client.fetchClusterInfo());
    if (expectOk(result)) {
      expect(result.ok.id).toBe(client.clusterId);
    }
  });
});
