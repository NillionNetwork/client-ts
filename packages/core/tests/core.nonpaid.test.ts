import {
  Config,
  Days,
  init,
  NadaValue,
  NadaValues,
  NilVmClient,
  NilVmClientArgs,
  Operation,
  Permissions,
  ProgramBindings,
  ProgramId,
  ProgramName,
  StoreId,
  ValueName,
} from "@nillion/core";
import configFixture from "../../fixture/network.json";

const SUITE_NAME = `@nillion/core > non-paid functions`;

describe(SUITE_NAME, () => {
  let client: NilVmClient;
  const data = {
    store: StoreId.parse("aaaaaaaa-bbbb-cccc-dddd-ffffffffffff"),
    program: ProgramId.parse(
      `${configFixture.programs_namespace}/simple_shares`,
    ),
  };

  beforeAll(async () => {
    console.log(`>>> Start ${SUITE_NAME}`);
    // jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    await init();
  });

  afterAll(() => {
    console.log(`<<< Finish ${SUITE_NAME}\n\n`);
  });

  it("can create NilVmClient", () => {
    const config = Config.TestFixture;
    const args: NilVmClientArgs = {
      bootnodes: config.bootnodes,
      clusterId: config.clusterId,
      userSeed: "nillion-testnet-seed-1",
      nodeSeed: "nillion-testnet-seed-1",
    };
    client = NilVmClient.create(args);
    expect(client).toBeDefined();
  });

  it("can compute stable partyId from seed 'nillion-testnet-seed-1'", () => {
    const partyId = client.partyId;
    expect(partyId).toBeDefined();
    expect(partyId).toEqual(
      "12D3KooWGq5MCUuLARrwM95muvipNWy4MqmCk41g9k9JVth6AF6e",
    );
  });

  it("can fetch the cluster descriptor", async () => {
    const result = await client.clusterInfoRetrieve();
    const descriptor = result.unwrap();
    expect(descriptor).toBeDefined();
    expect(descriptor.id).toBe(client.clusterId);
  });

  it("can get quote for compute", async () => {
    const args = {
      bindings: ProgramBindings.create(data.program),
      values: NadaValues.create().insert(
        ValueName.parse("foo"),
        NadaValue.createIntegerSecret(1),
      ),
      storeIds: [],
    };
    const operation = Operation.compute(args);
    const result = await client.priceQuoteRequest(operation);
    const quote = result.unwrap();
    expect(quote.cost.total).toBeGreaterThan(1);
  });

  it("can get quote for permissions retrieve", async () => {
    const args = {
      id: data.store,
    };
    const operation = Operation.permissionsRetrieve(args);
    const result = await client.priceQuoteRequest(operation);
    const quote = result.unwrap();
    expect(quote.cost.total).toBeGreaterThan(1);
  });

  it("can get quote for permissions update", async () => {
    const args = {
      id: data.store,
      permissions: Permissions.create(),
    };
    const operation = Operation.permissionsUpdate(args);
    const result = await client.priceQuoteRequest(operation);
    const quote = result.unwrap();
    expect(quote.cost.total).toBeGreaterThan(1);
  });

  it("can get quote for program store", async () => {
    const program = await loadProgram("addition_division.nada.bin");
    const args = { program, name: ProgramName.parse("foo") };
    const operation = Operation.programStore(args);
    const result = await client.priceQuoteRequest(operation);
    const quote = result.unwrap();
    expect(quote.cost.total).toBeGreaterThan(1);
  });

  it("can get quote for values store", async () => {
    const args = {
      values: NadaValues.create().insert(
        ValueName.parse("foo"),
        NadaValue.createIntegerSecret(3),
      ),
      ttl: Days.parse(1),
    };
    const operation = Operation.valuesStore(args);
    const result = await client.priceQuoteRequest(operation);
    const quote = result.unwrap();
    expect(quote.cost.total).toBeGreaterThan(1);
  });

  it("can get quote for values update", async () => {
    const args = {
      id: data.store,
      values: NadaValues.create().insert(
        ValueName.parse("foo"),
        NadaValue.createIntegerSecret(3),
      ),
      ttl: Days.parse(1),
    };
    const operation = Operation.valuesUpdate(args);
    const result = await client.priceQuoteRequest(operation);
    const quote = result.unwrap();
    expect(quote.cost.total).toBeGreaterThan(1);
  });
});

const loadProgram = async (name: string): Promise<Uint8Array> => {
  const path = `__src__/${name}`;
  console.log(path);
  try {
    const response = await fetch(path);
    const body = response.body!;
    const payload = await body.getReader().read();
    return payload.value!;
  } catch (e) {
    console.error(`failed to load program: ${path}`);
    console.error(`error: ${e}`);
    throw e;
  }
};
