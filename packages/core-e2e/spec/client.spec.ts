import { NadaValue, NadaValues, NillionClient, Operation } from "@nillion/core";
import { Context, loadFixtureContext, strToByteArray } from "../helpers";
import { pay } from "../helpers/chain";

describe("Nillion Client", () => {
  let context: Context;

  beforeAll(async () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 15000;

    context = await loadFixtureContext();

    expect(context.vm.client).toBeDefined();
    expect(context.vm.client).toBeInstanceOf(NillionClient);
    expect(context.chain.client).toBeDefined();
    expect(context.chain.client).toBeDefined();
  });

  it("should not crash if wasm.init() is called twice", async () => {
    await NillionClient.init();
    expect(true).toBeTruthy();
  });

  it("should have predictable party_id because of the hardcoded node key seed", () => {
    const my_party_id = context.vm.client.partyId;
    expect(my_party_id).toBeDefined();

    expect(my_party_id).toEqual(context.test1.expected_party_id);
    context.test1.party_id = my_party_id;
  });

  it("should be able to get a price quote", async () => {
    const values = new NadaValues();
    values.insert("foo", NadaValue.new_secret_integer("1337"));
    values.insert("bar", NadaValue.new_secret_integer("-42"));
    const operation = Operation.store_values(values, 1);
    const now = new Date();

    const quote = await context.vm.client.fetchQuote(operation);
    expect(parseInt(quote.cost.total)).toBeGreaterThan(0);
    expect(quote.expires_at.getTime()).toBeGreaterThan(now.getTime());
    expect(quote.nonce).toBeTruthy();
  }, 30000);

  it("should be able to store secrets", async () => {
    const bytes = strToByteArray(context.test1.input);
    const values = new NadaValues();
    values.insert("blob", NadaValue.new_secret_blob(bytes));
    values.insert("int", NadaValue.new_secret_integer("-42"));

    const operation = Operation.store_values(values, 1);
    const quote = await context.vm.client.fetchQuote(operation);
    const receipt = await pay(context, quote);
    const store_id = await context.vm.client.storeValues(receipt, values);

    expect(store_id).toBeDefined();
    expect(store_id).not.toBe("");
    context.test1.store_id = store_id;
    context.test1.original_blob = bytes;
    context.test1.original_integer = "-42";
  });
  //
  // it("should be able to retrieve a blob secret", async () => {
  //   const receipt = await pay(context, nillion.Operation.retrieve_value());
  //   const value = await context.vm.client.retrieve_value(
  //     context.config.cluster_id,
  //     context.test1.store_id,
  //     "blob",
  //     receipt,
  //   );
  //   expect(value.to_byte_array()).toEqual(context.test1.original_blob);
  // });
  //
  // it("should be able to retrieve an integer secret", async () => {
  //   const receipt = await pay(context, nillion.Operation.retrieve_value());
  //   const value = await context.vm.client.retrieve_value(
  //     context.config.cluster_id,
  //     context.test1.store_id,
  //     "int",
  //     receipt,
  //   );
  //   expect(value.to_integer()).toEqual(context.test1.original_integer);
  // });
  //
  // it("should be able to create a program binding", async () => {
  //   const result = new nillion.ProgramBindings(context.test1.program_id);
  //   context.test1.program_binding_simple = result;
  //   expect(result).toBeInstanceOf(nillion.ProgramBindings);
  // });
  //
  // // The parties of the simple program are
  // // - Dealer
  // // - Result
  // it("should be able to add_input_party to a program binding", async () => {
  //   context.test1.program_binding_simple.add_input_party(
  //     "Dealer",
  //     context.test1.party_id,
  //   );
  //   // avoids the test complaining that there is no assertion, the above should succeed but has no output
  //   expect(true).toBeTruthy();
  // });
  //
  // it("should be able to add_output_party to a program binding", async () => {
  //   context.test1.program_binding_simple.add_output_party(
  //     "Result",
  //     context.test1.party_id,
  //   );
  //   // avoids the test complaining that there is no assertion, the above should succeed but has no output
  //   expect(true).toBeTruthy();
  // });
  //
  // it("should be able to prep compute inline secrets", async () => {
  //   const compute_values = new nillion.NadaValues();
  //   compute_values.insert(
  //     "I00",
  //     nillion.NadaValue.new_secret_non_zero_unsigned_integer("17517"),
  //   );
  //   compute_values.insert(
  //     "I01",
  //     nillion.NadaValue.new_secret_non_zero_unsigned_integer("5226"),
  //   );
  //   compute_values.insert(
  //     "I02",
  //     nillion.NadaValue.new_secret_non_zero_unsigned_integer("15981"),
  //   );
  //   context.test1.compute_values = compute_values;
  //
  //   expect(context.test1.compute_values.length).toBe(3);
  // });
  //
  // it("should be able to store secrets for compute", async () => {
  //   const values = new nillion.NadaValues();
  //   values.insert(
  //     "I03",
  //     nillion.NadaValue.new_secret_non_zero_unsigned_integer("2877"),
  //   );
  //   values.insert(
  //     "I04",
  //     nillion.NadaValue.new_secret_non_zero_unsigned_integer("2564"),
  //   );
  //   const permissions = new nillion.Permissions();
  //   permissions.add_compute_permissions({
  //     [context.vm.client.user_id]: [context.test1.program_id],
  //   });
  //   const receipt = await pay(
  //     context,
  //     nillion.Operation.store_values(values, 1),
  //   );
  //   const store_uuid = await context.vm.client.store_values(
  //     context.config.cluster_id,
  //     values,
  //     permissions,
  //     receipt,
  //   );
  //   expect(store_uuid).toBeDefined();
  //   context.test1.compute_store_values_id = store_uuid;
  // });
  //
  // it("should be able to compute program", async () => {
  //   const bindings = new nillion.ProgramBindings(context.test1.program_id);
  //   bindings.add_input_party("Dealer", context.test1.party_id);
  //   bindings.add_output_party("Result", context.test1.party_id);
  //
  //   const receipt = await pay(
  //     context,
  //     nillion.Operation.compute(
  //       context.test1.program_id,
  //       context.test1.compute_values,
  //     ),
  //   );
  //   const compute_result_uuid = await context.vm.client.compute(
  //     context.config.cluster_id,
  //     bindings,
  //     [context.test1.compute_store_values_id],
  //     context.test1.compute_values,
  //     receipt,
  //   );
  //
  //   expect(compute_result_uuid).toBeDefined();
  //   expect(compute_result_uuid).not.toBe("");
  //   context.test1.compute_id = compute_result_uuid;
  // });
  //
  // it("should be able to get a result from compute operation", async () => {
  //   const compute_result = await context.vm.client.compute_result(
  //     context.test1.compute_id,
  //   );
  //   expect(compute_result).toBeDefined();
  //   expect(compute_result).not.toBe("");
  //   expect(compute_result).toEqual({
  //     Add0: BigInt(1462969515630),
  //   });
  // });
  //
  // it("should be able to return an array from a computation", async () => {
  //   const program_id = `${context.config.programs_namespace}/array_new`;
  //   const bindings = new nillion.ProgramBindings(program_id);
  //   bindings.add_input_party("Party1", context.test1.party_id);
  //   bindings.add_output_party("Party1", context.test1.party_id);
  //
  //   const values = new nillion.NadaValues();
  //   values.insert("I00", nillion.NadaValue.new_secret_integer("42"));
  //   values.insert("I01", nillion.NadaValue.new_secret_integer("43"));
  //
  //   const receipt = await pay(
  //     context,
  //     nillion.Operation.compute(program_id, values),
  //   );
  //   const compute_result_uuid = await context.vm.client.compute(
  //     context.config.cluster_id,
  //     bindings,
  //     [],
  //     values,
  //     receipt,
  //   );
  //
  //   const compute_result =
  //     await context.vm.client.compute_result(compute_result_uuid);
  //
  //   expect(compute_result).toBeDefined();
  //   expect(compute_result).not.toBe("");
  //   expect(compute_result).toEqual({
  //     my_output: [BigInt(42), BigInt(43)],
  //   });
  // });
  //
  // it("should be able to return a tuple from a computation", async () => {
  //   const program_id = `${context.config.programs_namespace}/tuple_new`;
  //   const bindings = new nillion.ProgramBindings(program_id);
  //   bindings.add_input_party("Party1", context.test1.party_id);
  //   bindings.add_output_party("Party1", context.test1.party_id);
  //
  //   const values = new nillion.NadaValues();
  //   values.insert("I00", nillion.NadaValue.new_secret_integer("42"));
  //   values.insert("I01", nillion.NadaValue.new_secret_integer("43"));
  //
  //   const receipt = await pay(
  //     context,
  //     nillion.Operation.compute(program_id, values),
  //   );
  //   const compute_result_uuid = await context.vm.client.compute(
  //     context.config.cluster_id,
  //     bindings,
  //     [],
  //     values,
  //     receipt,
  //   );
  //
  //   const compute_result =
  //     await context.vm.client.compute_result(compute_result_uuid);
  //
  //   expect(compute_result).toBeDefined();
  //   expect(compute_result).not.toBe("");
  //   expect(compute_result).toEqual({
  //     my_output: [BigInt(42), BigInt(43)],
  //   });
  // });
  //
  // it("should be able to update a secret", async () => {
  //   const values = new nillion.NadaValues();
  //   values.insert("another-int", nillion.NadaValue.new_secret_integer("1024"));
  //   let receipt = await pay(
  //     context,
  //     nillion.Operation.update_values(values, 1),
  //   );
  //   await context.vm.client.update_values(
  //     context.config.cluster_id,
  //     context.test1.store_id,
  //     values,
  //     receipt,
  //   );
  //
  //   receipt = await pay(context, nillion.Operation.retrieve_value());
  //   const secret = await context.vm.client.retrieve_value(
  //     context.config.cluster_id,
  //     context.test1.store_id,
  //     "another-int",
  //     receipt,
  //   );
  //   expect(secret.to_integer()).toEqual("1024");
  // });
  //
  // it("should be able to store a program", async () => {
  //   const program_fetch = await fetch("__src__/addition_division");
  //   if (!program_fetch.ok) {
  //     fail(`program fetch failed: ${program_fetch.statusText}`);
  //   }
  //   const program = await program_fetch.body
  //     ?.getReader()
  //     .read()
  //     .then((onfulfilled) => onfulfilled?.value);
  //
  //   expect(program).toBeDefined();
  //   const receipt = await pay(
  //     context,
  //     nillion.Operation.store_program(program),
  //   );
  //   const program_id = await context.vm.client.store_program(
  //     context.config.cluster_id,
  //     "addition_division",
  //     program!,
  //     receipt,
  //   );
  //
  //   expect(program_id).toBeDefined();
  // });
  //
  // it("should be able to store the same program twice concurrently", async () => {
  //   const program_fetch = await fetch("__src__/addition_division");
  //   if (!program_fetch.ok) {
  //     fail(`program fetch failed: ${program_fetch.statusText}`);
  //   }
  //   const program = await program_fetch.body
  //     ?.getReader()
  //     .read()
  //     .then((onfulfilled) => onfulfilled?.value);
  //
  //   expect(program).toBeDefined();
  //   const receipt1 = await pay(
  //     context,
  //     nillion.Operation.store_program(program),
  //   );
  //   const receipt2 = await pay(
  //     context,
  //     nillion.Operation.store_program(program),
  //   );
  //   const promises = [
  //     context.vm.client.store_program(
  //       context.config.cluster_id,
  //       "foo1",
  //       program!,
  //       receipt1,
  //     ),
  //     context.vm.client.store_program(
  //       context.config.cluster_id,
  //       "foo2",
  //       program!,
  //       receipt2,
  //     ),
  //   ];
  //   await Promise.all(promises);
  // });
  //
  // it("should be able to retrieve_permissions", async () => {
  //   const receipt = await pay(
  //     context,
  //     nillion.Operation.retrieve_permissions(),
  //   );
  //   const result = await context.vm.client.retrieve_permissions(
  //     context.config.cluster_id,
  //     context.test1.store_id,
  //     receipt,
  //   );
  //   expect(result).toBeDefined();
  //   expect(result).toBeInstanceOf(nillion.Permissions);
  // });
  //
  // it("should be able to store and delete a secret", async () => {
  //   const values = new nillion.NadaValues();
  //   values.insert(
  //     "I00",
  //     nillion.NadaValue.new_secret_unsigned_integer("17517"),
  //   );
  //   values.insert("I01", nillion.NadaValue.new_secret_unsigned_integer("5226"));
  //   let receipt = await pay(context, nillion.Operation.store_values(values, 1));
  //   const store_id = await context.vm.client.store_values(
  //     context.config.cluster_id,
  //     values,
  //     undefined,
  //     receipt,
  //   );
  //   expect(store_id).toBeDefined();
  //   expect(store_id).not.toBe("");
  //   await context.vm.client.delete_values(context.config.cluster_id, store_id);
  //   receipt = await pay(context, nillion.Operation.retrieve_value());
  //   await expectAsync(
  //     context.vm.client.retrieve_value(
  //       context.config.cluster_id,
  //       store_id,
  //       "I00",
  //       receipt,
  //     ),
  //   ).toBeRejectedWithError();
  // });
});
