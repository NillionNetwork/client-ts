import fixtureConfig from "../../fixture/network.json";
import { Config, PrivateKeyBase16 } from "@nillion/core";
import { createSignerFromKey } from "@nillion/payments";
import { NillionClient, NillionClientConnectionArgs } from "@nillion/client";

export interface ClientsAndConfig {
  client: NillionClient;
  configNetwork: Config;
  configFixture: {
    bootnodes: string[];
    clusterId: string;
    programsNamespace: string;
    paymentsRpcEndpoint: string;
    paymentsKey: string;
  };
}

export const loadClientsAndConfig = async (): Promise<ClientsAndConfig> => {
  const configNetwork = Config.TestFixture;
  const { bootnodes, clusterId, chainEndpoint } = configNetwork;
  const {
    payments_key: paymentsKey,
    payments_rpc_endpoint: paymentsRpcEndpoint,
    programs_namespace: programsNamespace,
  } = fixtureConfig;

  const client = NillionClient.create();

  const key = PrivateKeyBase16.parse(paymentsKey);
  const args = {
    // vm
    bootnodes: configNetwork.bootnodes,
    clusterId: configNetwork.clusterId,
    userSeed: "nillion-testnet-seed-1",
    nodeSeed: "nillion-testnet-seed-1",
    // payments
    endpoint: chainEndpoint,
    signerOrCreateFn: () => createSignerFromKey(key),
  } as NillionClientConnectionArgs;

  await client.connect(args);

  return {
    client,
    configNetwork,
    configFixture: {
      bootnodes,
      clusterId,
      paymentsKey,
      paymentsRpcEndpoint,
      programsNamespace,
    },
  };
};
