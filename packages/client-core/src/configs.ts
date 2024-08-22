import { z } from "zod";

export const NamedNetwork = z.enum(["Photon", "Nucleus", "Devnet", "Custom"]);
export type NamedNetwork = z.infer<typeof NamedNetwork>;

export const PartialConfig = {
  Devnet: {
    network: NamedNetwork.enum.Devnet,
    cluster: "9e68173f-9c23-4acc-ba81-4f079b639964",
    bootnodes: [
      "/ip4/127.0.0.1/tcp/54936/ws/p2p/12D3KooWMvw1hEqm7EWSDEyqTb6pNetUVkepahKY6hixuAuMZfJS",
    ],
    chain: "nillion-chain-devnet",
    endpoint: "http://localhost:26650",
    logging: true,
    userSeed: "nillion-devnet",
  },
  Photon: {
    network: NamedNetwork.enum.Photon,
    cluster: "b13880d3-dde8-4a75-a171-8a1a9d985e6c",
    bootnodes: [
      "/dns/node-1.testnet-photon.nillion-network.nilogy.xyz/tcp/14211/wss/p2p/12D3KooWCfFYAb77NCjEk711e9BVe2E6mrasPZTtAjJAPtVAdbye",
    ],
    chain: "nillion-chain-testnet-1",
    endpoint: "https://testnet-nillion-rpc.lavenderfive.com",
    logging: false,
  },
};
