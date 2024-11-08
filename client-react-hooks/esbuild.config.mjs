// @ts-check

import browserslist from "browserslist";
import esbuild from "esbuild";
import { resolveToEsbuildTarget } from "esbuild-plugin-browserslist";

/** @type {esbuild.BuildOptions} */
const config = {
  bundle: true,
  entryPoints: ["src/index.ts"],
  format: "esm",
  loader: { ".tsx": "tsx", ".ts": "ts" },
  logLevel: "info",
  outfile: "dist/index.mjs",
  packages: "external",
  target: resolveToEsbuildTarget(browserslist("defaults"), {
    printUnknownTargets: false,
  }),
};

if (process.argv.includes("--watch")) {
  const ctx = await esbuild.context(config);
  await ctx.watch();
} else {
  await esbuild.build(config);
}
