import { type Timestamp, timestampDate } from "@bufbuild/protobuf/wkt";
import { EcdsaSignature, PartyId as WasmPartyId } from "@nillion/client-wasm";
import { z } from "zod";
import type {
  PriceQuoteRequest,
  QuoteFees,
  SignedQuote,
} from "#/gen-proto/nillion/payments/v1/quote_pb";
import { UserId } from "#/types/user-id";

export const TimestampToDateSchema = z
  .custom<Timestamp>(
    (value: unknown) =>
      value !== null &&
      typeof value === "object" &&
      "seconds" in value &&
      "nanos" in value &&
      "$typeName" in value &&
      value.$typeName === "google.protobuf.Timestamp",
  )
  .transform((timestamp) => timestampDate(timestamp));

export const Quote = z.object({
  nonce: z.custom<Uint8Array>(),
  fees: z.custom<QuoteFees>(),
  expiresAt: TimestampToDateSchema,
  request: z.custom<PriceQuoteRequest>(),
  signed: z.custom<SignedQuote>((value: unknown) => {
    return (
      value !== null &&
      typeof value === "object" &&
      "quote" in value &&
      "signature" in value
    );
  }),
});

export type Quote = z.infer<typeof Quote>;

export class PartyId {
  constructor(public readonly inner: Uint8Array) {}

  toBase64(): string {
    return btoa(String.fromCharCode(...this.inner));
  }

  toWasm(): WasmPartyId {
    return new WasmPartyId(this.inner);
  }

  static from(id: Uint8Array): PartyId {
    return new PartyId(id);
  }
}

export const Uuid = z.string().uuid();
export type Uuid = z.infer<typeof Uuid>;

export const TtlDays = z.number().positive();
export type TtlDays = z.infer<typeof TtlDays>;

export const PartyName = z.string().min(1);
export type PartyName = z.infer<typeof PartyName>;

// userid-as-hex/{program-name}/sha256/{sha-of-program}
export const ProgramId = z.string().min(10);
export type ProgramId = z.infer<typeof ProgramId>;

export const ProgramName = z.string().regex(/[a-zA-Z0-9+.:_-]{1,128}/);
export type ProgramName = z.infer<typeof ProgramName>;

export const InputBindings = z.object({
  party: PartyName,
  user: z.instanceof(UserId),
});

export type InputBindings = z.infer<typeof InputBindings>;

export const OutputBindings = z.object({
  party: PartyName,
  users: z.array(z.instanceof(UserId)),
});
export type OutputBindings = z.infer<typeof OutputBindings>;

export const NadaValuesRecord = z.record(
  z.object({
    type: z.string(),
    value: z.union([
      z.string(),
      z.instanceof(Uint8Array),
      z.instanceof(EcdsaSignature),
    ]),
  }),
);
export type NadaValuesRecord = z.infer<typeof NadaValuesRecord>;

export const EncryptedNadaValueRecord = z.discriminatedUnion("type", [
  z.object({ type: z.literal("Integer"), value: z.instanceof(Uint8Array) }),
  z.object({
    type: z.literal("UnsignedInteger"),
    value: z.instanceof(Uint8Array),
  }),
  z.object({ type: z.literal("Boolean"), value: z.instanceof(Uint8Array) }),
  z.object({
    type: z.literal("SecretBlob"),
    shares: z.array(z.instanceof(Uint8Array)),
    originalSize: z.string(),
  }),
  z.object({
    type: z.literal("ShamirShareInteger"),
    value: z.instanceof(Uint8Array),
  }),
  z.object({
    type: z.literal("ShamirShareUnsignedInteger"),
    value: z.instanceof(Uint8Array),
  }),
  z.object({
    type: z.literal("ShamirShareBoolean"),
    value: z.instanceof(Uint8Array),
  }),
  z.object({
    type: z.literal("EcdsaDigestMessage"),
    digest: z.instanceof(Uint8Array),
  }),
  z.object({
    type: z.literal("EcdsaPrivateKey"),
    i: z.string(),
    x: z.instanceof(Uint8Array),
    sharedPublicKey: z.instanceof(Uint8Array),
    publicShares: z.array(z.instanceof(Uint8Array)),
  }),
  z.object({
    type: z.literal("EcdsaSignature"),
    r: z.instanceof(Uint8Array),
    sigma: z.instanceof(Uint8Array),
  }),
  z.object({
    type: z.literal("EcdsaPublicKey"),
    publicKey: z.instanceof(Uint8Array),
  }),
  z.object({
    type: z.literal("StoreId"),
    storeId: z.instanceof(Uint8Array),
  }),
]);
export type EncryptedNadaValueRecord = z.infer<typeof EncryptedNadaValueRecord>;
export const EncryptedNadaValuesRecord = z.record(
  z.string(),
  EncryptedNadaValueRecord,
);
export type EncryptedNadaValuesRecord = z.infer<
  typeof EncryptedNadaValuesRecord
>;
