import React from "react";
import { NillionClientProvider } from "@nillion/react-hooks";
import { NillionClient } from "@nillion/client";
import { DemoUseValue } from "./DemoUseValue";

export function App() {
  const client = NillionClient.create();

  return (
    <NillionClientProvider client={client}>
      <DemoUseValue />
    </NillionClientProvider>
  );
}
