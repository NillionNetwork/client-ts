import {
  BlobSecret,
  BooleanSecret,
  init,
  IntegerPublic,
  IntegerPublicUnsigned,
  IntegerSecret,
  IntegerSecretUnsigned,
  NadaValue,
  NadaValues,
  NadaWrappedValue,
  ProgramBindings,
  ValueName,
} from "@nillion/core";
import { strToByteArray } from "../helpers";
import * as Wasm from "@nillion/client-wasm";

const SUITE_NAME = "@nillion/core > nada types";

describe(SUITE_NAME, () => {
  beforeAll(async () => {
    console.log(`>>> Start ${SUITE_NAME}`);
    await init();
  });

  afterAll(() => {
    console.log(`<<< Finish ${SUITE_NAME}\n\n`);
  });

  describe("primitive type guards", () => {
    it("BlobSecret rejects array-like invalid input ", () => {
      expect(() => BlobSecret.parse([1, 2, 3])).toThrow();
    });

    it("BlobSecret rejects string invalid input", () => {
      expect(() => BlobSecret.parse("")).toThrow();
    });

    it("BooleanSecret rejects non boolean", () => {
      expect(() => BooleanSecret.parse("")).toThrow();
      expect(() => BooleanSecret.parse(1)).toThrow();
      expect(() => BooleanSecret.parse([])).toThrow();
    });

    it("IntegerPublic rejects decimals", () => {
      expect(() => IntegerPublic.parse(1.1)).toThrow();
      expect(() => IntegerPublic.parse(-1.1)).toThrow();
    });

    it("IntegerPublicUnsigned rejects negative integer", () => {
      expect(() => IntegerPublicUnsigned.parse(-11)).toThrow();
      expect(() => IntegerPublicUnsigned.parse(-1)).toThrow();
    });

    it("IntegerSecret rejects decimals", () => {
      expect(() => IntegerSecret.parse(4.2)).toThrow();
      expect(() => IntegerSecret.parse(-0.1)).toThrow();
    });

    it("IntegerSecretUnsigned rejects < 0", () => {
      expect(() => IntegerSecretUnsigned.parse(-11)).toThrow();
      expect(() => IntegerSecretUnsigned.parse(-1)).toThrow();
    });
  });

  describe("nada value encode and decode", () => {
    it("BlobSecret", () => {
      const expected = strToByteArray("hi mom");
      const secret = NadaValue.createBlobSecret(expected);

      expect(secret.data).toEqual(expected);

      const asWasm = secret.toWasm();
      expect(asWasm).toBeInstanceOf(Wasm.NadaValue);
      expect(asWasm.to_byte_array()).toEqual(secret.data);
    });

    it("BooleanSecret", () => {
      pending("require's boolean support in wasm bundle");

      // const expected = BooleanSecret.parse(true);
      // const secret = NadaValue.createBooleanSecret(expected);
      //
      // expect(secret.data).toEqual(expected);

      // const asWasm = secret.toWasm();
      // expect(asWasm).toBeInstanceOf(Wasm.NadaValue);
      // expect(asWasm.to_boolean()).toEqual(secret.data);
    });

    function encodeAndDecodeIntegerLike<T extends NadaWrappedValue>(
      expected: T,
      build: (value: T) => NadaValue,
    ) {
      const value = build(expected);
      const asWasm = value.toWasm();

      expect(value.data).toEqual(expected);
      expect(asWasm).toBeInstanceOf(Wasm.NadaValue);
      expect(asWasm.to_integer()).toBe(String(value.data));
    }

    it("IntegerSecret", () => {
      encodeAndDecodeIntegerLike(
        IntegerSecret.parse(-42),
        NadaValue.createIntegerSecret,
      );
    });

    it("IntegerSecretUnsigned", () => {
      encodeAndDecodeIntegerLike(
        IntegerSecretUnsigned.parse(42),
        NadaValue.createIntegerSecretUnsigned,
      );
    });

    it("IntegerPublic", () => {
      encodeAndDecodeIntegerLike(
        IntegerPublic.parse(-100),
        NadaValue.createIntegerPublic,
      );
    });

    it("IntegerPublicUnsigned", () => {
      encodeAndDecodeIntegerLike(
        IntegerPublicUnsigned.parse(42),
        NadaValue.createIntegerPublicUnsigned,
      );
    });
  });

  describe("nada values set", () => {
    it("empty set", async () => {
      const secrets = NadaValues.create();

      const asWasm = secrets.into();
      expect(secrets.length).toHaveSize(0);
      expect(asWasm).toBeInstanceOf(Wasm.NadaValues);
      expect(asWasm.length).toHaveSize(0);
    });

    it("build a set of secrets", async () => {
      const secrets = NadaValues.create();
      secrets.insert(
        ValueName.parse("one"),
        NadaValue.createIntegerSecret(1337),
      );
      secrets.insert(
        ValueName.parse("two"),
        NadaValue.createIntegerSecret(1337),
      );

      const asWasm = secrets.into();
      expect(secrets).toHaveSize(2);
      expect(asWasm).toBeInstanceOf(Wasm.NadaValues);
      expect(asWasm).toHaveSize(2);
    });
  });
  describe("program bindings", () => {
    it("create a program binding", async () => {
      const program = ProgramBindings.create("aaaa/simple");
      const asWasm = program.into();
      expect(asWasm).toBeInstanceOf(Wasm.ProgramBindings);
    });
  });
});
