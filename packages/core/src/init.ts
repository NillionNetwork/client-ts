import debug from "debug";
import initWasm from "@nillion/client-wasm";

let INIT_CALLED = false;

debug.enable("nillion:core");
const logger = debug("nillion:core");

export async function initNillion(): Promise<void> {
  if (INIT_CALLED) {
    logger("second invocation of `initNillion()` detected. noop.");
    return;
  }

  INIT_CALLED = true;
  await initWasm();
  logger("wasm client initialized");
}
