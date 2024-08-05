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
  external: ["crypto", "@nillion/client-core"],
  format: "esm",
  logLevel: "info",
  outfile: "dist/index.mjs",
  target,
};

if (process.argv.includes("--watch")) {
  const ctx = await esbuild.context(config);
  await ctx.watch();
} else {
  await esbuild.build(config);
}
