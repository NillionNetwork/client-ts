import { NillionClient } from "@nillion/client";
import React, { createContext, ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export interface NillionClientProviderProps {
  children: ReactNode;
  client: NillionClient;
  queryClient?: QueryClient;
}

export const NillionClientContext = createContext<NillionClient>(
  NillionClient.create(),
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
