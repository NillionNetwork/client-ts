import {
  Days,
  NadaValue,
  NadaValues,
  NadaValueType,
  NadaPrimitiveValue,
  Operation,
  Permissions,
  ProgramBindings,
  ProgramId,
  ProgramName,
  StoreId,
  NamedValue,
  NamedNetwork,
  PrivateKeyBase16,
} from "@nillion/core";
import { NillionClient } from "@nillion/client";
import { testPrograms } from "./programs";
import { TestNadaType, testNadaTypes } from "./nada-values";
import { expectOk, expectErr, loadProgram } from "../../fixture/helpers";
import { TestSimpleType, testSimpleTypes } from "./simple-values";
import fixtureConfig from "../../fixture/network.json";
import { createSignerFromKey } from "@nillion/payments";

const SUITE_NAME = "@nillion/client";

describe(SUITE_NAME, () => {
  let client: NillionClient;
  const programsNamespace = fixtureConfig.programs_namespace;

  beforeAll(async () => {
    console.log(`*** Start ${SUITE_NAME} ***`);

    client = NillionClient.create({
      network: NamedNetwork.enum.TestFixture,

      overrides: async () => {
        const key = PrivateKeyBase16.parse(fixtureConfig.payments_key);
        const signer = await createSignerFromKey(key);

        return {
          signer,
        };
      },
    });

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
          const result = await client.store(test.expected);
          if (expectOk(result)) {
            expect(result.ok).toBeDefined();
            test.id = result.ok;
          }
        });

        it("can retrieve value", async () => {
          const names: [string, NadaValueType][] = Object.keys(
            test.expected,
          ).map((name) => [name, test.type]);
          const result = await client.fetch(test.id, names);
          if (expectOk(result)) {
            expect(result.ok).toEqual(test.expected);
          }
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
          let actual: NadaPrimitiveValue | number[] = result.ok;
          let expected: unknown = test.value.data;
          if (actual instanceof Uint8Array) {
            actual = Array.from(actual);
            expected = Array.from(expected as Uint8Array);
          }
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
          let actual: NadaPrimitiveValue | number[] = result.ok;
          let expected: unknown = test.nextValue.data;
          if (actual instanceof Uint8Array) {
            actual = Array.from(actual);
            expected = Array.from(expected as Uint8Array);
          }
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
          expect(result.err.message).toContain("values not found");
        }
      });
    });
  });

  describe("permissions", () => {
    const name = NamedValue.parse("secretFoo");
    const type = NadaValueType.enum.IntegerSecret;
    const value = NadaValue.createIntegerSecret(42);
    const values = NadaValues.create().insert(name, value);
    let id = "" as StoreId;

    it("can store access controlled values", async () => {
      const result = await client.storeValues({
        values,
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
        expect(result.ok).toBe(value.data);
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
        name: ProgramName.parse("addition_division"),
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
          test.id = ProgramId.parse(`${programsNamespace}/${test.name}`);
          for (const values of test.valuesToStore) {
            const permissions = Permissions.create().allowCompute(
              client.vm.userId,
              test.id,
            );

            const result = await client.storeValues({
              values,
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
          const result = await client.fetchRunProgramResult({
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
