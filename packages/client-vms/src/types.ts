import { OfflineSigner } from "@cosmjs/proto-signing";
import { z } from "zod";

import {
  ChainId,
  ClusterId,
  Multiaddr,
  NadaPrimitiveValue,
  NodeSeed,
  Url,
  UserSeed,
} from "@nillion/client-core";

export interface StoreValueArgs {
  data: NadaPrimitiveValue;
  secret: boolean;
}

export const NetworkConfig = z.object({
  bootnodes: z.array(Multiaddr),
  clusterId: ClusterId,
  nilChainId: ChainId,
  nilChainEndpoint: Url,
});
export type NetworkConfig = z.infer<typeof NetworkConfig>;

export const UserCredentials = z.object({
  userSeed: UserSeed,
  nodeSeed: NodeSeed.default(() => window.crypto.randomUUID()),
  signer: z.union([
    z.literal("keplr"),
    z.function().returns(z.custom<OfflineSigner>().promise()),
  ]),
});
export type UserCredentials = z.infer<typeof UserCredentials>;
