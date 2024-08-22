import { OfflineSigner } from "@cosmjs/proto-signing";
import { ChainId, Url } from "@nillion/client-core";
import { z } from "zod";

export const PaymentClientConfig = z.object({
  chain: ChainId,
  endpoint: Url,
  signer: z.custom<OfflineSigner>().optional(),
});

export type PaymentClientConfig = z.infer<typeof PaymentClientConfig>;

export const NilChainProtobufTypeUrl = "/nillion.meta.v1.MsgPayFor";
