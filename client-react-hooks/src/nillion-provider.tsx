import type { VmClient } from "@nillion/client-vms";
import {
  QueryClient,
  QueryClientContext,
  QueryClientProvider,
} from "@tanstack/react-query";
// biome-ignore lint/style/useImportType: NillionContext.Provider requires the React value in scope but biome thinks only the type is needed
import React from "react";
import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { Log } from "./logging";

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

  useEffect(() => {
    if (existingQueryClient) Log.debug("Reusing react query context");
    else Log.debug("Creating react query context");
  }, []);

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
