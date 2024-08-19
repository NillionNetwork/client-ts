"use client";

import * as React from "react";
import { NamedNetwork } from "@nillion/client-core";
import { createSignerFromKey } from "@nillion/client-payments";
import { NillionClientProvider } from "@nillion/client-react-hooks";
import { NillionClient } from "@nillion/client-vms";
import { useState } from "react";

const createNillionClient = () =>
  NillionClient.create({
    network: NamedNetwork.enum.Devnet,
    overrides: async () => {
        // first account when running `nillion-devnet` with default seed
        const signer = await createSignerFromKey(
          "9a975f567428d054f2bf3092812e6c42f901ce07d9711bc77ee2cd81101f42c5"
        );
        return {
          endpoint: "http://localhost:8080/nilchain",
          signer,
          userSeed: "nillion-devnet",
          nodeSeed: Math.random().toString(),
          bootnodes: [
            "/ip4/127.0.0.1/tcp/54936/ws/p2p/12D3KooWMvw1hEqm7EWSDEyqTb6pNetUVkepahKY6hixuAuMZfJS",
          ],
          cluster: "9e68173f-9c23-4acc-ba81-4f079b639964",
          chain: "nillion-chain-devnet",
        };
      },
  });

export function NillionWrappedProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [client] = useState(createNillionClient);

  return (
    <NillionClientProvider client={client}>{children}</NillionClientProvider>
  );
}
