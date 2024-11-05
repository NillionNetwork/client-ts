import {
  DirectSecp256k1Wallet,
  type OfflineSigner,
} from "@cosmjs/proto-signing";
import type { Keplr, Window as KeplrWindow } from "@keplr-wallet/types";

import { NilChainAddressPrefix, type PrivateKeyBase16 } from "./types";

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

export const createSignerFromKey = async (
  key: PrivateKeyBase16 | string,
): Promise<OfflineSigner> => {
  const privateKey = new Uint8Array(key.length / 2);

  for (let i = 0, j = 0; i < key.length; i += 2, j++) {
    privateKey[j] = Number.parseInt(key.slice(i, i + 2), 16);
  }

  return await DirectSecp256k1Wallet.fromKey(privateKey, NilChainAddressPrefix);
};
