import * as React from "react";
import { createContext, ReactNode, useContext, useEffect } from "react";
import {
  QueryClient,
  QueryClientContext,
  QueryClientProvider,
} from "@tanstack/react-query";

import { NillionClient } from "@nillion/client-vms";

import { Log } from "../logging";

export interface NillionClientProviderProps {
  client: NillionClient;
  queryClient?: QueryClient;
  children: ReactNode;
}

export const NillionClientContext = createContext<NillionClient | undefined>(
  undefined,
);

export const NillionClientProvider = ({
  client,
  children,
}: NillionClientProviderProps): React.ReactElement => {
  const existingQueryClient = useContext(QueryClientContext);

  async function run() {
    try {
      if (!client.ready) {
        await client.connect();
      }
    } catch (e: unknown) {
      const error = new Error("NillionClient failed to connect", {
        cause: e,
      });
      console.error(error);
      throw error;
    }
  }

  useEffect(() => {
    void run();
    return () => {
      client.disconnect();
    };
  }, [client.ready]);

  if (existingQueryClient) {
    Log("Existing QueryClientContext detected will not create one.");
    return (
      <NillionClientContext.Provider value={client}>
        {children}
      </NillionClientContext.Provider>
    );
  } else {
    Log("No QueryClientContext detected will create it.");
    const queryClient = new QueryClient();
    return (
      <QueryClientProvider client={queryClient}>
        <NillionClientContext.Provider value={client}>
          {children}
        </NillionClientContext.Provider>
      </QueryClientProvider>
    );
  }
};
