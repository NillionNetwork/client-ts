import { RuleConfigSeverity, type UserConfig } from "@commitlint/types";

const config: UserConfig = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "body-max-line-length": [
      RuleConfigSeverity.Disabled,
      "always",
      Number.POSITIVE_INFINITY,
    ],
  },
};

// biome-ignore lint/style/noDefaultExport: commitlint requires default export
export default config;
