import {
  ActionId,
  ComputeResultId,
  Days,
  init,
  NadaValue,
  NadaValues,
  NadaValueType,
  NilVmClient,
  Operation,
  Permissions,
  ProgramBindings,
  ProgramId,
  ProgramName,
  StoreId,
  ValueName,
} from "@nillion/core";
import {
  ClientsAndConfig,
  loadClientsAndConfig,
  loadProgram,
} from "../test-helpers";
import { NillionClient } from "@nillion/client";
import { NilChainPaymentClient } from "@nillion/payments";
import { testPrograms } from "./programs";
import { TestType, testTypes } from "./values";

const SUITE_NAME = "@nillion/client";

describe(SUITE_NAME, () => {
  let context: ClientsAndConfig;

  beforeAll(async () => {
    console.log("starting @nillion/client test suite");
    await init();

    // @ts-expect-error override as we need to build the correct structure through tests
    context = await loadClientsAndConfig<TestData>();

    expect(context.client).toBeInstanceOf(NillionClient);
    expect(context.clientVm).toBeInstanceOf(NilVmClient);
    expect(context.clientChain).toBeInstanceOf(NilChainPaymentClient);
  });

  afterAll(() => {
    console.log("finished @nillion/client test suite");
  });

  type Test = {
    id: StoreId;
    name: ValueName;
    type: NadaValueType;
    value: NadaValue;
    nextValue: NadaValue;
  };

  testTypes.forEach((test: TestType) => {
    describe(test.type, () => {
      const { name, type, value } = test;
      it("store", async () => {
        const { client } = context;
        const values = NadaValues.create().insert(name, value);

        const { result: id } = await client.execute<StoreId>({
          operation: Operation.valuesStore({ values, ttl: Days.parse(1) }),
        });
        test.id = id;
        expect(id).toBeDefined();
      });

      it("retrieve", async () => {
        const { client } = context;
        const { result } = await client.execute<NadaValue>({
          operation: Operation.valueRetrieve({
            id: test.id,
            name,
            type,
          }),
        });

        let actual: unknown = result.data;
        let expected: unknown = test.value.data;

        if (actual instanceof Uint8Array) {
          actual = Array.from(actual);
          expected = Array.from(expected as Uint8Array);
        }
        expect(expected).toEqual(actual);
      });

      it("update", async () => {
        const { client } = context;

        const { result: actionId } = await client.execute<ActionId>({
          operation: Operation.valuesUpdate({
            id: test.id,
            values: NadaValues.create().insert(name, test.nextValue),
            ttl: Days.parse(1),
          }),
        });
        expect(actionId).toBeDefined();
      });

      it("retrieve", async () => {
        const { client } = context;
        const { result } = await client.execute<NadaValue>({
          operation: Operation.valueRetrieve({
            id: test.id,
            name,
            type: test.type,
          }),
        });

        let actual: unknown = result.data;
        let expected: unknown = test.nextValue.data;

        if (actual instanceof Uint8Array) {
          actual = Array.from(actual);
          expected = Array.from(expected as Uint8Array);
        }
        expect(expected).toEqual(actual);
      });

      it("delete", async () => {
        const { client } = context;
        const { result } = await client.execute<StoreId>({
          operation: Operation.valuesDelete({
            id: test.id,
          }),
        });

        expect(result).toEqual(test.id);
      });

      it("should fail to retrieve deleted value", async () => {
        try {
          const { client } = context;
          await client.execute<NadaValue>({
            operation: Operation.valueRetrieve({
              id: test.id,
              name,
              type,
            }),
          });
          // should never be reached
          expect(true).toBeFalse();

          // @ts-expect-error to avoid verbose type checking in test
        } catch (e: Error) {
          const message = e.message;
          expect(message).toContain("values not found");
        }
      });
    });
  });

  describe("permissions", () => {
    const name = ValueName.parse("secretFoo");
    const type = NadaValueType.enum.IntegerSecret;
    const value = NadaValue.createIntegerSecret(42);
    const values = NadaValues.create().insert(name, value);
    let permissions = Permissions.create();
    let operation = Operation.valuesStore({
      values,
      ttl: Days.parse(1),
    });
    let id = "" as StoreId;

    beforeAll(async () => {
      permissions = Permissions.createDefaultForUser(context.clientVm.userId);
      operation = Operation.valuesStore({
        values,
        ttl: Days.parse(1),
        permissions,
      });
    });

    it("can store access controlled values ", async () => {
      const { result } = await context.client.execute<StoreId>({
        operation,
      });
      expect(result).toBeDefined();
      id = result;
    });

    it("can retrieve access controlled value when authorized", async () => {
      const operation = Operation.valueRetrieve({
        id,
        name,
        type,
      });
      const { result } = await context.client.execute<NadaValue<number>>({
        operation,
      });
      expect(result).toBeDefined();
      expect(result.data).toBe(value.data);
    });

    it("can retrieve a store id's permissions", async () => {
      const operation = Operation.permissionsRetrieve({ id });
      const { result } = await context.client.execute({
        operation,
      });

      expect(result).toBeDefined();
    });

    it("can update permissions", async () => {
      const permissions = Permissions.create();
      const operation = Operation.permissionsUpdate({ id, permissions });
      const { result } = await context.client.execute({
        operation,
      });

      expect(result).toBeDefined();
    });

    it("cannot retrieve value when not authorized", async () => {
      const operation = Operation.permissionsRetrieve({ id });
      try {
        await context.client.execute({
          operation,
        });
        // should never be reached
        expect(true).toBeFalse();

        // @ts-expect-error to avoid verbose type checking in test
      } catch (e: Error) {
        const message = e.message;
        expect(message).toContain("user is not authorized");
      }
    });
  });

  describe("programs", () => {
    it("can store a program", async () => {
      const { client } = context;
      const program = await loadProgram("addition_division.nada.bin");

      const { result } = await client.execute<ProgramId>({
        operation: Operation.programStore({
          program,
          name: ProgramName.parse("addition_division"),
        }),
      });

      expect(result).toBeDefined();
    });

    it("can concurrently store programs", async () => {
      pending("Fails due to: account sequence mismatch");

      const { client } = context;
      const program = await loadProgram("addition_division.nada.bin");
      const names = ["addition_division_foo", "addition_division_bar"];

      const promises = names.map((name) =>
        client.execute<ProgramId>({
          operation: Operation.programStore({
            program,
            name: ProgramName.parse(name),
          }),
        }),
      );

      const results = await Promise.all(promises);
      expect(results).toHaveSize(2);

      const foo = results[0].result;
      const bar = results[1].result;
      expect(foo).toBeDefined();
      expect(bar).toBeDefined();
    });

    testPrograms.forEach((test) => {
      describe(test.name, () => {
        beforeAll(async () => {
          const { clientVm } = context;
          test.id = ProgramId.parse(
            `${context.configFixture.programsNamespace}/${test.name}`,
          );
          for (const values of test.valuesToStore) {
            const permissions = Permissions.create().allowCompute(
              clientVm.userId,
              test.id,
            );

            const { result: storeId } = await context.client.execute<StoreId>({
              operation: Operation.valuesStore({
                values,
                ttl: Days.parse(1),
                permissions,
              }),
            });
            test.storeIds.push(storeId);
          }
        });
        it("can compute", async () => {
          const { clientVm } = context;
          const bindings = ProgramBindings.create(test.id);

          test.inputParties.forEach((party) => {
            bindings.addInputParty(party, clientVm.partyId);
          });

          test.outputParties.forEach((party) => {
            bindings.addOutputParty(party, clientVm.partyId);
          });

          const { result } = await context.client.execute<ComputeResultId>({
            operation: Operation.compute({
              bindings,
              values: test.valuesToInput,
              storeIds: test.storeIds,
            }),
          });

          test.result.id = result;
          expect(result).toBeDefined();
        });

        it("can get result", async () => {
          const { result } = await context.client.execute<object>({
            operation: Operation.computeRetrieveResult({
              id: test.result.id,
            }),
          });
          expect(result).toEqual(test.result.expected);
        });
      });
    });
  });
});
