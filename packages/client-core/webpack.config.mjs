import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildWebpackBaseConfig } from "../resources/webpack.base.config.mjs";

const __filename = fileURLToPath(import.meta.url);
const packageBaseDir = path.dirname(__filename);

export default {
  ...buildWebpackBaseConfig(packageBaseDir),
};
