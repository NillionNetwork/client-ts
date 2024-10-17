import { main } from "../resources/esbuild.base.config.mjs";

const config = {
  bundle: true,
  entryPoints: ["src/index.ts"],
  format: "esm",
  logLevel: "info",
  outfile: "dist/index.mjs",
  packages: "external",
};

await main(config);
