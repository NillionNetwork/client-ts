import globals from "globals";
import { fixupConfigRules } from "@eslint/compat";
import eslintJs from "@eslint/js";
import eslintTs from "typescript-eslint";
import tsDoc from "eslint-plugin-tsdoc";

export default [
  {
    ignores: ["docs", "examples", "**/dist", "**/*.mjs"],
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: { globals: globals.browser },
  },
  {
    plugins: {
      tsdoc: tsDoc,
    },
  },
  {
    rules: {
      "tsdoc/syntax": "warn",
    },
  },
  eslintJs.configs.recommended,
  ...eslintTs.configs.strictTypeChecked,
  ...eslintTs.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigDirName: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
    },
  },
];
