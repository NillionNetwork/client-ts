import {
  PrivateKeyBase16,
  VmClientBuilder,
  createSignerFromKey,
} from "@nillion/client-vms";
import { z } from "zod";

export type Network = "testnet" | "devnet" | "custom";

export const ClientConfig = z.object({
  bootnodeUrl: z.string().url(),
  chainUrl: z.string().url(),
  seed: z.string().min(1),
  nilchainPrivateKey0: PrivateKeyBase16,
});
export type ClientConfig = z.infer<typeof ClientConfig>;

const NamedConfig = {
  // use with `$ nillion-devnet` default seed
  devnet: {
    bootnodeUrl: "http://127.0.0.1:37939",
    chainUrl: "http://127.0.0.1:48102",
    seed: "user-devnet-seed",
    nilchainPrivateKey0:
      "9a975f567428d054f2bf3092812e6c42f901ce07d9711bc77ee2cd81101f42c5",
  },
};

export async function createClient(
  network: Network,
  overrides?: Partial<ClientConfig>,
) {
  const builder = new VmClientBuilder();
  switch (network.toLowerCase()) {
    case "devnet": {
      const config = { ...NamedConfig.devnet };
      const singer = await createSignerFromKey(config.nilchainPrivateKey0);
      builder
        .seed(config.seed)
        .bootnodeUrl(config.bootnodeUrl)
        .chainUrl(config.chainUrl)
        .signer(singer);
      break;
    }
    case "custom": {
      const { nilchainPrivateKey0, seed, bootnodeUrl, chainUrl } =
        ClientConfig.parse(overrides);

      if (!nilchainPrivateKey0 || !seed || !bootnodeUrl || !chainUrl) {
        throw new Error("Missing required config");
      }

      const singer = await createSignerFromKey(nilchainPrivateKey0);
      builder
        .seed(seed)
        .bootnodeUrl(bootnodeUrl)
        .chainUrl(chainUrl)
        .signer(singer);
      break;
    }
    default: {
      throw new Error(`Unsupported network: ${network}`);
    }
  }

  return builder.build();
}
