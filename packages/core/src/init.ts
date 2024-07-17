import * as Wasm from "@nillion/wasm";
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

export async function init(): Promise<void> {
  supportedEnvironmentGuard();

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  globalThis.__NILLION = globalThis.__NILLION || { initialized: false };

  if (globalThis.__NILLION.initialized) {
    Log("Init warning: Nillion init called more than once.");
    return;
  }

  await Wasm.default();

  globalThis.__NILLION.enableLogging = (overwrite = false) => {
    // It is possible that the debug key is set, if so allow the user to overwrite or preserve
    if (overwrite) {
      localStorage.debug = "";
    }
    const current = (localStorage.debug ?? "") as string;
    if (current === "") {
      localStorage.debug = "nillion:*";
    } else if (current.includes("nillion:")) {
      Log(`Logging already enabled.`);
    } else {
      localStorage.debug = "nillion:*," + current;
    }
    Log(`Logging namespaces: ${localStorage.debug as string}.`);
  };

  globalThis.__NILLION.enableWasmLogging = () => {
    Wasm.NillionClient.enable_remote_logging();
    Log("Remote logging initialised.");
  };

  globalThis.__NILLION.enableTelemetry = (addr: string) => {
    Wasm.NillionClient.enable_tracking(addr);
    Log("Telemetry reported enabled.");
  };

  globalThis.__NILLION.initialized = true;

  Log("Wasm client initialized.");
}

export const initializationGuard = (): true | never => {
  supportedEnvironmentGuard();

  if (!globalThis.window.__NILLION.initialized) {
    throw new Error("Init error: wasm accessed before initialization.");
  }

  return true;
};

export const supportedEnvironmentGuard = (): true | never => {
  if (typeof globalThis.window === "undefined") {
    const message = "Init error: Only browser environments are supported.";
    Log(message);
    throw new Error(message);
  }
  return true;
};
