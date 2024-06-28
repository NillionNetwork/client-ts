import { NillionClient, NodeKey, UserKey } from "@nillion/client-wasm";
import { NillionConfig } from "./configs";

export function createClient(config: NillionConfig): NillionClient {
  const userKey = UserKey.from_seed(config.user.userSeed);
  const nodeKey = NodeKey.from_seed(config.user.userSeed);
  return new NillionClient(userKey, nodeKey, config.vm.bootnodes);
}
