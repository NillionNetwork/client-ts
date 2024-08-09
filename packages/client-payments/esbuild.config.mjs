import { main } from "../resources/esbuild.base.config.mjs";

const config = {
  bundle: true,
  entryPoints: ["src/index.ts"],
  external: ["crypto", "@nillion/client-core"],
  format: "esm",
  logLevel: "info",
  outfile: "dist/index.mjs",
};

await main(config);
