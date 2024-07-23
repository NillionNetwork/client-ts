import { z } from "zod";
import {
  NamedNetwork,
  NodeSeed,
  UserSeed,
  VmClientConfig,
} from "@nillion/core";
import { PaymentClientConfig } from "@nillion/payments";

export const NillionClientConfigComplete = z
  .object({ network: NamedNetwork })
  .merge(VmClientConfig)
  .merge(PaymentClientConfig);

export type NillionClientConfigComplete = z.infer<
  typeof NillionClientConfigComplete
>;

export const NillionClientConfig = z.object({
  network: NamedNetwork.optional(),
  userSeed: UserSeed.optional(),
  nodeSeed: NodeSeed.optional(),
  overrides: z
    .function()
    .args()
    .returns(z.promise(NillionClientConfigComplete.partial()))
    .optional(),
});
export type NillionClientConfig = z.infer<typeof NillionClientConfig>;
