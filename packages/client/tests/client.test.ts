import {
  Days,
  init,
  NadaValue,
  NadaValues,
  NadaValueType,
  NilVmClient,
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
    console.log(`>>> Start ${SUITE_NAME}`);
    await init();

    context = await loadClientsAndConfig();
    expect(context.client).toBeInstanceOf(NillionClient);
    expect(context.clientVm).toBeInstanceOf(NilVmClient);
    expect(context.clientChain).toBeInstanceOf(NilChainPaymentClient);
  });

  afterAll(() => {
    console.log(`<<< Finish ${SUITE_NAME}\n\n`);
  });

  it("can fetch cluster information", async () => {
    const { client, clientVm } = context;
    const result = await client.fetchClusterInfo();
    expect(result.id).toEqual(clientVm.clusterId);
  });

  testTypes.forEach((test: TestType) => {
    describe(test.type, () => {
      const { name, type, value } = test;
      it("store value", async () => {
        const { client } = context;
        const values = NadaValues.create().insert(name, value);

        const { data } = await client.storeValues({
          values,
        });
        test.id = data;
        expect(data).toBeDefined();
      });

      it("fetch value", async () => {
        const { client } = context;

        const result = await client.fetchValue({
          id: test.id,
          name,
          type,
        });

        let actual = result.data;
        let expected: unknown = test.value.data;

        if (actual instanceof Uint8Array) {
          actual = Array.from(actual);
          expected = Array.from(expected as Uint8Array);
        }
        expect(expected).toEqual(actual);
      });

      it("update value", async () => {
        const { client } = context;
        const { data } = await client.updateValue({
          id: test.id,
          values: NadaValues.create().insert(name, test.nextValue),
          ttl: Days.parse(1),
        });
        expect(data).toBeDefined();
      });

      it("retrieve after update", async () => {
        const { client } = context;
        const result = await client.fetchValue({
          id: test.id,
          name,
          type,
        });

        let actual = result.data;
        let expected: unknown = test.nextValue.data;

        if (actual instanceof Uint8Array) {
          actual = Array.from(actual);
          expected = Array.from(expected as Uint8Array);
        }
        expect(expected).toEqual(actual);
      });

      it("delete", async () => {
        const { client } = context;
        const result = await client.deleteValues({ id: test.id });
        expect(result).toEqual(test.id);
      });

      it("should fail to retrieve deleted value", async () => {
        try {
          await context.client.fetchValue({
            id: test.id,
            name,
            type,
          });
          expect(true).toBeFalse(); // should never be reached
          // @ts-expect-error to avoid verbose type checking in test
        } catch (e: Error) {
          expect(e.message).toContain("values not found");
        }
      });
    });
  });

  describe("permissions", () => {
    const name = ValueName.parse("secretFoo");
    const type = NadaValueType.enum.IntegerSecret;
    const value = NadaValue.createIntegerSecret(42);
    const values = NadaValues.create().insert(name, value);
    let id = "" as StoreId;

    it("can store access controlled values", async () => {
      const { client, clientVm } = context;
      const { data } = await client.storeValues({
        values,
        permissions: Permissions.createDefaultForUser(clientVm.userId),
      });
      expect(data).toBeDefined();
      id = data;
    });

    it("can fetch value when authorized", async () => {
      const { client } = context;
      const { data } = await client.fetchValue<number>({
        id,
        name,
        type,
      });

      expect(data).toBeDefined();
      expect(data).toBe(value.data);
    });

    it("can retrieve permissions", async () => {
      const { client } = context;
      const { data } = await client.fetchPermissions({
        id,
      });
      expect(data).toBeDefined();
    });

    it("can update permissions", async () => {
      const { client } = context;
      const permissions = Permissions.create();
      const { data } = await client.setPermissions({
        id,
        permissions,
      });

      expect(data).toBeDefined();
    });

    it("value fetch rejected when not authorized", async () => {
      try {
        await context.client.fetchPermissions({
          id,
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

      const { data } = await client.storeProgram({
        program,
        name: ProgramName.parse("addition_division"),
      });

      expect(data).toBeDefined();
    });

    it("can concurrently store programs", async () => {
      pending("Fails due to: account sequence mismatch");

      const { client } = context;
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

      const foo = results[0].data;
      const bar = results[1].data;
      expect(foo).toBeDefined();
      expect(bar).toBeDefined();
    });

    testPrograms.forEach((test) => {
      describe(test.name, () => {
        beforeAll(async () => {
          const { client, clientVm } = context;
          test.id = ProgramId.parse(
            `${context.configFixture.programsNamespace}/${test.name}`,
          );
          for (const values of test.valuesToStore) {
            const permissions = Permissions.create().allowCompute(
              clientVm.userId,
              test.id,
            );

            const { data } = await client.storeValues({
              values,
              permissions,
            });
            test.storeIds.push(data);
          }
        });

        it("can compute", async () => {
          const { client, clientVm } = context;
          const bindings = ProgramBindings.create(test.id);

          test.inputParties.forEach((party) => {
            bindings.addInputParty(party, clientVm.partyId);
          });

          test.outputParties.forEach((party) => {
            bindings.addOutputParty(party, clientVm.partyId);
          });

          const { data } = await client.compute({
            bindings,
            values: test.valuesToInput,
            storeIds: test.storeIds,
          });

          test.result.id = data;
          expect(data).toBeDefined();
        });

        it("can get result", async () => {
          const data = await context.client.fetchComputeResult({
            id: test.result.id,
          });
          expect(data).toEqual(test.result.expected);
        });
      });
    });
  });
});
