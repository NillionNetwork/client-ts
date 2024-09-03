import * as Wasm from "@nillion/client-wasm";

import { Log } from "./logger";

declare global {
  interface Window {
    __NILLION: NillionGlobal | undefined;
  }

  // eslint-disable-next-line no-var
  var __NILLION: NillionGlobal | undefined;
}

export interface NillionGlobal {
  initialized: boolean;
  disableLogging: () => void;
  enableLogging: () => void;
  enableWasmLogging: () => void;
  enableTelemetry: (addr: string) => void;
}

const supportedEnvironmentGuard = (): true | never => {
  if (typeof globalThis.window === "undefined") {
    const message = "Init error: Only browser environments are supported.";
    Log(message);
    throw new Error(message);
  }
  return true;
};

const dedupInitGuard = (): boolean => {
  const wasInitialised = Boolean(globalThis.__NILLION?.initialized);
  if (wasInitialised) {
    Log("Init warning: Nillion init called more than once.");
  }
  return wasInitialised;
};

export async function init(): Promise<void> {
  supportedEnvironmentGuard();
  if (dedupInitGuard()) {
    Log("Already initialised. Noop.");
    return;
  }

  const result = await Wasm.default();
  result.__wbindgen_start();

  globalThis.__NILLION = {
    initialized: true,
    disableLogging: () => {
      Log(`Disabling logging.`);
      localStorage.debug = "";
    },
    enableLogging: () => {
      localStorage.debug = "nillion:*";
      Log(`Logging namespaces: ${localStorage.debug as string}.`);
    },
    enableWasmLogging: () => {
      Wasm.NillionClient.enable_remote_logging();
      Log("Remote logging initialised.");
    },
    enableTelemetry: (addr: string) => {
      Wasm.NillionClient.enable_tracking(addr);
      Log("Telemetry reported enabled.");
    },
  };

  Log("Wasm initialized.");
}
