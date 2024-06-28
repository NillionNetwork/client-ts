import { NillionClient, NillionConfig } from "@nillion/core";
import React, { ReactNode, createContext, useContext } from "react";

export type Context = {
  config: NillionConfig;
  client: NillionClient;
};

export const NillionContext = createContext<Context | undefined>(undefined);

export function useNillion() {
  const context = useContext(NillionContext);
  if (!context) {
    throw new Error("useNillionClient must be used within a NillionProvider");
  }
  return context;
}

export type NillionProviderValue = {
  config: NillionConfig;
};

export type NillionProviderProps = {
  children: ReactNode;
  value: Context;
};

export function NillionProvider(
  props: NillionProviderProps,
): React.ReactElement {
  return (
    <NillionContext.Provider value={props.value}>
      {props.children}
    </NillionContext.Provider>
  );
}
