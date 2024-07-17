import globals from "globals";
import eslintJs from "@eslint/js";
import eslintTs from "typescript-eslint";

export default [
  {
    ignores: ["examples", "**/dist", "packages/react-hooks", "**/*.mjs"],
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: { globals: globals.browser },
  },
  eslintJs.configs.recommended,
  ...eslintTs.configs.recommendedTypeChecked,
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
