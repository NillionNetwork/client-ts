import {
  Days,
  NadaValue,
  NadaValues,
  NadaValueType,
  Operation,
  Permissions,
  ProgramBindings,
  ProgramName,
  StoreId,
  NamedValue,
} from "@nillion/client-core";
import { NillionClient } from "@nillion/client-vms";
import { testPrograms } from "./programs";
import { TestNadaType, testNadaTypes } from "./nada-values";
import {
  expectOk,
  expectErr,
  loadProgram,
  getNillionClientEnvConfig,
} from "../../test-utils";
import { TestSimpleType, testSimpleTypes } from "./simple-values";

const SUITE_NAME = "@nillion/client-vms";

describe(SUITE_NAME, () => {
  let client: NillionClient;

  beforeAll(async () => {
    console.log(`*** Start ${SUITE_NAME} ***`);
    const config = getNillionClientEnvConfig();
    client = NillionClient.create(config);

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
            values: { data: test.expected },
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
            type: test.type,
            name: "data",
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

    it("can concurrently store programs", async () => {
      pending("Fails due to: account sequence mismatch");

      const program = await loadProgram("addition_division.nada.bin");
      const names = ["addition_division_foo", "addition_division_bar"];

      const promises = names.map((name) =>
        client.storeProgram({
          program,
          name: ProgramName.parse(name),
        }),
      );

      const results = await Promise.all(promises);
      expect(results).toHaveSize(2);
      expectOk(results[0]);
      expectOk(results[1]);
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
