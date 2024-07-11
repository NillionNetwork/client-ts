import path from "node:path";
import * as glob from "glob";
import CopyPlugin from "copy-webpack-plugin";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  mode: "development",
  entry: glob.sync("tests/**/*.test.ts"),
  plugins: [
    new CopyPlugin({
      patterns: [{ from: "src/fixture", to: "fixture" }],
    }),
  ],
  resolve: {
    modules: [__dirname, "spec", "helpers", "node_modules"],
    extensions: [".js", ".ts", ".json"],
    fallback: {
      crypto: false,
      buffer: false,
      stream: false,
      vm: "node:vm",
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
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
