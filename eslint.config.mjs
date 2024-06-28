import globals from "globals";
import eslintJs from "@eslint/js";
import eslintTs from "typescript-eslint";

export default [
  {
    files: ["**/*.{mjs,ts,tsx}"],
    ignores: ["examples"],
    languageOptions: { globals: globals.browser },
  },
  eslintJs.configs.recommended,
  ...eslintTs.configs.recommended,
  {
    rules: {
      "sort-keys": "warn",
      "sort-imports": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
    },
  },
];
