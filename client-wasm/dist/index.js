import { __wbg_set_wasm } from "./index_bg.js";
const wasm = await import('./index_bg.wasm');
__wbg_set_wasm(wasm);
export * from "./index_bg.js";
