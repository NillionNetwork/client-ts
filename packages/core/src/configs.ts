export interface NillionConfig {
  chain: {
    endpoint: string;
    keys: string[];
  };
  user: {
    userSeed: string;
    nodeSeed: string;
  };
  vm: {
    clusterId: string;
    bootnodes: string[];
  };
}

// ie nillion-devnet --seed nillion-devnet
const devnet: NillionConfig = {
  chain: {
    endpoint: "http://127.0.0.1:48102",
    keys: ["9a975f567428d054f2bf3092812e6c42f901ce07d9711bc77ee2cd81101f42c5"],
  },
  user: {
    nodeSeed: "nillion-devnet",
    userSeed: "nillion-devnet",
  },
  vm: {
    bootnodes: [
      "/ip4/127.0.0.1/tcp/54936/ws/p2p/12D3KooWMvw1hEqm7EWSDEyqTb6pNetUVkepahKY6hixuAuMZfJS",
    ],
    clusterId: "9e68173f-9c23-4acc-ba81-4f079b639964",
  },
};

const testnet: NillionConfig = {
  chain: {
    endpoint: "http://localhost:8080/nilchain",
    keys: ["08f550de8729709b4fc0c8a0db264c3bb050313ef01e3a4f76421147de997702"],
    // keys: JSON.parse(process.env.KEY!),
  },
  user: {
    nodeSeed: "nillion-devnet",
    userSeed: "nillion-devnet",
  },
  vm: {
    bootnodes: [
      "/dns/node-1.testnet-nucleus.nillion-network.nilogy.xyz/tcp/14211/wss/p2p/12D3KooWFH5doiPHBJa8cgx7B2zzD7z7DbyKzRJPmsTZFHFT5zyc",
    ],
    clusterId: "3272dd62-b126-466e-92f2-69fcc2c62ab6",
  },
};

const petnet: NillionConfig = {
  chain: {
    endpoint: "",
    keys: [""],
  },
  user: {
    nodeSeed: "",
    userSeed: "",
  },
  vm: {
    bootnodes: [""],
    clusterId: "",
  },
};

const tests: NillionConfig = {
  chain: {
    endpoint: "http://localhost:9191/nilchain",
    keys: ["5c98e049ceca4e2c342516e1b81c689e779da9dbae64ea6b92d52684a92095e6"],
  },
  user: {
    nodeSeed: "test",
    userSeed: "test",
  },
  vm: {
    bootnodes: [
      "/ip4/127.0.0.1/tcp/14211/ws/p2p/12D3KooWCAGu6gqDrkDWWcFnjsT9Y8rUzUH8buWjdFcU3TfWRmuN",
    ],
    clusterId: "e2c959ca-ecb2-45b0-8f2b-d91abbfa3708",
  },
};

export const configs = { devnet, petnet, testnet, tests };
