import {
  DirectSecp256k1Wallet,
  type OfflineSigner,
} from "@cosmjs/proto-signing";

import { NilChainAddressPrefix, type PrivateKeyBase16 } from "./types";

export const createSignerFromKey = async (
  key: PrivateKeyBase16 | string,
): Promise<OfflineSigner> => {
  const privateKey = new Uint8Array(key.length / 2);

  for (let i = 0, j = 0; i < key.length; i += 2, j++) {
    privateKey[j] = Number.parseInt(key.slice(i, i + 2), 16);
  }

  return await DirectSecp256k1Wallet.fromKey(privateKey, NilChainAddressPrefix);
};
