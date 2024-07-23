import { z } from "zod";
import { ChainId, Url } from "@nillion/core";
import { OfflineSigner } from "@cosmjs/proto-signing";

export const PaymentClientConfig = z.object({
  chain: ChainId,
  endpoint: Url,
  signer: z.custom<OfflineSigner>(),
});

export type PaymentClientConfig = z.infer<typeof PaymentClientConfig>;

export const NilChainProtobufTypeUrl = "/nillion.meta.v1.MsgPayFor";
