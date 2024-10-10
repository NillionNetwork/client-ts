import * as React from "react";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  QueryClient,
  QueryClientContext,
  QueryClientProvider,
} from "@tanstack/react-query";

import {
  ChainId,
  ClusterId,
  Multiaddr,
  NamedNetwork,
  NamedNetworkConfig,
  Url,
} from "@nillion/client-core";
import { NetworkConfig, NillionClient } from "@nillion/client-vms";

import { Log } from "./logging";

/**
 * `WithConfigProps`
 * `config` is a ProviderNetworkConfig
 * `network` is a NamedNetwork
 * `client` is not allowed
 **/
interface WithConfigProps {
  config?: ProviderNetworkConfig;
  network?: NamedNetwork;
  client?: never;
}

/**
 * `ProviderNetworkConfig`
 * `bootnodes` is an array of Multiaddr or string
 * `clusterId` is a ClusterId or string
 * `nilChainId` is a ChainId or string
 * `nilChainEndpoint` is a Url or string
 */
interface ProviderNetworkConfig {
  bootnodes?: (Multiaddr | string)[];
  clusterId?: ClusterId | string;
  nilChainId?: ChainId | string;
  nilChainEndpoint?: Url | string;
}

/**
 * `WithClientProps`
 * `client` is a `NillionClient`
 * `config` is not allowed
 * `network` is not allowed
 */
interface WithClientProps {
  client: NillionClient;
  config?: never;
  network?: never;
}

/**
 * `NillionProviderProps`
 * Alias for either WithConfigProps or WithClientProps
 */
export type NillionProviderProps = WithConfigProps | WithClientProps;

/**
 * `NillionContext`
 * `client` is a NillionClient
 * `logout` is a function that returns a Promise<void>
 */
export interface NillionContext {
  client: NillionClient;
  logout: () => Promise<void>;
}

/**
 * `NillionContext`
 * It provides a `NillionClient` context
 */
export const NillionContext = createContext<NillionContext | undefined>(
  undefined,
);

// Moving this into the hook means the client doesn't persist when strict mode is enabled
const client = NillionClient.create();

/**
 * NillionProvider
 * @param NillionProviderProps - expects provider props or a `ReactNode`
 * @returns ReactNode
 */
export const NillionProvider: React.FC<
  NillionProviderProps & { children: ReactNode }
> = (props): ReactNode => {
  const existingQueryClient = useContext(QueryClientContext);
  const [queryClient] = useState<QueryClient>(new QueryClient());
  const [nillionClient] = useState<NillionClient>(client);

  const { children, network, config } = props;

  useEffect(() => {
    if (existingQueryClient) Log("Reusing detected react query context.");
    else Log("No react query context detected; creating one.");

    // default to photon
    let combined: ProviderNetworkConfig = NamedNetworkConfig.photon;

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- parse and on failure throw if invalid "network" value
    if (network && NamedNetwork.parse(network)) {
      combined = NamedNetworkConfig[network];
    }
    if (config) {
      combined = {
        ...combined,
        ...config,
      };
    }
    nillionClient.setNetworkConfig(combined as NetworkConfig);
  }, []);

  const context: NillionContext = {
    client: nillionClient,
    logout: async () => {
      await nillionClient.disconnect();
    },
  };

  if (existingQueryClient) {
    return (
      <NillionContext.Provider value={context}>
        {children}
      </NillionContext.Provider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <NillionContext.Provider value={context}>
        {children}
      </NillionContext.Provider>
    </QueryClientProvider>
  );
};
