/**
 * The wasm-pack index.js does not support multiple simultaneous target environments.
 * This index.js uses a top level await to work around that limitation. Meaning,
 * this index.js allows this bundle to be consumed in web and nodejs envs provided
 * top-level await is enabled.
 */
import { __wbg_set_wasm } from "./index_bg.js";
const wasm = await import('./index_bg.wasm');
__wbg_set_wasm(wasm);
export * from "./index_bg.js";
