import { defineConfig, loadEnv } from "vite";
import wasm from "vite-plugin-wasm";
import tsconfigPaths from "vite-tsconfig-paths";

// biome-ignore lint: lib requires default export
export default defineConfig(({ mode }) => ({
  plugins: [tsconfigPaths(), wasm()],
  test: {
    testTimeout: 0,
    env: loadEnv(mode, process.cwd(), ""),
    coverage: {
      reporter: ["text", "json-summary", "json"],
      reportOnFailure: true,
    },
  },
}));
