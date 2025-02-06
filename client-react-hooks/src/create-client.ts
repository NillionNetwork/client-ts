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
  config?: TestnetConfig;
};

export type TestnetConfig = {
  bootnodeUrl: string;
  chainUrl: string;
  chainId: string;
};

const TestnetDefaultConfig: TestnetConfig = {
  bootnodeUrl:
    "https://node-1.nilvm-testnet-1.nillion-network.testnet.nillion.network:14311",
  chainUrl: "http://rpc.testnet.nilchain-rpc-proxy.nilogy.xyz",
  chainId: "nillion-chain-testnet-1",
};

export type DevnetOptions = {
  network: "devnet";
  seed?: string;
  signer?: Keplr | OfflineSigner;
  paymentMode?: PaymentMode;
  config?: DevnetConfig;
};

export type DevnetConfig = {
  bootnodeUrl: string;
  chainUrl: string;
  chainId: string;
  seed: string;
  nilchainPrivateKey0: string;
};

const DevnetDefaultConfig: DevnetConfig = {
  bootnodeUrl: "http://127.0.0.1:43207",
  chainUrl: "http://127.0.0.1:48102",
  chainId: "nillion-chain-devnet",
  seed: "user-devnet-seed",
  nilchainPrivateKey0:
    "9a975f567428d054f2bf3092812e6c42f901ce07d9711bc77ee2cd81101f42c5",
};

type Options = DevnetOptions | TestnetOptions;

export async function createClient(options: Options) {
  const builder = new VmClientBuilder(options.paymentMode);
  switch (options.network.toLowerCase()) {
    case "devnet": {
      const network = options as DevnetOptions;
      let config = DevnetDefaultConfig;
      if (network.config !== undefined) {
        config = network.config;
      }

      let signer: OfflineSigner;

      if (network.signer) {
        if ("getOfflineSigner" in network.signer) {
          signer = network.signer.getOfflineSigner(config.chainId);
        } else {
          signer = network.signer;
        }
      } else {
        signer = await createSignerFromKey(config.nilchainPrivateKey0);
      }

      const seed = network.seed ? network.seed : config.seed;

      builder
        .seed(seed)
        .bootnodeUrl(config.bootnodeUrl)
        .chainUrl(config.chainUrl)
        .signer(signer);

      break;
    }
    case "testnet": {
      const network = options as TestnetOptions;
      let config = TestnetDefaultConfig;
      if (network.config !== undefined) {
        config = network.config;
      }

      const signer = network.keplr.getOfflineSigner(config.chainId);

      builder
        .seed(network.seed)
        .bootnodeUrl(config.bootnodeUrl)
        .chainUrl(config.chainUrl)
        .signer(signer);

      break;
    }
    default: {
      throw new Error(`Unknown network: ${options.network}`);
    }
  }

  return builder.build();
}
