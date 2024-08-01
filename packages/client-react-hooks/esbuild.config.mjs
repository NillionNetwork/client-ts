import * as esbuild from "esbuild";

const config = {
  entryPoints: ["src/index.ts"],
  bundle: true,
  format: "esm",
  outfile: "dist/index.mjs",
  packages: "external",
  external: [],
  logLevel: "info",
  loader: { ".tsx": "tsx", ".ts": "ts" },
};

if (process.argv.includes("--watch")) {
  const ctx = await esbuild.context(config);
  await ctx.watch();
} else {
  await esbuild.build(config);
}
