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
    new webpack.EnvironmentPlugin([
      "NILLION_BOOTNODE_WEBSOCKET",
      "NILLION_CLUSTER_ID",
      "NILLION_NILCHAIN_CHAIN_ID",
      "NILLION_NILCHAIN_JSON_RPC",
      "NILLION_NILCHAIN_PRIVATE_KEY_0",
      "NILLION_USER_SEED",
      "NILLION_TEST_PROGRAMS_NAMESPACE",
    ]),
  ],
  devtool: "inline-source-map",
  output: {
    filename: (pathData) =>
      pathData.chunk.name === "main" ? "test/test.js" : "src/[name].js",
    path: path.resolve(packageBaseDir, "dist-test"),
    clean: true,
  },
});
