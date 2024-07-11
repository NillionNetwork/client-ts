import * as Wasm from "@nillion/client-wasm";
import { Log } from "./logger";

export interface NillionGlobal {
  initialized: boolean;
  enableLogging: (overwrite: boolean) => void;
  enableWasmLogging: () => void;
  enableTelemetry: (addr: string) => void;
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

  await Wasm.default();

  globalThis.__NILLION.enableLogging = (overwrite: boolean = false) => {
    // It is possible that the debug key is set, if so allow the user to overwrite or preserve
    if (overwrite) {
      localStorage.debug = "";
    }
    const current: string = localStorage.debug ?? "";
    if (current === "") {
      localStorage.debug = "nillion:*";
    } else if (current.indexOf("nillion:") != -1) {
      Log(`logging already enabled`);
    } else {
      localStorage.debug = "nillion:*," + current;
    }
    Log(`logging namespaces: ${localStorage.debug}`);
  };

  globalThis.__NILLION.enableWasmLogging = () => {
    Wasm.NillionClient.enable_remote_logging();
    Log("remote logging initialised");
  };

  globalThis.__NILLION.enableTelemetry = (addr: string) => {
    Wasm.NillionClient.enable_tracking(addr);
    Log("telemetry reported enabled");
  };

  globalThis.__NILLION.initialized = true;

  Log("wasm client initialized");
}
