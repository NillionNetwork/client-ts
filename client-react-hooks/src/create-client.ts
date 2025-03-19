import type { OfflineSigner } from "@cosmjs/proto-signing";
import type { Keplr } from "@keplr-wallet/types";
import { type VmClient, VmClientBuilder } from "@nillion/client-vms";
import { createSignerFromKey } from "@nillion/client-vms";
import type { PaymentMode } from "@nillion/client-vms";

const DEFAULT_TESTNET_BOOTNODE_URL =
  "https://node-1.nilvm-testnet-1.nillion-network.testnet.nillion.network:14311";
const DEFAULT_TESTNET_CHAIN_URL =
  "https://rpc.testnet.nilchain-rpc-proxy.nilogy.xyz";
const DEFAULT_TESTNET_CHAIN_ID = "nillion-chain-testnet-1";

const DEFAULT_DEVNET_BOOTNODE_URL = "http://127.0.0.1:43207";
const DEFAULT_DEVNET_CHAIN_URL = "http://127.0.0.1:48102";
const DEFAULT_DEVNET_CHAIN_ID = "nillion-chain-devnet";
const DEFAULT_PRIVATE_KEY =
  "9a975f567428d054f2bf3092812e6c42f901ce07d9711bc77ee2cd81101f42c5";

enum NetworkType {
  Testnet = 0,
  Devnet = 1,
}

export type TestnetConfig = {
  type: NetworkType;
  keplr: Keplr;
};

export type DevnetConfig = {
  type: NetworkType;
  privateKey: string;
  signer?: Keplr | OfflineSigner;
};

type NetworkConfig = DevnetConfig | TestnetConfig;

export class ClientBuilder {
  private _config: NetworkConfig;
  private _seed: string;
  private _bootnodeUrl: string;
  private _chainUrl: string;
  private _chainId: string;
  private _paymentMode?: PaymentMode;

  private constructor(
    config: NetworkConfig,
    seed: string,
    bootnodeUrl: string,
    chainUrl: string,
    chainId: string,
    paymentMode?: PaymentMode,
  ) {
    this._config = config;
    this._seed = seed;
    this._bootnodeUrl = bootnodeUrl;
    this._chainUrl = chainUrl;
    this._chainId = chainId;
    this._paymentMode = paymentMode;
  }

  static testnet(seed: string, keplr: Keplr): ClientBuilder {
    return new ClientBuilder(
      { type: NetworkType.Testnet, keplr },
      seed,
      DEFAULT_TESTNET_BOOTNODE_URL,
      DEFAULT_TESTNET_CHAIN_URL,
      DEFAULT_TESTNET_CHAIN_ID,
    );
  }

  static devnet(
    seed: string,
    privateKey?: string,
    signer?: Keplr | OfflineSigner,
  ): ClientBuilder {
    return new ClientBuilder(
      {
        type: NetworkType.Devnet,
        privateKey: privateKey ? privateKey : DEFAULT_PRIVATE_KEY,
        signer,
      },
      seed,
      DEFAULT_DEVNET_BOOTNODE_URL,
      DEFAULT_DEVNET_CHAIN_URL,
      DEFAULT_DEVNET_CHAIN_ID,
    );
  }

  bootnodeUrl(bootnodeUrl: string): this {
    this._bootnodeUrl = bootnodeUrl;
    return this;
  }

  chainUrl(chainUrl: string): this {
    this._chainUrl = chainUrl;
    return this;
  }

  chainId(chainId: string): this {
    this._chainId = chainId;
    return this;
  }

  paymentMode(paymentMode: PaymentMode): this {
    this._paymentMode = paymentMode;
    return this;
  }

  async build(): Promise<VmClient> {
    const builder = new VmClientBuilder(this._paymentMode)
      .seed(this._seed)
      .bootnodeUrl(this._bootnodeUrl)
      .chainUrl(this._chainUrl);

    switch (this._config.type) {
      case NetworkType.Devnet: {
        const config = this._config as DevnetConfig;
        let signer: OfflineSigner;
        if (config.signer) {
          if ("getOfflineSigner" in config.signer) {
            signer = config.signer.getOfflineSigner(this._chainId);
          } else {
            signer = config.signer;
          }
        } else {
          signer = await createSignerFromKey(config.privateKey);
        }
        builder.signer(signer);
        break;
      }

      case NetworkType.Testnet: {
        const config = this._config as TestnetConfig;
        const signer = config.keplr.getOfflineSigner(this._chainId);
        builder.signer(signer);
        break;
      }

      default: {
        throw new Error("Unknown network");
      }
    }
    return builder.build();
  }
}
