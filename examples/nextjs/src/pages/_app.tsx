import * as React from "react";
import { NamedNetwork } from "@nillion/client-core";
import { createSignerFromKey } from "@nillion/client-payments";
import { NillionClientProvider } from "@nillion/client-react-hooks";
import { NillionClient } from "@nillion/client-vms";
import type { AppProps } from "next/app";

export const client = NillionClient.create({
  network: NamedNetwork.enum.Devnet,

  overrides: async () => {
    // first account when running `nillion-devnet` with default seed
    const signer = await createSignerFromKey(
      "9a975f567428d054f2bf3092812e6c42f901ce07d9711bc77ee2cd81101f42c5",
    );
    return {
      endpoint: "http://localhost:3000/nilchain",
      signer,
      userSeed: "nillion-devnet",
      nodeSeed: "nillion-devnet",
    };
  },
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <NillionClientProvider client={client}>
      <Component {...pageProps} />
    </NillionClientProvider>
  );
}
