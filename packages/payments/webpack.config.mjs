import path from "node:path";
import * as glob from "glob";
import { fileURLToPath } from "node:url";
import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  mode: "development",
  entry: glob.sync("tests/**/*.test.ts"),
  resolve: {
    modules: [__dirname, "spec", "helpers", "node_modules"],
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
  output: {
    filename: (pathData) => {
      return pathData.chunk.name === "main" ? "test/test.js" : "[name].js";
    },
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
};
