import { z } from "zod";
import { ChainId, NamedNetwork, Url } from "@nillion/core";
import { OfflineSigner } from "@cosmjs/proto-signing";

export const PaymentClientConfig = z.object({
  network: NamedNetwork,
  chain: ChainId,
  endpoint: Url,
  signer: z.custom<OfflineSigner>().optional(),
});

export type PaymentClientConfig = z.infer<typeof PaymentClientConfig>;

export const NilChainProtobufTypeUrl = "/nillion.meta.v1.MsgPayFor";
