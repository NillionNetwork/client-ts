import { NillionClient } from "@nillion/client-vms";
import { useContext, useEffect, useState } from "react";
import { NillionClientContext } from "./NillionProvider";
import { Log } from "./logging";

export interface UseNillionHook {
  client: NillionClient;
  error?: Error;
  ready: boolean;
}

export interface UseNillionHookArgs {
  foo?: string;
}

export function useNillion(_args?: UseNillionHookArgs): UseNillionHook {
  const context = useContext(NillionClientContext);
  if (!context) {
    throw new Error("useNillion hook passed undefined NillionClient.");
  }
  const client = context;
  const [ready, setReady] = useState(client.ready);
  const [error, setError] = useState<Error>();

  async function run() {
    try {
      await client.connect();
      setReady(client.ready);
    } catch (e: unknown) {
      const error = new Error("NillionClient failed to connect", {
        cause: e,
      });
      console.error(error);
      setError(error);
    }
  }

  useEffect(() => {
    void run();

    return () => {
      Log("useNillion hook cleanup called.");
      client.disconnect();
    };
  }, [client.ready]);

  if (error) {
    return { client, error, ready };
  } else {
    return { client, error: undefined, ready };
  }
}
