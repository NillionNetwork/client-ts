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
import fixtureConfig from "../src/fixture/local.json";
import { loadProgram } from "../helpers";

const SUITE_NAME = `@nillion/core > non-paid functions`;

describe(SUITE_NAME, () => {
  let client: NilVmClient;

  beforeAll(async () => {
    console.log(`>>> Start ${SUITE_NAME}`);
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
    const programId = ProgramId.parse(
      `${fixtureConfig.programs_namespace}/simple_shares`,
    );

    const args = {
      bindings: ProgramBindings.create(programId),
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
      id: StoreId.parse("db0835de-ad48-437d-9b2d-3a58efe809f6"),
    };
    const operation = Operation.permissionsRetrieve(args);
    const result = await client.priceQuoteRequest(operation);
    const quote = result.unwrap();
    expect(quote.cost.total).toBeGreaterThan(1);
  });

  it("can get quote for permissions update", async () => {
    const args = {
      id: StoreId.parse("db0835de-ad48-437d-9b2d-3a58efe809f6"),
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
      id: StoreId.parse("db0835de-ad48-437d-9b2d-3a58efe809f6"),
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
