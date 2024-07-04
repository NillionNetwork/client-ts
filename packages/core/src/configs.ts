import { z } from "zod";
import { ChainEndpoint, ChainId, ClusterId, Multiaddr } from "./values";

export enum NetworkName {
  Devnet = "devnet",
  Testnet = "testnet",
  LocalTestnet = "localtestnet",
}

export const NillionConfigSchema = z.object({
  chainEndpoint: ChainEndpoint,
  chainId: ChainId,
  clusterId: ClusterId,
  bootnodes: z.array(Multiaddr),
});

export type NillionConfig = z.infer<typeof NillionConfigSchema>;

export const NillionConfig: Map<NetworkName, NillionConfig> = new Map([
  [
    NetworkName.Devnet,
    NillionConfigSchema.parse({
      chainEndpoint: "http://127.0.0.1:48102",
      chainId: "nillion-chain-testnet",
      clusterId: "9e68173f-9c23-4acc-ba81-4f079b639964",
      bootnodes: [
        "/ip4/127.0.0.1/tcp/54936/ws/p2p/12D3KooWMvw1hEqm7EWSDEyqTb6pNetUVkepahKY6hixuAuMZfJS",
      ],
    }),
  ],
  [
    NetworkName.Testnet,
    NillionConfigSchema.parse({
      chainEndpoint: "http://localhost:8080/nilchain",
      chainId: "nillion-chain-testnet-1",
      clusterId: "3272dd62-b126-466e-92f2-69fcc2c62ab6",
      bootnodes: [
        "/dns/node-1.testnet-nucleus.nillion-network.nilogy.xyz/tcp/14211/wss/p2p/12D3KooWFH5doiPHBJa8cgx7B2zzD7z7DbyKzRJPmsTZFHFT5zyc",
      ],
    }),
  ],
  [
    NetworkName.LocalTestnet,
    NillionConfigSchema.parse({
      chainEndpoint: "http://localhost:9191/nilchain",
      chainId: "nillion-chain-devnet",
      clusterId: "e2c959ca-ecb2-45b0-8f2b-d91abbfa3708",
      bootnodes: [
        "/ip4/127.0.0.1/tcp/14211/ws/p2p/12D3KooWCAGu6gqDrkDWWcFnjsT9Y8rUzUH8buWjdFcU3TfWRmuN",
      ],
    }),
  ],
]);
