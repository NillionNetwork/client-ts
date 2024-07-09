import { z } from "zod";
import {
  GasPrice,
  SigningStargateClient,
  SigningStargateClientOptions,
} from "@cosmjs/stargate";
import { MsgPayFor } from "./proto/nilchain";
import {
  DirectSecp256k1Wallet,
  OfflineSigner,
  Registry,
} from "@cosmjs/proto-signing";
import { PrivateKeyBase16, Token, Url } from "@nillion/types";
import { Keplr, Window as KeplrWindow } from "@keplr-wallet/types";
import { Log } from "./logger";

const typeUrl = "/nillion.meta.v1.MsgPayFor";
const addressPrefix = "nillion";

const ChainId = z.string().min(1).brand<"ChainId">();
type ChainId = z.infer<typeof ChainId>;

const TxHash = z.string().length(64).base64().brand<"TxHash">();
type TxHash = z.infer<typeof TxHash>;

const Address = z
  .string()
  .length(46)
  .startsWith(addressPrefix)
  .brand<"Address">();
type Address = z.infer<typeof Address>;

export const makePayment = async (
  from: Address,
  nonce: Uint8Array,
  amountInUnil: number,
  client: SigningStargateClient,
): Promise<TxHash> => {
  const value = MsgPayFor.create({
    fromAddress: from,
    resource: nonce,
    amount: [{ denom: Token.Unil, amount: String(amountInUnil) }],
  });

  const result = await client.signAndBroadcast(
    from,
    [{ typeUrl, value }],
    "auto",
  );

  return TxHash.parse(result.transactionHash);
};

export const createClient = async (
  endpoint: Url,
  signer: OfflineSigner,
): Promise<SigningStargateClient> => {
  const registry = new Registry();
  registry.register(typeUrl, MsgPayFor);

  const options: SigningStargateClientOptions = {
    gasPrice: GasPrice.fromString(Token.asUnil(0.0)),
    registry,
  };

  return await SigningStargateClient.connectWithSigner(
    endpoint,
    signer,
    options,
  );
};

// expected base16, 64 chars long
export const createSignerFromKey = async (
  key: PrivateKeyBase16,
): Promise<OfflineSigner> => {
  const privateKey = new Uint8Array(key.length / 2);

  for (let i = 0, j = 0; i < key.length; i += 2, j++) {
    privateKey[j] = parseInt(key.slice(i, i + 2), 16);
  }

  return await DirectSecp256k1Wallet.fromKey(privateKey, addressPrefix);
};

export const createClientWithDirectSecp256k1Wallet = async (args: {
  endpoint: Url;
  key: PrivateKeyBase16;
}): Promise<[SigningStargateClient, Address]> => {
  const { endpoint, key } = args;
  const signer = await createSignerFromKey(key);
  const accounts = await signer.getAccounts();
  const address = Address.parse(accounts[0].address);

  const client = await createClient(endpoint, signer);
  return [client, address];
};

export const createClientWithKeplrWallet = async (args: {
  chainId: ChainId;
  endpoint: Url;
}): Promise<[SigningStargateClient, Address]> => {
  if (!window.keplr) {
    Log.log("failed to access window.keplr");
    return Promise.reject("failed to access window.keplr");
  } else {
    const { keplr } = window;
    const { chainId, endpoint } = args;

    await keplr.enable(chainId);
    const signer = keplr.getOfflineSigner(chainId);
    const accounts = await signer.getAccounts();
    // keplr only manages one pub/priv keypair, ref: https://docs.keplr.app/api/
    const address = Address.parse(accounts[0].address);

    const client = await createClient(endpoint, signer);
    return [client, address];
  }
};

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
