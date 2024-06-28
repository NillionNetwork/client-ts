import type { Config } from "jest";

export default async (): Promise<Config> => {
  return {
    preset: "ts-jest/presets/default-esm",
    testEnvironment: "jsdom",
    globals: {
      fetch: global.fetch,
    },
  };
};
