import { z } from "zod";
import {
  ChainId,
  ClusterId,
  Multiaddr,
  NetworkName,
  Url,
} from "@nillion/types";

export const ConfigSchema = z.object({
  chainEndpoint: Url,
  chainId: ChainId,
  clusterId: ClusterId,
  bootnodes: z.array(Multiaddr),
});

export type Config = z.infer<typeof ConfigSchema>;

export type ConfigType = {
  [K in NetworkName]: ReturnType<typeof ConfigSchema.parse>;
};

export const Config: ConfigType = {
  [NetworkName.enum.Devnet]: ConfigSchema.parse({
    chainEndpoint: Url.parse("http://127.0.0.1:48102"),
    chainId: "nillion-chain-testnet",
    clusterId: "9e68173f-9c23-4acc-ba81-4f079b639964",
    bootnodes: [
      "/ip4/127.0.0.1/tcp/54936/ws/p2p/12D3KooWMvw1hEqm7EWSDEyqTb6pNetUVkepahKY6hixuAuMZfJS",
    ],
  }),
  [NetworkName.enum.Gluon]: ConfigSchema.parse({
    chainEndpoint: Url.parse("http://localhost:8080/nilchain"),
    chainId: "nillion-chain-testnet-1",
    clusterId: "3272dd62-b126-466e-92f2-69fcc2c62ab6",
    bootnodes: [
      "/dns/node-1.testnet-nucleus.nillion-network.nilogy.xyz/tcp/14211/wss/p2p/12D3KooWFH5doiPHBJa8cgx7B2zzD7z7DbyKzRJPmsTZFHFT5zyc",
    ],
  }),
};
