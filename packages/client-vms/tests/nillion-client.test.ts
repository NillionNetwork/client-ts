import {
  Days,
  NadaValue,
  NadaValues,
  NadaValueType,
  NamedValue,
  Operation,
  Permissions,
  ProgramBindings,
  ProgramName,
  StoreId,
} from "@nillion/client-core";
import { NillionClient } from "@nillion/client-vms";
import {
  expectErr,
  expectOk,
  getNetworkConfig,
  getUserCredentials,
  loadProgram,
} from "@nillion/test-utils";

import {
  type TestNadaType,
  testNadaTypes,
  testPrograms,
  type TestSimpleType,
  testSimpleTypes,
} from "./helpers";

const SUITE_NAME = "@nillion/client-vms";

describe(SUITE_NAME, () => {
  let client: NillionClient;

  beforeAll(async () => {
    console.log(`*** Start ${SUITE_NAME} ***`);
    client = NillionClient.create();
    const networkConfig = getNetworkConfig();
    console.log(`Network config: %O`, networkConfig);
    const userCredentials = getUserCredentials();
    console.log(`User credentials: %O`, userCredentials);

    client.setNetworkConfig(networkConfig);
    client.setUserCredentials(userCredentials);

    await client.connect();
  });

  afterAll(() => {
    console.log(`*** Finish ${SUITE_NAME} *** \n\n`);
  });

  it("can fetch cluster information", async () => {
    const result = await client.fetchClusterInfo();
    if (expectOk(result)) {
      expect(result.ok.id).toEqual(client.vm.clusterId);
    }
  });

  it("can fetch an operation quote", async () => {
    const args = {
      operation: Operation.fetchPermissions({ id: "" as StoreId }),
    };
    const result = await client.fetchOperationQuote(args);
    if (expectOk(result)) {
      expect(result.ok.cost.total).toBeGreaterThan(1);
    }
  });

  describe("ergonomic functions naked value", () => {
    testSimpleTypes.forEach((test: TestSimpleType) => {
      describe(test.type, () => {
        it("can store value", async () => {
          const result = await client.store({
            name: test.name,
            value: test.expected,
            ttl: 1,
          });
          if (expectOk(result)) {
            expect(result.ok).toBeDefined();
            test.id = result.ok;
          }
        });

        it("can retrieve value", async () => {
          const result = await client.fetch({
            id: test.id,
            name: test.name,
            type: test.type,
          });
          expect(result.ok).toEqual(test.expected);
        });
      });
    });
  });

  testNadaTypes.forEach((test: TestNadaType) => {
    describe(test.type, () => {
      const { name, type, value } = test;
      it("store value", async () => {
        const values = NadaValues.create().insert(name, value);

        const result = await client.storeValues({
          values,
          ttl: Days.parse(1),
        });
        if (expectOk(result)) {
          test.id = result.ok;
        }
      });

      it("fetch value", async () => {
        const result = await client.fetchValue({
          id: test.id,
          name,
          type,
        });

        if (expectOk(result)) {
          const actual = result.ok.data;
          const expected: unknown = test.value.data;
          expect(expected).toEqual(actual);
        }
      });

      it("update value", async () => {
        const result = await client.updateValue({
          id: test.id,
          values: NadaValues.create().insert(name, test.nextValue),
          ttl: Days.parse(1),
        });
        expectOk(result);
      });

      it("retrieve after update", async () => {
        const result = await client.fetchValue({
          id: test.id,
          name,
          type,
        });

        if (expectOk(result)) {
          const actual = result.ok.data;
          const expected: unknown = test.nextValue.data;
          expect(expected).toEqual(actual);
        }
      });

      it("delete", async () => {
        const result = await client.deleteValues({ id: test.id });

        if (expectOk(result)) {
          expect(result.ok).toEqual(test.id);
        }
      });

      it("should fail to retrieve deleted value", async () => {
        const result = await client.fetchValue({
          id: test.id,
          name,
          type,
        });

        if (expectErr(result)) {
          expect(result.err).toBeDefined();
        }
      });
    });
  });

  describe("permissions", () => {
    const name = NamedValue.parse("secretFoo");
    const type = NadaValueType.enum.SecretInteger;
    const value = NadaValue.createSecretInteger(42);
    const values = NadaValues.create().insert(name, value);
    let id = "" as StoreId;

    it("can store access controlled values", async () => {
      const result = await client.storeValues({
        values,
        ttl: Days.parse(1),
        permissions: Permissions.createDefaultForUser(client.vm.userId),
      });

      if (expectOk(result)) {
        id = result.ok;
      }
    });

    it("can fetch value when authorized", async () => {
      const result = await client.fetchValue({
        id,
        name,
        type,
      });
      if (expectOk(result)) {
        expect(result.ok.data).toBe(value.data);
      }
    });

    it("can retrieve permissions", async () => {
      const result = await client.fetchPermissions({
        id,
      });
      expectOk(result);
    });

    it("can update permissions", async () => {
      const permissions = Permissions.create();
      const result = await client.setPermissions({
        id,
        permissions,
      });

      expectOk(result);
    });

    it("value fetch rejected when not authorized", async () => {
      const result = await client.fetchPermissions({
        id,
      });
      if (expectErr(result)) {
        expect(result.err.message).toContain("user is not authorized");
      }
    });
  });

  describe("programs", () => {
    it("can store a program", async () => {
      const program = await loadProgram("addition_division.nada.bin");

      const result = await client.storeProgram({
        program,
        name: ProgramName.parse("addition_division.nada.bin"),
      });
      expectOk(result);
    });

    testPrograms.forEach((test) => {
      describe(test.name, () => {
        beforeAll(async () => {
          for (const values of test.valuesToStore) {
            const permissions = Permissions.create().allowCompute(
              client.vm.userId,
              test.id,
            );

            const result = await client.storeValues({
              values,
              ttl: Days.parse(1),
              permissions,
            });
            if (expectOk(result)) {
              test.storeIds.push(result.ok);
            }
          }
        });

        it("can compute", async () => {
          const bindings = ProgramBindings.create(test.id);

          test.inputParties.forEach((party) => {
            bindings.addInputParty(party, client.vm.partyId);
          });

          test.outputParties.forEach((party) => {
            bindings.addOutputParty(party, client.vm.partyId);
          });

          const result = await client.runProgram({
            bindings,
            values: test.valuesToInput,
            storeIds: test.storeIds,
          });

          if (expectOk(result)) {
            test.result.id = result.ok;
          }
        });

        it("can get result", async () => {
          const result = await client.fetchProgramOutput({
            id: test.result.id,
          });
          if (expectOk(result)) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            expect(result.ok).toEqual(test.result.expected);
          }
        });
      });
    });
  });
});
