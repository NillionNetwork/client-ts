import React from "react";
import { NillionProvider } from "@nillion/react-hooks";
import { NillionClient } from "@nillion/client";
import { Demo } from "./Demo";

export function App() {
  const client = NillionClient.create();

  return (
    <NillionProvider value={{ client }}>
      <Demo />
    </NillionProvider>
  );
}
