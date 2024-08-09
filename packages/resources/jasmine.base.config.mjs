import path from "node:path";
import proxy from "express-http-proxy";

export const buildJasmineBaseConfig = (packageBaseDir) => ({
  port: 9191,
  srcDir: "src",
  srcFiles: [],
  specDir: "dist-test/test",
  specFiles: ["test.js"],
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
    "/__resources__/programs/dist/:filename": (req, res) => {
      const filePath = path.resolve(
        packageBaseDir,
        `../resources/programs/dist/${req.params.filename}`,
      );
      res.sendFile(filePath);
    },
    "/(:filename).(wasm|js)": (req, res) => {
      const filePath = path.resolve(packageBaseDir, `dist-test/${req.baseUrl}`);
      res.sendFile(filePath);
    },
    "/nilchain": proxy("http://localhost:48102"),
  },
});
