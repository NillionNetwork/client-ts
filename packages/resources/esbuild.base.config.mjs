import * as esbuild from "esbuild";
import browserslist from "browserslist";
import {
  esbuildPluginBrowserslist,
  resolveToEsbuildTarget,
} from "esbuild-plugin-browserslist";

export const main = async (config) => {
  if (!config.target) {
    config.target = resolveToEsbuildTarget(browserslist("defaults"), {
      printUnknownTargets: false,
    });
  }

  if (process.argv.includes("--watch")) {
    const ctx = await esbuild.context(config);
    await ctx.watch();
  } else {
    await esbuild.build(config);
  }
};
