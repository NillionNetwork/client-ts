import "dotenv/config";

import { type JestConfigWithTsJest } from "ts-jest";

const config: JestConfigWithTsJest = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  testTimeout: 30000,
  transform: {
    "^.+\\.(ts|tsx|js|jsx|mjs)$": [
      "ts-jest",
      {
        useESM: true,
      },
    ],
  },
  moduleNameMapper: {
    "^@nillion/client-vms/(.*)$": "<rootDir>/src/$1",
    "^@nillion/client-wasm": "<rootDir>/../client-wasm/dist",
  },
};

export default config;
