import { NillionClient, NillionConfig } from "@nillion/core";
import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

type Bootstrap =
  | {
      client: undefined;
      error: string;
      ready: false;
    }
  | {
      client: NillionClient;
      error: undefined;
      ready: true;
    };

export function useNillionBootstrap(config: NillionConfig): Bootstrap {
  const [_ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [client, setClient] = useState<NillionClient>();

  useEffect(() => {
    async function bootstrap() {
      await NillionClient.init();
      const client = NillionClient.fromConfig(config);
      setReady(true);
      setClient(client);
    }

    bootstrap().catch((e) => {
      console.error(e);
      setError("failed to initialise nillion client");
    });
  }, []);

  if (client) {
    return { client, error: undefined, ready: true };
  } else {
    return { client: undefined, error, ready: false };
  }
}

export type Context = {
  client: NillionClient;
  config: NillionConfig;
};

export const NillionContext = createContext<Context | undefined>(undefined);

export function useNillion() {
  const context = useContext(NillionContext);
  if (!context) {
    throw new Error("useNillionClient must be used within a NillionProvider");
  }
  return context;
}

export type NillionProviderValue = {
  client: NillionClient;
  config: NillionConfig;
};

export type NillionProviderProps = {
  children: ReactNode;
  value: NillionProviderValue;
};

export function NillionProvider(
  props: NillionProviderProps,
): React.ReactElement {
  return (
    <NillionContext.Provider
      value={{ client: props.value.client, config: props.value.config }}
    >
      {props.children}
    </NillionContext.Provider>
  );
}
