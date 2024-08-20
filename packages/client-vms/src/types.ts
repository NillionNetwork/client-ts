import {
  NadaPrimitiveValue,
  NamedNetwork,
  NodeSeed,
  UserSeed,
} from "@nillion/client-core";
import { PaymentClientConfig } from "@nillion/client-payments";
import { z } from "zod";
import { VmClientConfig } from "./nilvm";

export const NillionClientConfigComplete = z
  .object({
    network: NamedNetwork,
    logging: z.boolean().optional(),
  })
  .merge(VmClientConfig)
  .merge(PaymentClientConfig);

export type NillionClientConfigComplete = z.infer<
  typeof NillionClientConfigComplete
>;

export const NillionClientConfig = z.object({
  network: z.union([NamedNetwork, z.string().min(1)]).optional(),
  userSeed: z.union([UserSeed, z.string().min(1)]).optional(),
  nodeSeed: z.union([NodeSeed, z.string().min(1)]).optional(),
  overrides: z
    .function()
    .args()
    .returns(
      z.union([z.promise(NillionClientConfigComplete.partial()), z.object({})]),
    )
    .optional(),
});
export type NillionClientConfig = z.infer<typeof NillionClientConfig>;

export interface StoreValueArgs {
  data: NadaPrimitiveValue;
  secret: boolean;
}
