import browserslist from "browserslist";
import esbuild from "esbuild";
import { resolveToEsbuildTarget } from "esbuild-plugin-browserslist";

const config = {
  bundle: true,
  entryPoints: ["src/index.ts"],
  format: "esm",
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
