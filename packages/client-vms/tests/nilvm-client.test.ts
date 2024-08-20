import {
  Days,
  effectToResultAsync,
  NadaValue,
  NadaValues,
  NamedValue,
  Operation,
  Permissions,
  ProgramBindings,
  ProgramId,
  ProgramName,
  StoreId,
} from "@nillion/client-core";
import { NilVmClient } from "@nillion/client-vms";
import {
  expectOk,
  getVmClientEnvConfig,
  loadProgram,
  TestEnv,
} from "../../test-utils";

const SUITE_NAME = `@nillion/client-vms > NilVmClient`;

describe(SUITE_NAME, () => {
  const config = getVmClientEnvConfig();
  const client = NilVmClient.create(config);

  const data = {
    store: StoreId.parse("aaaaaaaa-bbbb-cccc-dddd-ffffffffffff"),
    program: ProgramId.parse(
      `${String(TestEnv.programNamespace)}/simple_shares.nada.bin`,
    ),
  };

  beforeAll(async () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    console.log(`*** Start ${SUITE_NAME} ***`);
    console.log(`Config: %O`, config);
    await client.connect();
  });

  afterAll(() => {
    console.log(`*** Finish ${SUITE_NAME} *** \n\n`);
  });

  it("can get quote for compute", async () => {
    const args = {
      bindings: ProgramBindings.create(data.program),
      values: NadaValues.create().insert(
        NamedValue.parse("foo"),
        NadaValue.createSecretInteger(1),
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
    const args = {
      program,
      name: ProgramName.parse("addition_division.nada.bin"),
    };
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
        NamedValue.parse("foo"),
        NadaValue.createSecretInteger(3),
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
        NamedValue.parse("foo"),
        NadaValue.createSecretInteger(3),
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
