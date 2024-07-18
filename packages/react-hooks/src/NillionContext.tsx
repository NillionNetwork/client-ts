import { NillionClient, init } from "@nillion/client";
import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  ClusterId,
  Multiaddr,
  NilVmClient,
  NilVmClientArgs,
  PrivateKeyBase16,
  Url,
} from "@nillion/core";
import { createSignerFromKey, NilChainPaymentClient } from "@nillion/payments";

type Bootstrap =
  | {
      client: undefined;
      error: string;
      ready: false;
    }
  | {
      client: NillionClient;
      error: undefined;
      ready: true;
    };

const config = {
  chainEndpoint: "http://localhost:8080/nilchain",
  chainId: "nillion-chain-devnet",
  clusterId: "e2c959ca-ecb2-45b0-8f2b-d91abbfa3708",
  bootnodes: [
    "/ip4/127.0.0.1/tcp/14211/ws/p2p/12D3KooWCAGu6gqDrkDWWcFnjsT9Y8rUzUH8buWjdFcU3TfWRmuN",
  ],

  paymentsKey:
    "5c98e049ceca4e2c342516e1b81c689e779da9dbae64ea6b92d52684a92095e6",
  programsNamespace:
    "2T4fztTMUvoRXena6REbBEfr5BC3n1BDf5DJusKUAm6EwNYFTmTPQDpw1va8yGxenwAJxV9nA2umhhAAJXj1FYmu",
  userSeed: "nillion-testnet-seed-1",
  nodeSeed: "nillion-testnet-seed-1",
};

export function useNillionBootstrap(): Bootstrap {
  const [_ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [client, setClient] = useState<NillionClient>();

  useEffect(() => {
    async function bootstrap() {
      await init();

      const args: NilVmClientArgs = {
        bootnodes: config.bootnodes,
        clusterId: config.clusterId,
        userSeed: config.userSeed,
        nodeSeed: config.nodeSeed,
      };
      const clientVm = NilVmClient.create(args);
      const key = PrivateKeyBase16.parse(config.paymentsKey);
      const signer = await createSignerFromKey(key);
      const clientChain = await NilChainPaymentClient.create(
        config.chainEndpoint,
        signer,
      );
      const client = NillionClient.create(clientVm, clientChain);
      setReady(true);
      setClient(client);
    }

    bootstrap().catch((e) => {
      console.error(e);
      setError("failed to initialise nillion client");
    });
  }, []);

  if (client) {
    return { client, error: undefined, ready: true };
  } else {
    return { client: undefined, error, ready: false };
  }
}

export interface Context {
  client: NillionClient;
}

export const NillionContext = createContext<Context | undefined>(undefined);

export function useNillion() {
  const context = useContext(NillionContext);
  if (!context) {
    throw new Error("useNillionClient must be used within a NillionProvider");
  }
  return context;
}

export interface NillionProviderValue {
  client: NillionClient;
}

export interface NillionProviderProps {
  children: ReactNode;
  value: NillionProviderValue;
}

export function NillionProvider(
  props: NillionProviderProps,
): React.ReactElement {
  return (
    <NillionContext.Provider value={{ client: props.value.client }}>
      {props.children}
    </NillionContext.Provider>
  );
}
