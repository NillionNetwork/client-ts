// /**
//  * Types specific functional tests.
//  */
// import {
//   NillionClient,
//   NadaValue,
//   NadaValues,
//   ProgramBindings,
// } from "@nillion/core";
// import { strToByteArray } from "../helpers";
//
// describe("Nillion client types", () => {
//   beforeAll(async () => {
//     await NillionClient.init();
//   });
//
//   it("should be able to encode a blob secret", async () => {
//     const encodedBytes = strToByteArray("hi mom");
//     const secret = NadaValue.new_secret_blob(encodedBytes);
//     expect(secret).toBeInstanceOf(NadaValue);
//     expect(secret.to_byte_array()).toEqual(encodedBytes);
//   });
//
//   it("should be able to encode/decode an signed integer secret", async () => {
//     const secret = NadaValue.new_secret_integer("-42");
//     expect(secret).toBeInstanceOf(NadaValue);
//     expect(secret.to_integer()).toEqual("-42");
//   });
//
//   it("should be able to encode/decode an unsigned integer secret", async () => {
//     const secret = NadaValue.new_secret_unsigned_integer("42");
//     expect(secret).toBeInstanceOf(NadaValue);
//     expect(secret.to_integer()).toEqual("42");
//   });
//
//   it("should be able to build an empty set of secrets", async () => {
//     const secrets = new NadaValues();
//     expect(secrets.length).toEqual(0);
//   });
//
//   it("should be able to build a set of secrets", async () => {
//     const secrets = new NadaValues();
//     secrets.insert("one", NadaValue.new_secret_integer("1337"));
//     secrets.insert("two", NadaValue.new_secret_integer("1337"));
//     expect(secrets.length).toEqual(2);
//   });
//
//   it("should be able to use the same secret twice", async () => {
//     const secrets = new NadaValues();
//     const secret = NadaValue.new_secret_integer("1337");
//     secrets.insert("one", secret);
//     secrets.insert("two", secret);
//     expect(secrets.length).toEqual(2);
//   });
//
//   it("should be able to re-assign used secret variables", async () => {
//     const secrets = new NadaValues();
//     let secret = NadaValue.new_secret_integer("1337");
//     secrets.insert("one", secret);
//
//     secret = NadaValue.new_secret_integer("42");
//     expect(secret.to_integer()).toEqual("42");
//   });
//
//   it("should be able to create a program binding", async () => {
//     const result = new ProgramBindings("simple");
//     expect(result).toBeInstanceOf(ProgramBindings);
//   });
//
//   it("should be able to build a set of public variables", async () => {
//     const public_variables = new NadaValues();
//     public_variables.insert("pub_var", NadaValue.new_public_integer("1337"));
//     expect(public_variables.length).toEqual(1);
//   });
//
//   it("should be able to use the same public variable twice", async () => {
//     const public_variables = new NadaValues();
//     const variable = NadaValue.new_public_integer("1337");
//     public_variables.insert("one", variable);
//     public_variables.insert("two", variable);
//     expect(public_variables.length).toEqual(2);
//   });
//
//   it("should be able to re-assign used public variables", async () => {
//     const public_variables = new NadaValues();
//     let variable = NadaValue.new_public_integer("1337");
//     public_variables.insert("one", variable);
//
//     variable = NadaValue.new_public_integer("42");
//     expect(variable.to_integer()).toEqual("42");
//   });
// });
