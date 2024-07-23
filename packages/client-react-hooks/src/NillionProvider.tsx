import * as React from "react";
import { NillionClient } from "../../client-vms";
import { createContext, ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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
  queryClient,
}: NillionClientProviderProps): React.ReactElement => {
  const reactQueryClient = queryClient ? queryClient : new QueryClient();
  return (
    <QueryClientProvider client={reactQueryClient}>
      <NillionClientContext.Provider value={client}>
        {children}
      </NillionClientContext.Provider>
    </QueryClientProvider>
  );
};
