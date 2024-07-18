import { NillionClient } from "@nillion/client";
import React, { createContext, ReactNode } from "react";

export interface NillionProviderValue {
  client: NillionClient;
}

export interface NillionProviderProps {
  children: ReactNode;
  value: NillionProviderValue;
}

interface Context {
  client: NillionClient;
}

export const NillionContext = createContext<Context | null>(null);

export function NillionProvider(
  props: NillionProviderProps,
): React.ReactElement {
  return (
    <NillionContext.Provider value={{ client: props.value.client }}>
      {props.children}
    </NillionContext.Provider>
  );
}
