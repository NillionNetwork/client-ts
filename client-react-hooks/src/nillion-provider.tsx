import type { VmClient } from "@nillion/client-vms";
import {
  QueryClient,
  QueryClientContext,
  QueryClientProvider,
} from "@tanstack/react-query";
import { type ReactNode, createContext, useContext, useState } from "react";

export interface NillionContext {
  client: VmClient;
}

export type NillionProviderProps = {
  client: VmClient;
  children: ReactNode;
};

export const NillionContext = createContext<NillionContext | undefined>(
  undefined,
);

export const NillionProvider: React.FC<NillionProviderProps> = (
  props,
): ReactNode => {
  const existingQueryClient = useContext(QueryClientContext);
  const [queryClient] = useState<QueryClient>(new QueryClient());
  const { children } = props;

  const context: NillionContext = {
    client: props.client,
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
