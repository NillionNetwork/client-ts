import { z } from "zod";

import { ChainId, ClusterId, Multiaddr, Url } from "./types";

export const NamedNetwork = z.enum(["photon", "devnet"]);
export type NamedNetwork = z.infer<typeof NamedNetwork>;

export const NamedNetworkConfig = {
  devnet: {
    clusterId: ClusterId.parse("9e68173f-9c23-4acc-ba81-4f079b639964"),
    bootnodes: [
      Multiaddr.parse(
        "/ip4/127.0.0.1/tcp/54936/ws/p2p/12D3KooWMvw1hEqm7EWSDEyqTb6pNetUVkepahKY6hixuAuMZfJS",
      ),
    ],
    nilChainId: ChainId.parse("nillion-chain-devnet"),
    nilChainEndpoint: Url.parse("http://127.0.0.1:48102"),
  },
  photon: {
    clusterId: ClusterId.parse("b13880d3-dde8-4a75-a171-8a1a9d985e6c"),
    bootnodes: [
      Multiaddr.parse(
        "/dns/node-1.testnet-photon.nillion-network.nilogy.xyz/tcp/14211/wss/p2p/12D3KooWCfFYAb77NCjEk711e9BVe2E6mrasPZTtAjJAPtVAdbye",
      ),
    ],
    nilChainId: ChainId.parse("nillion-chain-testnet-1"),
    nilChainEndpoint: Url.parse(
      "https://rpc.testnet.nilchain-rpc-proxy.nilogy.xyz",
    ),
  },
};
