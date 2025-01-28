import type { OfflineSigner } from "@cosmjs/proto-signing";
import type { Keplr } from "@keplr-wallet/types";
import { VmClientBuilder } from "@nillion/client-vms";
import { createSignerFromKey } from "@nillion/client-vms";
import type { PaymentMode } from "@nillion/client-vms";

export type TestnetOptions = {
  network: "testnet";
  seed: string;
  keplr: Keplr;
  paymentMode?: PaymentMode;
};

export type DevnetOptions = {
  network: "devnet";
  bootnodeUrl?: string;
  seed?: string;
  signer?: Keplr | OfflineSigner;
  paymentMode?: PaymentMode;
};

type Options = DevnetOptions | TestnetOptions;

const DevnetConfig = {
  bootnodeUrl: "http://127.0.0.1:43207",
  chainUrl: "http://127.0.0.1:48102",
  chainId: "nillion-chain-devnet",
  seed: "user-devnet-seed",
  nilchainPrivateKey0:
    "9a975f567428d054f2bf3092812e6c42f901ce07d9711bc77ee2cd81101f42c5",
};

const TestnetConfig = {
  bootnodeUrl: "https://node-1.photon2.nillion-network.nilogy.xyz:14311/",
  chainUrl: "http://rpc.testnet.nilchain-rpc-proxy.nilogy.xyz",
  chainId: "nillion-chain-testnet-1",
};

export async function createClient(options: Options) {
  const builder = new VmClientBuilder(options.paymentMode);
  switch (options.network.toLowerCase()) {
    case "devnet": {
      const config = options as DevnetOptions;

      let signer: OfflineSigner;

      if (config.signer) {
        if ("getOfflineSigner" in config.signer) {
          signer = config.signer.getOfflineSigner(DevnetConfig.chainId);
        } else {
          signer = config.signer;
        }
      } else {
        signer = await createSignerFromKey(DevnetConfig.nilchainPrivateKey0);
      }

      const seed = config.seed ? config.seed : DevnetConfig.seed;
      const bootnodeUrl = config.bootnodeUrl ? config.bootnodeUrl : DevnetConfig.bootnodeUrl;
      builder
        .seed(seed)
        .bootnodeUrl(bootnodeUrl)
        .chainUrl(DevnetConfig.chainUrl)
        .signer(signer);

      break;
    }
    case "testnet": {
      const config = options as TestnetOptions;
      const signer = config.keplr.getOfflineSigner(TestnetConfig.chainId);

      builder
        .seed(config.seed)
        .bootnodeUrl(TestnetConfig.bootnodeUrl)
        .chainUrl(TestnetConfig.chainUrl)
        .signer(signer);

      break;
    }
    default: {
      throw new Error(`Unknown network: ${options.network}`);
    }
  }

  return builder.build();
}
