import {
  NillionClient,
  ConnectionArgs,
  PrivateKeyBase16,
} from "@nillion/client";
import { useContext, useEffect, useState } from "react";
import { createSignerFromKey } from "@nillion/payments";
import { NillionContext } from "./NillionProvider";

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

export interface UseNillionHook {
  client: NillionClient;
  error?: Error;
  ready: boolean;
}

export interface UseNillionHookArgs {
  foo?: string;
}

export function useNillion(_args?: UseNillionHookArgs): UseNillionHook {
  const context = useContext(NillionContext);
  if (!context) {
    throw new Error("useNillionClient must be used within a NillionProvider");
  }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error>();
  const client = context.client;

  useEffect(() => {
    async function run() {
      const key = PrivateKeyBase16.parse(config.paymentsKey);
      const args = {
        // vm
        bootnodes: config.bootnodes,
        clusterId: config.clusterId,
        userSeed: config.userSeed,
        nodeSeed: config.nodeSeed,
        // payments
        endpoint: config.chainEndpoint,
        signerOrCreateFn: () => createSignerFromKey(key),
      } as ConnectionArgs;

      await client.connect(args);
      setLoading(false);
    }

    void run().catch((e: unknown) => {
      const error = new Error("NillionClient failed to connect", { cause: e });
      console.error(error);
      setError(error);
    });
  }, []);

  if (error) {
    return { client, error, ready: false };
  } else {
    return { client, error: undefined, ready: client.ready };
  }
}
