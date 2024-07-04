import {
  Builder,
  NadaValues,
  NetworkName,
  NillionClient,
  NillionConfig,
  ProgramBindings,
  ResultId,
} from "@nillion/core";
import fixtureConfig from "../src/fixture/local.json";
import { initializeNillion } from "@nillion/core/src/init";

export interface Context {
  client: NillionClient;
  config: NillionConfig;
  fixtureConfig: {
    bootnodes: string[];
    clusterId: string;
    programsNamespace: string;
    paymentsRpcEndpoint: string;
    paymentsKey: string;
  };
  test1: {
    computeId: ResultId;
    computeStoreValuesId: string;
    computeValues: NadaValues;
    input: string;
    originalBlob: Uint8Array;
    originalInteger: string;
    partyId: string;
    programBindings: ProgramBindings;
    programId: string;
    storeId: string;
  };
}

export const loadFixtureContext = async (): Promise<Context> => {
  await initializeNillion();
  const config = NillionConfig.get(NetworkName.LocalTestnet)!;

  const signer = await Builder.createChainSignerFromKey(
    fixtureConfig.payments_key,
  );
  const client = await Builder.createNillionClient(
    config,
    Builder.nodeKeyFromSeed("nillion-testnet-seed-1"),
    signer,
    Builder.userKeyFromSeed("nillion-testnet-seed-1"),
  );

  return {
    client,
    config,
    fixtureConfig: {
      bootnodes: fixtureConfig.bootnodes,
      clusterId: fixtureConfig.cluster_id,
      paymentsKey: fixtureConfig.payments_key,
      paymentsRpcEndpoint: fixtureConfig.payments_rpc_endpoint,
      programsNamespace: fixtureConfig.programs_namespace,
    },
    test1: {
      computeId: "" as ResultId,
      computeStoreValuesId: "",
      computeValues: new NadaValues(),
      input: "this is a test",
      originalBlob: new Uint8Array(),
      originalInteger: "",
      partyId: "12D3KooWGq5MCUuLARrwM95muvipNWy4MqmCk41g9k9JVth6AF6e",
      programBindings: new ProgramBindings(""),
      programId: `${fixtureConfig.programs_namespace}/simple`,
      storeId: "",
    },
  };
};
