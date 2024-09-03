import path from "node:path";
import { fileURLToPath } from "node:url";

import { buildJasmineBaseConfig } from "../resources/jasmine.base.config.mjs";

const __filename = fileURLToPath(import.meta.url);
const packageBaseDir = path.dirname(__filename);

export default {
  ...buildJasmineBaseConfig(packageBaseDir),
};
