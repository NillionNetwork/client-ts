import initWasm from "@nillion/client-wasm";
import { Log } from "./logger";

export interface NillionGlobal {
  initialized: boolean;
}

declare global {
  // eslint-disable-next-line no-var
  var __NILLION: NillionGlobal;
}

globalThis.__NILLION = globalThis.__NILLION || { initialized: false };

export function initializationGuard(): void | never {
  if (!globalThis.__NILLION.initialized) {
    throw new Error("wasm type accessed before initialization");
  }
}

export async function initializeNillion(): Promise<void> {
  if (globalThis.__NILLION.initialized) {
    Log("nillion init called more than once, ignoring subsequent calls");
    return;
  }

  globalThis.__NILLION.initialized = true;
  await initWasm();
  Log("wasm client initialized");
}
