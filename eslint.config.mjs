import globals from "globals";
import { fixupConfigRules } from "@eslint/compat";
import eslintJs from "@eslint/js";
import eslintTs from "typescript-eslint";
import tsDoc from "eslint-plugin-tsdoc";
import simpleImportSort from "eslint-plugin-simple-import-sort";

export default [
  {
    ignores: ["docs", "examples", "**/dist", "**/dist-test", "**/*.mjs"],
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: { globals: globals.browser },
  },
  {
    plugins: {
      tsdoc: tsDoc,
      "simple-import-sort": simpleImportSort,
    },
  },
  {
    rules: {
      "tsdoc/syntax": "warn",
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
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
