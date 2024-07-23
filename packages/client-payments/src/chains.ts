import { PartialConfig } from "@nillion/client-core";

const Devnet = {
  chainName: "Devnet",
  chainId: PartialConfig.Devnet.chain,
  rpc: PartialConfig.Devnet.endpoint,
  rest: PartialConfig.Devnet.endpoint,
  bip44: { coinType: 118 },
  bech32Config: {
    bech32PrefixAccAddr: "nillion",
    bech32PrefixAccPub: "nillionpub",
    bech32PrefixValAddr: "nillionvaloper",
    bech32PrefixValPub: "nillionvaloperpub",
    bech32PrefixConsAddr: "nillionvalcons",
    bech32PrefixConsPub: "nillionvalconspub",
  },
  currencies: [
    {
      coinDenom: "NIL",
      coinMinimalDenom: "unil",
      coinDecimals: 6,
      coinGeckoId: "nillion",
    },
  ],
  feeCurrencies: [
    {
      coinDenom: "NIL",
      coinMinimalDenom: "unil",
      coinDecimals: 6,
      coinGeckoId: "nillion",
      gasPriceStep: {
        low: 0.001,
        average: 0.001,
        high: 0.01,
      },
    },
  ],
  stakeCurrency: {
    coinDenom: "NIL",
    coinMinimalDenom: "unil",
    coinDecimals: 6,
    coinGeckoId: "nillion",
  },
};

export const ChainConfig = {
  Devnet,
};
