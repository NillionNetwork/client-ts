import path from "node:path";
import proxy from "express-http-proxy";
import config from "./src/fixture/local.json" with { type: "json" };
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  port: 9191,
  srcDir: "src",
  srcFiles: [],
  specDir: "dist/spec",
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
    "/nilchain": proxy(config.payments_rpc_endpoint),
  },
};
