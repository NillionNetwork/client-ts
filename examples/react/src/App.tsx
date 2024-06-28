import { NillionProvider, useNillionBootstrap } from "@nillion/react-hooks";
import { NilDemo } from "./NilDemo";
import React from "react";
import { configs } from "@nillion/core";

export function App() {
  const config = configs.devnet;
  const { client, error, ready } = useNillionBootstrap(config);

  if (!ready) {
    return <h1>loading ...</h1>;
  }

  if (error) {
    return <h1>error: {error}</h1>;
  }

  return (
    <NillionProvider value={{ client, config }}>
      <NilDemo />
    </NillionProvider>
  );
}
