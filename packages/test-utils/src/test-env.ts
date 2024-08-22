export const TestEnv = {
  bootnodes: [process.env.NILLION_BOOTNODE_WEBSOCKET ?? ""],
  cluster: process.env.NILLION_CLUSTER_ID ?? "",
  chainId: process.env.NILLION_NILCHAIN_CHAIN_ID ?? "",
  chainRpcEndpoint: process.env.NILLION_NILCHAIN_JSON_RPC ?? "",
  chainPrivateKey0: process.env.NILLION_NILCHAIN_PRIVATE_KEY_0 ?? "",
  userSeed: process.env.NILLION_USER_SEED ?? "",
  programNamespace: process.env.NILLION_TEST_PROGRAMS_NAMESPACE ?? "",
};
