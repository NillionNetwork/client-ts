import { Timestamp, timestampDate } from "@bufbuild/protobuf/wkt";
import { z } from "zod";

import type {
  PriceQuoteRequest,
  QuoteFees,
  SignedQuote,
} from "@nillion/client-vms/gen-proto/nillion/payments/v1/quote_pb";
import { UserId } from "@nillion/client-vms/types/user-id";
import { PartyId as WasmPartyId } from "@nillion/client-wasm";

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

// userid-as-hex/provided-program-name/sha256/sha-of-program
export const ProgramId = z.string().min(100);
export type ProgramId = z.infer<typeof ProgramId>;

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
    value: z.string(),
  }),
);
export type NadaValuesRecord = z.infer<typeof NadaValuesRecord>;
