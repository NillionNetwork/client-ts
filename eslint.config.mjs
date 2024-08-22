import js from "@eslint/js";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import tsDoc from "eslint-plugin-tsdoc";
import globals from "globals";
import ts from "typescript-eslint";

export default [
  {
    ignores: ["docs", "examples", "**/dist", "**/dist-test"],
  },
  js.configs.recommended,
  ...ts.configs.recommended,
  ...ts.configs.strictTypeChecked,
  ...ts.configs.stylisticTypeChecked,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        project: true,
        tsconfigDirName: import.meta.dirname,
      },
    },
    plugins: {
      "@typescript-eslint": ts.plugin,
    },
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
      "@typescript-eslint/restrict-template-expressions": [
        "off",
        {
          allowNullish: true,
          allowNumber: true,
          allowBoolean: true,
          allowAny: true,
        },
      ],
    },
  },
  {
    files: ["**/*.js", "**/*.mjs"],
    ...ts.configs.disableTypeChecked,
  },
  {
    files: ["**/*.mjs"],
    languageOptions: {
      globals: {
        ...globals.node,
        process: "readonly",
      },
    },
  },
  {
    files: ["**/*.{js,jsx,ts,tsx,mjs}"],
    plugins: {
      tsdoc: tsDoc,
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      "tsdoc/syntax": "warn",
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
    },
  },
  {
    files: ["**/*.test.ts", "packages/test-utils/**/*.ts"],
    rules: {
      "@typescript-eslint/no-non-null-assertion": "off",
    },
  },
];
