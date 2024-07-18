import {
  Config,
  Days,
  effectToResultAsync,
  NadaValue,
  NadaValues,
  NilVmClient,
  NilVmClientConnectionArgs,
  Operation,
  Permissions,
  ProgramBindings,
  ProgramId,
  ProgramName,
  StoreId,
  ValueName,
} from "@nillion/core";
import configFixture from "../../fixture/network.json";
import { expectOk, loadProgram } from "../../fixture/helpers";

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
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    console.log(`*** Start ${SUITE_NAME} ***`);
    client = NilVmClient.create();
    expect(client).toBeDefined();

    const config = Config.TestFixture;
    const args: NilVmClientConnectionArgs = {
      bootnodes: config.bootnodes,
      clusterId: config.clusterId,
      userSeed: "nillion-testnet-seed-1",
      nodeSeed: "nillion-testnet-seed-1",
    };
    await client.connect(args);
  });

  afterAll(() => {
    console.log(`*** Finish ${SUITE_NAME} *** \n\n`);
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
    const effect = client.fetchOperationQuote({ operation });
    const result = await effectToResultAsync(effect);

    if (expectOk(result)) {
      expect(result.ok.cost.total).toBeGreaterThan(1);
    }
  });

  it("can get quote for permissions retrieve", async () => {
    const args = {
      id: data.store,
    };
    const operation = Operation.fetchPermissions(args);
    const effect = client.fetchOperationQuote({ operation });
    const result = await effectToResultAsync(effect);

    if (expectOk(result)) {
      expect(result.ok.cost.total).toBeGreaterThan(1);
    }
  });

  it("can get quote for permissions update", async () => {
    const args = {
      id: data.store,
      permissions: Permissions.create(),
    };
    const operation = Operation.setPermissions(args);
    const effect = client.fetchOperationQuote({ operation });
    const result = await effectToResultAsync(effect);

    if (expectOk(result)) {
      expect(result.ok.cost.total).toBeGreaterThan(1);
    }
  });

  it("can get quote for program store", async () => {
    const program = await loadProgram("addition_division.nada.bin");
    const args = { program, name: ProgramName.parse("foo") };
    const operation = Operation.storeProgram(args);
    const effect = client.fetchOperationQuote({ operation });
    const result = await effectToResultAsync(effect);

    if (expectOk(result)) {
      expect(result.ok.cost.total).toBeGreaterThan(1);
    }
  });

  it("can get quote for values store", async () => {
    const args = {
      values: NadaValues.create().insert(
        ValueName.parse("foo"),
        NadaValue.createIntegerSecret(3),
      ),
      ttl: Days.parse(1),
    };
    const operation = Operation.storeValues(args);
    const effect = client.fetchOperationQuote({ operation });
    const result = await effectToResultAsync(effect);

    if (expectOk(result)) {
      expect(result.ok.cost.total).toBeGreaterThan(1);
    }
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
    const operation = Operation.updateValues(args);
    const effect = client.fetchOperationQuote({ operation });
    const result = await effectToResultAsync(effect);

    if (expectOk(result)) {
      expect(result.ok.cost.total).toBeGreaterThan(1);
    }
  });
});
