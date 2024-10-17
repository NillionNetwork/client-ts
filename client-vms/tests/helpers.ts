import process from "node:process";

export const Env = {
  bootnodesWebsocket: [process.env.NILLION_BOOTNODE_WEBSOCKET ?? ""],
  bootnodesMultiAddr: [process.env.NILLION_BOOTNODE_MULTIADDRESS ?? ""],
  clusterId: process.env.NILLION_CLUSTER_ID ?? "",
  bootnodeUrl: process.env.NILLION_BOOTNODE_URL ?? "",
  chainId: process.env.NILLION_NILCHAIN_CHAIN_ID ?? "",
  nilChainJsonRpc: process.env.NILLION_NILCHAIN_JSON_RPC ?? "",
  nilChainRestApi: process.env.NILLION_NILCHAIN_REST_API ?? "",
  nilChainGrpc: process.env.NILLION_NILCHAIN_GRPC ?? "",
  nilChainPrivateKey0: process.env.NILLION_NILCHAIN_PRIVATE_KEY_0 ?? "",
  nilChainPrivateKey1: process.env.NILLION_NILCHAIN_PRIVATE_KEY_1 ?? "",
  nilChainPrivateKey2: process.env.NILLION_NILCHAIN_PRIVATE_KEY_2 ?? "",
  nilChainPrivateKey3: process.env.NILLION_NILCHAIN_PRIVATE_KEY_3 ?? "",
  nilChainPrivateKey4: process.env.NILLION_NILCHAIN_PRIVATE_KEY_4 ?? "",
  nilChainPrivateKey5: process.env.NILLION_NILCHAIN_PRIVATE_KEY_5 ?? "",
  nilChainPrivateKey6: process.env.NILLION_NILCHAIN_PRIVATE_KEY_6 ?? "",
  nilChainPrivateKey7: process.env.NILLION_NILCHAIN_PRIVATE_KEY_7 ?? "",
  nilChainPrivateKey8: process.env.NILLION_NILCHAIN_PRIVATE_KEY_8 ?? "",
  nilChainPrivateKey9: process.env.NILLION_NILCHAIN_PRIVATE_KEY_9 ?? "",
  userSeed: process.env.NILLION_USER_SEED ?? "",
  programNamespace: process.env.NILLION_TEST_PROGRAMS_NAMESPACE ?? "",
};

export const PrivateKeyPerSuite = {
  Payments: Env.nilChainPrivateKey0,
  LeaderQuery: Env.nilChainPrivateKey1,
  VmClient: Env.nilChainPrivateKey2,
  // Env.nilChainPrivateKey3,
  // Env.nilChainPrivateKey4,
  // Env.nilChainPrivateKey5,
  // Env.nilChainPrivateKey6,
  // Env.nilChainPrivateKey7,
  // Env.nilChainPrivateKey8,
  // Env.nilChainPrivateKey9,
};

export const loadProgram = async (name: string): Promise<Uint8Array> => {
  const path = `__resources__/programs/dist/${name}`;
  try {
    const response = await fetch(path);
    const body = (await response.body?.getReader().read())?.value;
    if (body) return body;
    throw new Error(`Could not find program for ${name}`);
  } catch (e) {
    console.error("failed to load program: ", path);
    console.error("error: ", e);
    throw e;
  }
};
