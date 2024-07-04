import { NillionConfig } from "./configs";
import {
  NillionClient as WasmClient,
  NodeKey,
  UserKey,
} from "@nillion/client-wasm";
import {
  DirectSecp256k1Wallet,
  OfflineSigner,
  Registry,
} from "@cosmjs/proto-signing";
import {
  GasPrice,
  SigningStargateClient,
  SigningStargateClientOptions,
} from "@cosmjs/stargate";
import { MsgPayFor, typeUrl } from "./proto";
import { ChainEndpoint } from "./values";
import { NillionClient } from "./client";
import { Token } from "./token";
import { initializationGuard } from "./init";

export async function createChainClient(
  endpoint: ChainEndpoint,
  signer: OfflineSigner,
): Promise<SigningStargateClient> {
  const registry = new Registry();
  registry.register(typeUrl, MsgPayFor);

  const options: SigningStargateClientOptions = {
    gasPrice: GasPrice.fromString(Token.asUnil(0.025)),
    registry,
  };

  return await SigningStargateClient.connectWithSigner(
    endpoint,
    signer,
    options,
  );
}

export async function createChainSignerFromKey(
  key: string,
): Promise<OfflineSigner> {
  const walletKey = Uint8Array.from(
    key.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)),
  );
  return await DirectSecp256k1Wallet.fromKey(walletKey, "nillion");
}

export async function createNillionClient(
  config: NillionConfig,
  nodeKey: NodeKey,
  signer: OfflineSigner,
  userKey: UserKey,
): Promise<NillionClient> {
  initializationGuard();

  const chainClient = await createChainClient(config.chainEndpoint, signer);

  return new NillionClient({
    bootnodes: config.bootnodes,
    clients: {
      vm: new WasmClient(userKey, nodeKey, config.bootnodes),
      chain: chainClient,
    },
    chainSigner: signer,
    cluster: config.clusterId,
  });
}

export function userKeyFromSeed(value: string): UserKey {
  initializationGuard();
  return UserKey.from_seed(value);
}

export function userKeyFromBase58(value: string): UserKey {
  initializationGuard();
  return UserKey.from_base58(value);
}

export function nodeKeyFromSeed(value: string): NodeKey {
  initializationGuard();
  return NodeKey.from_seed(value);
}

export function nodeKeyFromBase58(value: string): NodeKey {
  initializationGuard();
  return NodeKey.from_base58(value);
}
