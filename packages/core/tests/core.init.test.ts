import { init } from "@nillion/core";

const SUITE_NAME = `@nillion/core > initialization`;

describe(SUITE_NAME, () => {
  beforeAll(async () => {
    console.log(`>>> Start ${SUITE_NAME}`);
  });

  afterAll(() => {
    console.log(`<<< Finish ${SUITE_NAME}\n\n`);
  });

  it("handles multiple init() calls", async () => {
    await init();
    await init();
    expect(true).toBeTruthy();
  });

  it("window.__NILLION should be defined", () => {
    const nillion = window?.__NILLION;

    expect(nillion).toBeDefined();
    expect(nillion.initialized).toBeTruthy();
    expect(nillion.enableTelemetry).toBeDefined();
    expect(nillion.enableLogging).toBeDefined();
    expect(nillion.enableWasmLogging).toBeDefined();
  });
});
