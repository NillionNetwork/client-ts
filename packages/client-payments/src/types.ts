import { OfflineSigner } from "@cosmjs/proto-signing";
import { z } from "zod";

import { ChainId, Url } from "@nillion/client-core";

export const PaymentClientConfig = z.object({
  chainId: ChainId,
  endpoint: Url,
  signer: z.custom<OfflineSigner>().optional(),
});

export type PaymentClientConfig = z.infer<typeof PaymentClientConfig>;

export const NilChainProtobufTypeUrl = "/nillion.meta.v1.MsgPayFor";
