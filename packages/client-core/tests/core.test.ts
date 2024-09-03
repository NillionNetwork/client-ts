import {
  init,
  NadaPrimitiveValue,
  NadaValue,
  NadaValues,
  NadaValueType,
  NamedValue,
  ProgramBindings,
  PublicInteger,
  PublicIntegerUnsigned,
  SecretBlob,
  SecretBoolean,
  SecretInteger,
  SecretIntegerUnsigned,
  SecretString,
} from "@nillion/client-core";
import * as Wasm from "@nillion/client-wasm";

const SUITE_NAME = `@nillion/client-core > initialization`;

describe(SUITE_NAME, () => {
  beforeAll(() => {
    console.log(`*** Start ${SUITE_NAME} ***`);
  });

  afterAll(() => {
    console.log(`*** Finish ${SUITE_NAME} *** \n\n`);
  });

  describe("init", () => {
    it("handles multiple init() calls", async () => {
      await init();
      await init();
      expect(true).toBeTruthy();
    });

    it("window.__NILLION should be defined", () => {
      const nillion = globalThis.__NILLION!;
      expect(nillion).toBeDefined();
      expect(nillion.initialized).toBeTruthy();
      expect(nillion.enableTelemetry).toBeDefined();
      expect(nillion.enableLogging).toBeDefined();
      expect(nillion.enableWasmLogging).toBeDefined();
    });
  });

  describe("primitive type guards", () => {
    it("SecretString rejects non strings", () => {
      expect(() => SecretString.parse(1)).toThrow();
    });

    it("SecretBlob rejects array-like invalid input", () => {
      expect(() => SecretBlob.parse([1, 2, 3])).toThrow();
    });

    it("SecretBlob rejects string invalid input", () => {
      expect(() => SecretBlob.parse("")).toThrow();
    });

    it("SecretBoolean rejects non boolean", () => {
      expect(() => SecretBoolean.parse("")).toThrow();
      expect(() => SecretBoolean.parse(1)).toThrow();
      expect(() => SecretBoolean.parse([])).toThrow();
    });

    it("PublicInteger rejects decimals", () => {
      expect(() => PublicInteger.parse(1.1)).toThrow();
      expect(() => PublicInteger.parse(-1.1)).toThrow();
    });

    it("PublicIntegerUnsigned rejects negative integer", () => {
      expect(() => PublicIntegerUnsigned.parse(-11)).toThrow();
      expect(() => PublicIntegerUnsigned.parse(-1)).toThrow();
    });

    it("SecretInteger rejects decimals", () => {
      expect(() => SecretInteger.parse(4.2)).toThrow();
      expect(() => SecretInteger.parse(-0.1)).toThrow();
    });

    it("SecretIntegerUnsigned rejects < 0", () => {
      expect(() => SecretIntegerUnsigned.parse(-11)).toThrow();
      expect(() => SecretIntegerUnsigned.parse(-1)).toThrow();
    });
  });

  describe("nada value encode and decode", () => {
    it("SecretBlob", () => {
      const expected = new TextEncoder().encode("hi mom");
      const secret = NadaValue.createSecretBlob(expected);

      const asWasm = secret.toWasm();
      expect(asWasm).toBeInstanceOf(Wasm.NadaValue);
      expect(asWasm.to_byte_array()).toEqual(secret.data as Uint8Array);

      const asTs = NadaValue.fromWasm(NadaValueType.enum.SecretBlob, asWasm);
      expect(asTs.data).toEqual(secret.data);
    });

    it("SecretString", () => {
      const expected = "hi mom";
      const secret = NadaValue.createSecretString(expected);

      const asWasm = secret.toWasm();
      expect(asWasm).toBeInstanceOf(Wasm.NadaValue);
      expect(asWasm.to_byte_array()).toEqual(
        new TextEncoder().encode(secret.data as string),
      );

      const asTs = NadaValue.fromWasm(NadaValueType.enum.SecretString, asWasm);
      expect(asTs.data).toEqual(secret.data);
    });

    function encodeAndDecodeIntegerLike<T extends NadaPrimitiveValue>(
      data: T,
      type: NadaValueType,
      build: (value: T) => NadaValue,
    ) {
      const value = build(data);
      const asWasm = value.toWasm();

      expect(asWasm).toBeInstanceOf(Wasm.NadaValue);
      expect(asWasm.to_integer()).toBe(String(value.data));

      const asTs = NadaValue.fromWasm(type, asWasm);
      expect(asTs.data).toEqual(value.data);
    }

    it("SecretInteger", () => {
      encodeAndDecodeIntegerLike(
        SecretInteger.parse(-42),
        NadaValueType.enum.SecretInteger,
        (v) => NadaValue.createSecretInteger(v),
      );
    });

    it("SecretIntegerUnsigned", () => {
      encodeAndDecodeIntegerLike(
        SecretIntegerUnsigned.parse(42n),
        NadaValueType.enum.SecretIntegerUnsigned,
        (v) => NadaValue.createSecretIntegerUnsigned(v),
      );
    });

    it("PublicInteger", () => {
      encodeAndDecodeIntegerLike(
        PublicInteger.parse(-100),
        NadaValueType.enum.PublicInteger,
        (v) => NadaValue.createPublicInteger(v),
      );
    });

    it("PublicIntegerUnsigned", () => {
      encodeAndDecodeIntegerLike(
        PublicIntegerUnsigned.parse(42n),
        NadaValueType.enum.PublicIntegerUnsigned,
        (v) => NadaValue.createPublicIntegerUnsigned(v),
      );
    });
  });

  describe("nada values set", () => {
    it("empty set", () => {
      const secrets = NadaValues.create();

      const asWasm = secrets.into();
      expect(secrets.length).toHaveSize(0);
      expect(asWasm).toBeInstanceOf(Wasm.NadaValues);
      expect(asWasm.length).toHaveSize(0);
    });

    it("build a set of secrets", () => {
      const secrets = NadaValues.create();
      secrets.insert(
        NamedValue.parse("one"),
        NadaValue.createSecretInteger(1337),
      );
      secrets.insert(
        NamedValue.parse("two"),
        NadaValue.createSecretInteger(1337),
      );

      const asWasm = secrets.into();
      expect(secrets).toHaveSize(2);
      expect(asWasm).toBeInstanceOf(Wasm.NadaValues);
      expect(asWasm).toHaveSize(2);
    });
  });
  describe("program bindings", () => {
    it("create a program binding", () => {
      const program = ProgramBindings.create("aaaa/simple");
      const asWasm = program.into();
      expect(asWasm).toBeInstanceOf(Wasm.ProgramBindings);
    });
  });
});
