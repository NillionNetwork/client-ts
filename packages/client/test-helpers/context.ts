import fixtureConfig from "../../fixture/network.json";
import {
  Config,
  NilVmClient,
  NilVmClientArgs,
  PrivateKeyBase16,
} from "@nillion/core";
import { createSignerFromKey, NilChainPaymentClient } from "@nillion/payments";
import { NillionClient } from "@nillion/client";

export interface ClientsAndConfig {
  client: NillionClient;
  clientVm: NilVmClient;
  clientChain: NilChainPaymentClient;
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

  const args: NilVmClientArgs = {
    bootnodes: configNetwork.bootnodes,
    clusterId: configNetwork.clusterId,
    userSeed: "nillion-testnet-seed-1",
    nodeSeed: "nillion-testnet-seed-1",
  };
  const clientVm = NilVmClient.create(args);
  const key = PrivateKeyBase16.parse(fixtureConfig.payments_key);
  const signer = await createSignerFromKey(key);
  const clientChain = await NilChainPaymentClient.create(chainEndpoint, signer);
  const client = NillionClient.create(clientVm, clientChain);

  return {
    client,
    clientVm,
    clientChain,
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
