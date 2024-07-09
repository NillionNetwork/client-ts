import { z } from "zod";

//
// Common types
//

export const Url = z.string().url().brand<"Url">();
export type Url = z.infer<typeof Url>;

//
// Network related types
//

export const NetworkName = z.enum(["Gluon", "Devnet"]);
export type NetworkName = z.infer<typeof NetworkName>;

export const PartyId = z.string().min(1);
export type PartyId = z.infer<typeof PartyId>;

//
// Payment related types
//

export const Token = {
  Unil: "unil",
  asUnil: (amount: number | string) => `${amount}${Token.Unil}`,
};

export const PrivateKeyBase16 = z
  .string()
  .length(64)
  .brand<"PrivateKeyBase16">();
export type PrivateKeyBase16 = z.infer<typeof PrivateKeyBase16>;

export const TxHash = z.string().length(64).base64();

export const OperationCost = z.object({
  base: z.preprocess(Number, z.number()),
  compute: z.preprocess(Number, z.number()),
  congestion: z.preprocess(Number, z.number()),
  preprocessing: z.preprocess(Number, z.number()),
  total: z.preprocess(Number, z.number()),
});

export type OperationCost = z.infer<typeof OperationCost>;

export const PriceQuote = z.object({
  expires: z.date(),
  nonce: z.instanceof(Uint8Array),
  cost: OperationCost,
});

export type PriceQuote = z.infer<typeof PriceQuote>;

export const PaymentReceipt = z.object({
  quote: PriceQuote,
  txHash: TxHash,
});
