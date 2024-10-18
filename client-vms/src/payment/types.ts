import { z } from "zod";

export const TxHash = z.string().length(64).base64().brand<"TxHash">();
export type TxHash = z.infer<typeof TxHash>;

export const NilChainAddressPrefix = "nillion";
export const NilChainAddress = z
  .string()
  .length(46)
  .startsWith(NilChainAddressPrefix)
  .brand<"Address">();
export type NilChainAddress = z.infer<typeof NilChainAddress>;

export const NilToken = {
  Unil: "unil",
  asUnil: (amount: number | string) => `${String(amount)}${NilToken.Unil}`,
};

export const NilChainProtobufTypeUrl = "/nillion.meta.v1.MsgPayFor";

export const PrivateKeyBase16 = z
  .string()
  .length(64)
  .brand<"PrivateKeyBase16">();
export type PrivateKeyBase16 = z.infer<typeof PrivateKeyBase16>;
