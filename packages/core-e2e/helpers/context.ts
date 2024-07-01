import {
  MsgPayFor,
  NillionClient,
  NillionConfig,
  configs,
  typeUrl,
} from "@nillion/core";
import {
  GasPrice,
  SigningStargateClient,
  SigningStargateClientOptions,
} from "@cosmjs/stargate";
import { DirectSecp256k1Wallet, Registry } from "@cosmjs/proto-signing";

export interface Context {
  config: NillionConfig;
  vm: {
    client: NillionClient;
  };
  chain: {
    client: SigningStargateClient;
    wallet: DirectSecp256k1Wallet;
  };
  test1: any;
}

export const loadFixtureContext = async (): Promise<Context> => {
  await NillionClient.init();

  const config = configs.tests;
  const nilVmClient = NillionClient.fromConfig(config);

  const walletKey = Uint8Array.from(
    config.chain.keys[0].match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)),
  );
  const nilChainWallet = await DirectSecp256k1Wallet.fromKey(
    walletKey,
    "nillion",
  );

  const registry = new Registry();
  registry.register(typeUrl, MsgPayFor);

  const options: SigningStargateClientOptions = {
    gasPrice: GasPrice.fromString("0.025unil"),
    registry,
  };

  const nilChainClient = await SigningStargateClient.connectWithSigner(
    config.chain.endpoint,
    nilChainWallet,
    options,
  );

  return {
    chain: {
      client: nilChainClient,
      wallet: nilChainWallet,
    },
    config,
    test1: {
      expected_party_id: "12D3KooWGofQ8ah2De4HW559FcER1fwckUnufS6288iCYcNcKwGK",
      input: "this is a test",
      program_id:
        "2j7jTVKsMezNLJV5ijcQEsNcMEKxEt4ERyAaDj1LdquDStrhukfvCyzBBvfDeiNGfittcAs4mD3KrChLN7SsY35Z/simple",
    },
    vm: {
      client: nilVmClient,
    },
  };
};
