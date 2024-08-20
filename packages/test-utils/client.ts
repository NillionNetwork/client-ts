import { NamedNetwork, PrivateKeyBase16 } from "../client-core/src";
import {
  createSignerFromKey,
  PaymentClientConfig,
} from "../client-payments/src";
import { NillionClientConfig, NilVmClientConfig } from "../client-vms/src";
import { TestEnv } from "./test-env";

export const getVmClientEnvConfig = (): NilVmClientConfig => {
  return NilVmClientConfig.parse({
    cluster: TestEnv.cluster,
    bootnodes: TestEnv.bootnodes,
    userSeed: TestEnv.userSeed,
    nodeSeed: window.crypto.randomUUID(),
  });
};

export const getPaymentsClientEnvConfig =
  async (): Promise<PaymentClientConfig> => {
    const key = PrivateKeyBase16.parse(TestEnv.chainPrivateKey0);
    return PaymentClientConfig.parse({
      chain: TestEnv.chainId,
      endpoint: TestEnv.chainRpcEndpoint,
      signer: await createSignerFromKey(key),
    });
  };

export const getNillionClientEnvConfig = (): NillionClientConfig => {
  return {
    network: NamedNetwork.enum.Custom,

    overrides: async () => {
      const vmConfig = {
        bootnodes: TestEnv.bootnodes,
        cluster: TestEnv.cluster,
        userSeed: TestEnv.userSeed,
        nodeSeed: window.crypto.randomUUID(),
      };

      const key = PrivateKeyBase16.parse(TestEnv.chainPrivateKey0);
      const paymentsConfig = {
        chain: TestEnv.chainId,
        endpoint: TestEnv.chainRpcEndpoint,
        signer: await createSignerFromKey(key),
      };

      return {
        ...vmConfig,
        ...paymentsConfig,
      };
    },
  };
};
