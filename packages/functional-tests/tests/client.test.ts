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
  PartyName,
  Permissions,
  ProgramBindings,
  ProgramId,
  StoreId,
  ValueName,
} from "@nillion/core";
import {
  ClientsAndConfig,
  loadClientsAndConfig,
  strToByteArray,
} from "../helpers";
import { NillionClient } from "@nillion/client";
import { NilChainPaymentClient } from "@nillion/payments";
import fixtureConfig from "../src/fixture/local.json";

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

  const types = [
    {
      name: ValueName.parse("BlobSecret"),
      type: NadaValueType.enum.BlobSecret,
      value: NadaValue.createBlobSecret(strToByteArray("foo then bar...")),
      nextValue: NadaValue.createBlobSecret(strToByteArray("... then baz!")),
    },
    {
      name: ValueName.parse("IntegerSecret"),
      type: NadaValueType.enum.IntegerSecret,
      value: NadaValue.createIntegerSecret(-42),
      nextValue: NadaValue.createIntegerSecret(102),
    },
    {
      name: ValueName.parse("IntegerSecretUnsigned"),
      type: NadaValueType.enum.IntegerSecretUnsigned,
      value: NadaValue.createIntegerSecretUnsigned(1_000_000_000_000),
      nextValue: NadaValue.createIntegerSecretUnsigned(1),
    },
    {
      name: ValueName.parse("IntegerPublic"),
      type: NadaValueType.enum.IntegerPublic,
      value: NadaValue.createIntegerPublic(-107),
      nextValue: NadaValue.createIntegerSecret(1_000),
    },
    {
      name: ValueName.parse("IntegerPublicUnsigned"),
      type: NadaValueType.enum.IntegerPublicUnsigned,
      value: NadaValue.createIntegerPublicUnsigned(10_000_000_000),
      nextValue: NadaValue.createIntegerSecret(10_000_000_001),
    },
  ];

  // @ts-expect-error values collected during tests
  types.forEach((test: Test) => {
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

  describe("program > simple_shares", () => {
    const args: any = {
      id: ProgramId.parse(`${fixtureConfig.programs_namespace}/simple_shares`),
      store: "" as StoreId,
      dealer: PartyName.parse("Dealer"),
      result: PartyName.parse("Result"),
      // I00, I01 and I02 are passed as args
      I00: {
        name: ValueName.parse("I00"),
        value: NadaValue.createIntegerSecretUnsigned(17517),
      },
      I01: {
        name: ValueName.parse("I01"),
        value: NadaValue.createIntegerSecretUnsigned(5226),
      },
      I02: {
        name: ValueName.parse("I02"),
        value: NadaValue.createIntegerSecretUnsigned(15981),
      },
      // I03 and I04 are stored in the network
      I03: {
        name: ValueName.parse("I03"),
        value: NadaValue.createIntegerSecretUnsigned(2877),
      },
      I04: {
        name: ValueName.parse("I04"),
        value: NadaValue.createIntegerSecretUnsigned(2564),
      },
    };

    beforeAll(async () => {
      const { clientVm } = context;

      const { id, I03, I04 } = args;
      const values = NadaValues.create()
        .insert(I03.name, I03.value)
        .insert(I04.name, I04.value);

      const permissions = Permissions.create().allowCompute(
        clientVm.userId,
        id,
      );

      const { result: storeId } = await context.client.execute<StoreId>({
        operation: Operation.valuesStore({
          values,
          ttl: Days.parse(1),
          permissions,
        }),
      });

      args.store = storeId;
    });

    // The parties of the simple_shares program are: 'Dealer' and 'Result'
    it("compute program", async () => {
      const { clientVm } = context;
      const { I00, I01, I02, store } = args;
      const values = NadaValues.create()
        .insert(I00.name, I00.value)
        .insert(I01.name, I01.value)
        .insert(I02.name, I02.value);

      const bindings = ProgramBindings.create(args.id);
      bindings
        .addInputParty(args.dealer, clientVm.partyId)
        .addOutputParty(args.result, clientVm.partyId);

      const { result } = await context.client.execute({
        operation: Operation.compute({
          bindings,
          values,
          storeIds: [store],
        }),
      });

      const resultId = result as ComputeResultId;
      expect(resultId).toBeDefined();
      args.resultId = resultId;
    });

    it("get compute result", async () => {
      const { result } = await context.client.execute<{ Add0: bigint }>({
        operation: Operation.computeRetrieveResult({
          id: args.resultId,
        }),
      });
      expect(result.Add0).toEqual(1462969515630n);
    });
  });

  //
  //   it("retrieve compute result", async () => {
  //     const result = await context.client.execute({
  //       operation: Operation.computeResult(),
  //       computeResultId: context.test1.resultId,
  //     });
  //
  //     const final = result.result;
  //
  //     console.log("Compute result:", final);
  //     expect(final).toBeDefined();
  //     // expect(final).toEqual({
  //     //   Add0: BigInt(1462969515630),
  //     // });
  //   });
  //
  //   // it("should be able to return an array from a computation", async () => {
  //   //   const programId = `${context.fixtureConfig.programsNamespace}/array_new`;
  //   //   const bindings = new ProgramBindings(programId);
  //   //   bindings.add_input_party("Party1", context.test1.partyId);
  //   //   bindings.add_output_party("Party1", context.test1.partyId);
  //   //
  //   //   const values = new NadaValues();
  //   //   values.insert("I00", NadaValue.new_secret_integer("42"));
  //   //   values.insert("I01", NadaValue.new_secret_integer("43"));
  //   //
  //   //   const receipt = await getQuoteThenPay(
  //   //     context,
  //   //     Operation.compute(programId, values),
  //   //   );
  //   //   const resultId = await context.vm.client.compute(
  //   //     bindings,
  //   //     [],
  //   //     values,
  //   //     receipt,
  //   //   );
  //   //
  //   //   const result = await context.vm.client.getComputeResult(resultId);
  //   //
  //   //   expect(result).toBeDefined();
  //   //   expect(result).not.toBe("");
  //   //   expect(result).toEqual({
  //   //     my_output: [BigInt(42), BigInt(43)],
  //   //   });
  //   // });
  //   //
  //   // it("should be able to return a tuple from a computation", async () => {
  //   //   const programId = `${context.fixtureConfig.programsNamespace}/tuple_new`;
  //   //   const bindings = new ProgramBindings(programId);
  //   //   bindings.add_input_party("Party1", context.test1.partyId);
  //   //   bindings.add_output_party("Party1", context.test1.partyId);
  //   //
  //   //   const values = new NadaValues();
  //   //   values.insert("I00", NadaValue.new_secret_integer("42"));
  //   //   values.insert("I01", NadaValue.new_secret_integer("43"));
  //   //
  //   //   const receipt = await getQuoteThenPay(
  //   //     context,
  //   //     Operation.compute(programId, values),
  //   //   );
  //   //   const resultId = await context.vm.client.compute(
  //   //     bindings,
  //   //     [],
  //   //     values,
  //   //     receipt,
  //   //   );
  //   //
  //   //   const result = await context.vm.client.getComputeResult(resultId);
  //   //
  //   //   expect(result).toBeDefined();
  //   //   expect(result).not.toBe("");
  //   //   expect(result).toEqual({
  //   //     my_output: [BigInt(42), BigInt(43)],
  //   //   });
  //   // });
  //   //
  //   //
  //   // it("should be able to store a program", async () => {
  //   //   const program_fetch = await fetch("__src__/addition_division");
  //   //   if (!program_fetch.ok) {
  //   //     fail(`program fetch failed: ${program_fetch.statusText}`);
  //   //   }
  //   //   const program = await program_fetch.body
  //   //     ?.getReader()
  //   //     .read()
  //   //     .then((onfulfilled) => onfulfilled?.value);
  //   //
  //   //   expect(program).toBeDefined();
  //   //   const receipt = await pay(context, Operation.store_program(program));
  //   //   const program_id = await context.vm.client.store_program(
  //   //     context.config.cluster_id,
  //   //     "addition_division",
  //   //     program!,
  //   //     receipt,
  //   //   );
  //   //
  //   //   expect(program_id).toBeDefined();
  //   // });
  //   //
  //   // it("should be able to store the same program twice concurrently", async () => {
  //   //   const program_fetch = await fetch("__src__/addition_division");
  //   //   if (!program_fetch.ok) {
  //   //     fail(`program fetch failed: ${program_fetch.statusText}`);
  //   //   }
  //   //   const program = await program_fetch.body
  //   //     ?.getReader()
  //   //     .read()
  //   //     .then((onfulfilled) => onfulfilled?.value);
  //   //
  //   //   expect(program).toBeDefined();
  //   //   const receipt1 = await pay(context, Operation.store_program(program));
  //   //   const receipt2 = await pay(context, Operation.store_program(program));
  //   //   const promises = [
  //   //     context.vm.client.store_program(
  //   //       context.config.cluster_id,
  //   //       "foo1",
  //   //       program!,
  //   //       receipt1,
  //   //     ),
  //   //     context.vm.client.store_program(
  //   //       context.config.cluster_id,
  //   //       "foo2",
  //   //       program!,
  //   //       receipt2,
  //   //     ),
  //   //   ];
  //   //   await Promise.all(promises);
  //   // });
  //   //
  //   //
  //   // it("should be able to store and delete a secret", async () => {
  //   //   const values = new NadaValues();
  //   //   values.insert("I00", NadaValue.new_secret_unsigned_integer("17517"));
  //   //   values.insert("I01", NadaValue.new_secret_unsigned_integer("5226"));
  //   //   let receipt = await pay(context, Operation.store_values(values, 1));
  //   //   const store_id = await context.vm.client.store_values(
  //   //     context.config.cluster_id,
  //   //     values,
  //   //     undefined,
  //   //     receipt,
  //   //   );
  //   //   expect(store_id).toBeDefined();
  //   //   expect(store_id).not.toBe("");
  //   //   await context.vm.client.delete_values(context.config.cluster_id, store_id);
  //   //   receipt = await pay(context, Operation.retrieve_value());
  //   //   await expectAsync(
  //   //     context.vm.client.retrieve_value(
  //   //       context.config.cluster_id,
  //   //       store_id,
  //   //       "I00",
  //   //       receipt,
  //   //     ),
  //   //   ).toBeRejectedWithError();
  //   // });
  // });
});
