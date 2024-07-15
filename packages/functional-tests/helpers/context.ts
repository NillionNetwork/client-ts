import fixtureConfig from "../src/fixture/local.json";
import {
  Config,
  NilVmClient,
  NilVmClientArgs,
  PrivateKeyBase16,
} from "@nillion/core";
import { createSignerFromKey, NilChainPaymentClient } from "@nillion/payments";
import { NillionClient } from "@nillion/clent";

export interface Context<T> {
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
  env: T;
  // {
  //   resultId: ComputeResultId;
  //   computeValuesStoreId: StoreId;
  //   computeValues: NadaValues;
  //   input: string;
  //   originalBlob: Uint8Array;
  //   originalInteger: number;
  //   partyId: PartyId;
  //   programBindings: ProgramBindings;
  //   programId: ProgramId;
  //   storeId: string;
  // };
}

export const loadFixtureContext = async <T>(env: T): Promise<Context<T>> => {
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
    env,
  };
};
