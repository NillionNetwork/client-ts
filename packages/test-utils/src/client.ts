import { PrivateKeyBase16 } from "@nillion/client-core";
import {
  createSignerFromKey,
  PaymentClientConfig,
} from "@nillion/client-payments";
import {
  NetworkConfig,
  NilVmClientConfig,
  UserCredentials,
} from "@nillion/client-vms";

import { TestEnv } from "./test-env";

export const getVmClientEnvConfig = (): NilVmClientConfig => {
  return NilVmClientConfig.parse(
    {
      clusterId: TestEnv.clusterId,
      bootnodes: TestEnv.bootnodesWebsocket,
      userSeed: TestEnv.userSeed,
      nodeSeed: window.crypto.randomUUID(),
    },
    { path: ["getVmClientEnvConfig", "NilVmClientConfig"] },
  );
};

export const getPaymentsClientEnvConfig =
  async (): Promise<PaymentClientConfig> => {
    const key = PrivateKeyBase16.parse(TestEnv.nilChainPrivateKey0);
    return PaymentClientConfig.parse(
      {
        chainId: TestEnv.chainId,
        endpoint: TestEnv.nilChainJsonRpc,
        signer: await createSignerFromKey(key),
      },
      { path: ["getPaymentsClientEnvConfig", "PaymentClientConfig"] },
    );
  };

export const getNetworkConfig = (): NetworkConfig => {
  return NetworkConfig.parse(
    {
      clusterId: TestEnv.clusterId,
      bootnodes: TestEnv.bootnodesWebsocket,
      nilChainId: TestEnv.chainId,
      nilChainEndpoint: TestEnv.nilChainJsonRpc,
    },
    { path: ["getNetworkConfig", "NetworkConfig"] },
  );
};

export const getUserCredentials = (): UserCredentials => {
  const key = PrivateKeyBase16.parse(TestEnv.nilChainPrivateKey0);
  return UserCredentials.parse(
    {
      userSeed: TestEnv.userSeed,
      nodeSeed: window.crypto.randomUUID(),
      signer: () => createSignerFromKey(key),
    },
    { path: ["getUserCredentials", "UserCredentials"] },
  );
};
