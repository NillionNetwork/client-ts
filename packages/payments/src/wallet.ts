import { Window as KeplrWindow, Keplr } from "@keplr-wallet/types";

declare global {
  interface Window extends KeplrWindow {}
}

export const getKeplr = async (): Promise<Keplr | undefined> => {
  if (window.keplr) {
    return window.keplr;
  }

  if (document.readyState === "complete") {
    return window.keplr;
  }

  return new Promise((resolve) => {
    const documentStateChange = (event: Event) => {
      if (
        event.target &&
        (event.target as Document).readyState === "complete"
      ) {
        resolve(window.keplr);
        document.removeEventListener("readystatechange", documentStateChange);
      }
    };

    document.addEventListener("readystatechange", documentStateChange);
  });
};
import { DirectSecp256k1Wallet, OfflineSigner } from "@cosmjs/proto-signing";
import {
  ChainId,
  NilChainAddressPrefix,
  PrivateKeyBase16,
  Url,
} from "@nillion/types";
import { Log } from "./logger";
import { NilChainPaymentClient } from "./client";

// expected base16, 64 chars long
export const createSignerFromKey = async (
  key: PrivateKeyBase16,
): Promise<OfflineSigner> => {
  const privateKey = new Uint8Array(key.length / 2);

  for (let i = 0, j = 0; i < key.length; i += 2, j++) {
    privateKey[j] = parseInt(key.slice(i, i + 2), 16);
  }

  return await DirectSecp256k1Wallet.fromKey(privateKey, NilChainAddressPrefix);
};

export const createClientWithDirectSecp256k1Wallet = async (args: {
  endpoint: Url;
  key: PrivateKeyBase16;
}): Promise<NilChainPaymentClient> => {
  const { endpoint, key } = args;
  const signer = await createSignerFromKey(key);
  return await NilChainPaymentClient.create(endpoint, signer);
};

export const createClientWithKeplrWallet = async (args: {
  chainId: ChainId;
  endpoint: Url;
}): Promise<NilChainPaymentClient> => {
  if (!window.keplr) {
    Log.log("failed to access window.keplr");
    return Promise.reject("failed to access window.keplr");
  } else {
    const { keplr } = window;
    const { chainId, endpoint } = args;
    await keplr.enable(chainId);
    const signer = keplr.getOfflineSigner(chainId);
    return await NilChainPaymentClient.create(endpoint, signer);
  }
};