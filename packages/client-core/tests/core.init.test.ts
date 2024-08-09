import {
  effectToResultAsync,
  init,
  StoreId,
  VmClient,
} from "@nillion/client-core";
import { Effect as E } from "effect";
import { expectOk, getVmClientEnvConfig } from "../../test-utils";

const SUITE_NAME = `@nillion/client-core > initialization`;

describe(SUITE_NAME, () => {
  const config = getVmClientEnvConfig();
  let client: VmClient;

  beforeAll(() => {
    console.log(`*** Start ${SUITE_NAME} ***`);
    console.log(`Config: %O`, config);
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
      // @ts-expect-error skip type check for test simplicity
      expect(e.message).toMatch("An unknown error occurred");
    }
  });

  it("can connect", async () => {
    await client.connect();
    expect(client.ready).toBeTrue();
  });

  it("can compute stable partyId from seed 'nillion-testnet-seed-1'", () => {
    const partyId = client.partyId;
    expect(partyId).toEqual(
      "12D3KooWEnWNWnuzuckMhAEKKMPvdDacy3K3tdCQDBtctsYMPe5r",
    );
  });

  it("can fetch the cluster descriptor", async () => {
    const result = await effectToResultAsync(client.fetchClusterInfo());
    if (expectOk(result)) {
      expect(result.ok.id).toBe(client.clusterId);
    }
  });
});
