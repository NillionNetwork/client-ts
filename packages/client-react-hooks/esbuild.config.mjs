import * as esbuild from "esbuild";
import browserslist from "browserslist";
import {
  esbuildPluginBrowserslist,
  resolveToEsbuildTarget,
} from "esbuild-plugin-browserslist";

const target = resolveToEsbuildTarget(browserslist("defaults"), {
  printUnknownTargets: false,
});

const config = {
  bundle: true,
  entryPoints: ["src/index.ts"],
  external: [],
  format: "esm",
  loader: { ".tsx": "tsx", ".ts": "ts" },
  logLevel: "info",
  outfile: "dist/index.mjs",
  packages: "external",
  target,
};

if (process.argv.includes("--watch")) {
  const ctx = await esbuild.context(config);
  await ctx.watch();
} else {
  await esbuild.build(config);
}
