import * as React from "react";
import { NillionClient } from "@nillion/client-vms";
import { createContext, ReactNode, useContext, useEffect } from "react";
import {
  QueryClient,
  QueryClientContext,
  QueryClientProvider,
} from "@tanstack/react-query";
import { Log } from "./logging";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

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
    Log("Existing QueryClientContext detected will attempt to use it.");
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
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    );
  }
};
