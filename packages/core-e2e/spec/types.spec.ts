// /**
//  * Types specific functional tests.
//  */
// import * as nillion from "@nillion/client-web";
// import { strToByteArray } from "../helpers";
//
// describe("Nillion client types", () => {
//   let context = {};
//
//   beforeAll(async () => {
//     await nillion.default();
//   });
//
//   it("should be able to encode a blob secret", async () => {
//     const encodedBytes = strToByteArray("hi mom");
//     const secret = nillion.NadaValue.new_secret_blob(encodedBytes);
//     expect(secret).toBeInstanceOf(nillion.NadaValue);
//     expect(secret.to_byte_array()).toEqual(encodedBytes);
//   });
//
//   it("should be able to encode/decode an signed integer secret", async () => {
//     const secret = nillion.NadaValue.new_secret_integer("-42");
//     expect(secret).toBeInstanceOf(nillion.NadaValue);
//     expect(secret.to_integer()).toEqual("-42");
//   });
//
//   it("should be able to encode/decode an unsigned integer secret", async () => {
//     const secret = nillion.NadaValue.new_secret_unsigned_integer("42");
//     expect(secret).toBeInstanceOf(nillion.NadaValue);
//     expect(secret.to_integer()).toEqual("42");
//   });
//
//   it("should be able to build an empty set of secrets", async () => {
//     const secrets = new nillion.NadaValues();
//     expect(secrets.length).toEqual(0);
//   });
//
//   it("should be able to build a set of secrets", async () => {
//     const secrets = new nillion.NadaValues();
//     secrets.insert("one", nillion.NadaValue.new_secret_integer("1337"));
//     secrets.insert("two", nillion.NadaValue.new_secret_integer("1337"));
//     expect(secrets.length).toEqual(2);
//   });
//
//   it("should be able to use the same secret twice", async () => {
//     const secrets = new nillion.NadaValues();
//     const secret = nillion.NadaValue.new_secret_integer("1337");
//     secrets.insert("one", secret);
//     secrets.insert("two", secret);
//     expect(secrets.length).toEqual(2);
//   });
//
//   it("should be able to re-assign used secret variables", async () => {
//     const secrets = new nillion.NadaValues();
//     let secret = nillion.NadaValue.new_secret_integer("1337");
//     secrets.insert("one", secret);
//
//     secret = nillion.NadaValue.new_secret_integer("42");
//     expect(secret.to_integer()).toEqual("42");
//   });
//
//   it("should be able to create a program binding", async () => {
//     const result = new nillion.ProgramBindings("simple");
//     expect(result).toBeInstanceOf(nillion.ProgramBindings);
//   });
//
//   it("should be able to build a set of public variables", async () => {
//     const public_variables = new nillion.NadaValues();
//     public_variables.insert("pub_var", nillion.NadaValue.new_public_integer("1337"));
//     expect(public_variables.length).toEqual(1);
//   })
//
//   it("should be able to use the same public variable twice", async () => {
//     const public_variables = new nillion.NadaValues();
//     const variable = nillion.NadaValue.new_public_integer("1337");
//     public_variables.insert("one", variable);
//     public_variables.insert("two", variable);
//     expect(public_variables.length).toEqual(2);
//   });
//
//   it("should be able to re-assign used public variables", async () => {
//     const public_variables = new nillion.NadaValues();
//     let variable = nillion.NadaValue.new_public_integer("1337");
//     public_variables.insert("one", variable);
//
//     variable = nillion.NadaValue.new_public_integer("42");
//     expect(variable.to_integer()).toEqual("42");
//   });
// });
