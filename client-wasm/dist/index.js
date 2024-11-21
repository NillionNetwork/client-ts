/**
 * The wasm-pack's generated index.js does not support multiple (simultaneous) target environments.
 * This index.js uses a top level await to work around that limitation, so  provided top-level
 * await is enabled, this bundle can be used in web and nodejs envs.
 */
import { __wbg_set_wasm } from "./index_bg.js";
const wasm = await import('./index_bg.wasm');
__wbg_set_wasm(wasm);
export * from "./index_bg.js";
