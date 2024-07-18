import path from "node:path";
import proxy from "express-http-proxy";
import configFixture from "../fixture/network.json" with { type: "json" };
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(__dirname);

export default {
  port: 9191,
  srcDir: "../fixture",
  srcFiles: [],
  specDir: "dist/test",
  specFiles: ["test.js"],
  helpers: ["helpers"],
  env: {
    stopSpecOnExpectationFailure: false,
    stopOnSpecFailure: false,
    random: false,
  },
  browser: {
    name: "headlessChrome",
  },
  middleware: {
    "/": (req, res, next) => {
      res.set({
        "Access-Control-Allow-Origin": "*",
        "Cross-Origin-Embedder-Policy": "require-corp",
        "Cross-Origin-Opener-Policy": "same-origin",
      });
      next();
    },
    "/(:filename).(wasm|js)": (req, res) => {
      res.sendFile(path.resolve(__dirname, `dist/${req.baseUrl}`));
    },
    "/nilchain": proxy(configFixture.payments_rpc_endpoint),
  },
};
