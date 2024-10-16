import * as glob from "glob";
import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin";
import webpack from "webpack";

import path from "node:path";

export const buildWebpackBaseConfig = (packageBaseDir) => ({
  mode: "development",
  entry: glob.sync("tests/**/*.test.ts"),
  resolve: {
    modules: [packageBaseDir, "tests", "node_modules"],
    extensions: [".js", ".ts", ".json"],
    plugins: [new TsconfigPathsPlugin({ configFile: "./tsconfig.json" })],
    fallback: {
      crypto: false,
      buffer: false,
      stream: false,
      vm: false,
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: "ts-loader",
          options: {
            transpileOnly: true,
            compilerOptions: {
              noEmit: false,
            },
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.wasm$/,
        type: "asset/resource",
      },
    ],
  },
  plugins: [
    // defaults from $ nillion-devnet --seed test-fixture
    new webpack.EnvironmentPlugin({
      NILLION_CLUSTER_ID: "e0bbd78d-4b10-4fb0-b40a-70f895d2db43",
      NILLION_BOOTNODE_MULTIADDRESS:
        "/ip4/127.0.0.1/tcp/56033/p2p/12D3KooWNQ3aNWQ4syzxrzZvC8PA2sH3DhYCfLePog2miw16UCA9",
      NILLION_BOOTNODE_WEBSOCKET:
        "/ip4/127.0.0.1/tcp/38874/ws/p2p/12D3KooWNQ3aNWQ4syzxrzZvC8PA2sH3DhYCfLePog2miw16UCA9",
      NILLION_NILCHAIN_CHAIN_ID: "nillion-chain-devnet",
      NILLION_NILCHAIN_JSON_RPC: "http://127.0.0.1:48102",
      NILLION_NILCHAIN_REST_API: "http://localhost:26650",
      NILLION_NILCHAIN_GRPC: "localhost:26649",
      NILLION_NILCHAIN_PRIVATE_KEY_0:
        "9a975f567428d054f2bf3092812e6c42f901ce07d9711bc77ee2cd81101f42c5",
      NILLION_NILCHAIN_PRIVATE_KEY_1:
        "1e491133b9408b39572a29f91644873decea554224b20e2b0b923aeb860a1c18",
      NILLION_NILCHAIN_PRIVATE_KEY_2:
        "980488572f235316cdb330191f8bafe4e635efbe88b3a40f5bee9bd21047c059",
      NILLION_NILCHAIN_PRIVATE_KEY_3:
        "612bb5173dc60d9e91404fcc0d1f1847fb4459a7d5160d63d84e91aacbf2ab2f",
      NILLION_NILCHAIN_PRIVATE_KEY_4:
        "04f5a984eeea9dce4e5e907da69c01a61568e3071b1a91cbed89225f9fd913b5",
      NILLION_NILCHAIN_PRIVATE_KEY_5:
        "5f992c58921f4af83b4c6b650c4914626664cd02020577b0ada49cfa00d2c8a4",
      NILLION_NILCHAIN_PRIVATE_KEY_6:
        "8f0297d3bb647eb59b95b29550b2aebbedd9be2c954b000e772efe8c9318a42d",
      NILLION_NILCHAIN_PRIVATE_KEY_7:
        "c395243df9bb68dc809668efe4125f0eb017771ed8e3747b8d6860551913fecb",
      NILLION_NILCHAIN_PRIVATE_KEY_8:
        "4bb5eaa799e24ae2b48545c41331921afe7e6a8dd7a850f5fbeb20a8226664ec",
      NILLION_NILCHAIN_PRIVATE_KEY_9:
        "ef4b944d4fdb0077057925fe2dde365dfa2c83cf320463b14589feccd1b2b938",
      NILLION_USER_SEED: "test-fixture",
      NILLION_TEST_PROGRAMS_NAMESPACE: "",
    }),
  ],
  devtool: "inline-source-map",
  output: {
    filename: (pathData) =>
      pathData.chunk.name === "main" ? "test/test.js" : "src/[name].js",
    path: path.resolve(packageBaseDir, "dist-test"),
    clean: true,
  },
});
