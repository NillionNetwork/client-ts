import { z } from "zod";

//
// Common types
//

export const Url = z.string().url().brand<"Url">();
export type Url = z.infer<typeof Url>;

export const Days = z.number().int().min(1).brand<"Days">();
export type Days = z.infer<typeof Days>;

//
// Network related types
//

export const NetworkName = z.enum(["Gluon", "Devnet"]);
export type NetworkName = z.infer<typeof NetworkName>;

export const PartyId = z.string().length(52);
export type PartyId = z.infer<typeof PartyId>;

export const PartyName = z.string().length(1);
export type PartyName = z.infer<typeof PartyName>;

export const ClusterId = z.string().uuid().brand<"ClusterId">();
export type ClusterId = z.infer<typeof ClusterId>;

// source: libp2p-wasm-ext websocket.js
const multiaddrRegex =
  /^\/(ip4|ip6|dns4|dns6|dns)\/(.*?)\/tcp\/(.*?)\/(ws|wss|x-parity-ws\/(.*)|x-parity-wss\/(.*))(|\/p2p\/[a-zA-Z0-9]+)$/;
export const Multiaddr = z.string().regex(multiaddrRegex).brand<"Multiaddr">();
export type Multiaddr = z.infer<typeof Multiaddr>;

//
// NilVm related types
//

export const StoreId = z.string().uuid().brand<"StoreId">();
export type StoreId = z.infer<typeof StoreId>;

// "namespace/friendly-name"
export const ProgramId = z
  .string()
  .min(1)
  // .refine((v) => v.length > 88 && v.indexOf("/") === 88)
  .brand<"ProgramId">();
export type ProgramId = z.infer<typeof ProgramId>;

export const ComputeResultId = z.string().uuid().brand<"ComputeResultId">();
export type ComputeResultId = z.infer<typeof ComputeResultId>;

//
// Payment related types
//
export const Token = {
  Unil: "unil",
  asUnil: (amount: number | string) => `${amount}${Token.Unil}`,
};

export const NilChainProtobufTypeUrl = "/nillion.meta.v1.MsgPayFor";

export const ChainId = z.string().min(1).brand<"ChainId">();
export type ChainId = z.infer<typeof ChainId>;

export const NilChainAddressPrefix = "nillion";
export const NilChainAddress = z
  .string()
  .length(46)
  .startsWith(NilChainAddressPrefix)
  .brand<"Address">();
export type NilChainAddress = z.infer<typeof NilChainAddress>;

export const PrivateKeyBase16 = z
  .string()
  .length(64)
  .brand<"PrivateKeyBase16">();
export type PrivateKeyBase16 = z.infer<typeof PrivateKeyBase16>;

export const TxHash = z.string().length(64).base64().brand<"TxHash">();
export type TxHash = z.infer<typeof TxHash>;

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
  // handle for the raw wasm quote object
  inner: z.unknown(),
});

export type PriceQuote = z.infer<typeof PriceQuote>;

export const PaymentReceipt = z.object({
  quote: PriceQuote,
  hash: TxHash,
});

export type PaymentReceipt = z.infer<typeof PaymentReceipt>;
