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

/** `StoreValueArgs` is an interface that can be passed to the `store` function
 * @param data - `NadaPrimitiveValue`
 * @param secret - `boolean`
 */
export interface StoreValueArgs {
  data: NadaPrimitiveValue;
  secret: boolean;
}

/** `NetworkConfig` is an interface that can be passed to the `toNadaValues` function
 * @param bootnotes - `Multiaddr[]`
 * @param clusterId - `ClusterId`
 * @param nilChainId - `ChainId`
 * @param nilChainEndpoint - `Url`
 */
export const NetworkConfig = z.object({
  bootnodes: z.array(Multiaddr),
  clusterId: ClusterId,
  nilChainId: ChainId,
  nilChainEndpoint: Url,
});
export type NetworkConfig = z.infer<typeof NetworkConfig>;

/** `UserCredentials` is an interface that can be passed to the `toNadaValues` function
 * @param nodeSeed - `NodeSeed`
 * @param signer - `OfflineSigner`
 * @param userSeed - `UserSeed`
 */
export const UserCredentials = z.object({
  userSeed: UserSeed,
  nodeSeed: NodeSeed.default(() => window.crypto.randomUUID()),
  signer: z.union([
    z.literal("keplr"),
    z.function().returns(z.custom<OfflineSigner>().promise()),
  ]),
});
export type UserCredentials = z.infer<typeof UserCredentials>;
