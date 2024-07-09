import { Config, NilVmClient, NilVmClientArgs } from "@nillion/core";
import fixtureConfig from "../src/fixture/local.json";
import { initializeNillion } from "@nillion/core/src/init";
import { PartyId, PrivateKeyBase16 } from "@nillion/types";
import { NilChainPaymentClient } from "@nillion/payments/src/client";
import { createSignerFromKey } from "@nillion/payments";

export interface Context {
  nilvm: NilVmClient;
  nilchain: NilChainPaymentClient;
  config: Config;
  fixtureConfig: {
    bootnodes: string[];
    clusterId: string;
    programsNamespace: string;
    paymentsRpcEndpoint: string;
    paymentsKey: string;
  };
  test1: {
    // computeId: ResultId;
    // computeStoreValuesId: string;
    // computeValues: NadaValues;
    input: string;
    originalBlob: Uint8Array;
    originalInteger: number;
    partyId: PartyId;
    // programBindings: ProgramBindings;
    // programId: string;
    storeId: string;
  };
}

export const loadFixtureContext = async (): Promise<Context> => {
  await initializeNillion();

  const config = Config.Devnet;
  const args: NilVmClientArgs = {
    bootnodes: config.bootnodes,
    clusterId: config.clusterId,
    userSeed: "nillion-testnet-seed-1",
    nodeSeed: "nillion-testnet-seed-1",
  };
  const nilvm = NilVmClient.create(args);
  const key = PrivateKeyBase16.parse(fixtureConfig.payments_key);
  const signer = await createSignerFromKey(key);
  const nilchain = await NilChainPaymentClient.create(
    config.chainEndpoint,
    signer,
  );

  return {
    nilvm,
    nilchain,
    config,
    fixtureConfig: {
      bootnodes: fixtureConfig.bootnodes,
      clusterId: fixtureConfig.cluster_id,
      paymentsKey: fixtureConfig.payments_key,
      paymentsRpcEndpoint: fixtureConfig.payments_rpc_endpoint,
      programsNamespace: fixtureConfig.programs_namespace,
    },
    test1: {
      // computeId: "" as ResultId,
      // computeStoreValuesId: "",
      // computeValues: new NadaValues(),
      input: "this is a test",
      originalBlob: new Uint8Array(),
      originalInteger: 0,
      partyId: PartyId.parse(
        "12D3KooWGq5MCUuLARrwM95muvipNWy4MqmCk41g9k9JVth6AF6e",
      ),
      // programBindings: new ProgramBindings(""),
      // programId: `${fixtureConfig.programs_namespace}/simple`,
      storeId: "",
    },
  };
};
