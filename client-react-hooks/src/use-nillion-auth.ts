import { useContext } from "react";

import { UserSeed } from "@nillion/client-core";
import { OfflineSigner } from "@nillion/client-payments";
import { UserCredentials as ClientUserCredentials } from "@nillion/client-vms";

import { Log } from "./logging";
import { NillionContext } from "./nillion-provider";

export interface UseNillionAuthContext {
  authenticated: boolean;
  login: (args: UserCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
}

export interface UserCredentials {
  userSeed: UserSeed | string;
  nodeSeed?: string;
  signer?: "keplr" | (() => Promise<OfflineSigner>);
}

export function useNillionAuth(): UseNillionAuthContext {
  const context = useContext(NillionContext);
  if (!context) {
    throw new Error(
      "NillionContext not set; did you wrap your app with `<NillionProvider>`?",
    );
  }

  const authenticated = context.client.ready;

  return {
    authenticated,
    login: (credentials: UserCredentials) => {
      if (authenticated) {
        Log("Client already logged in.");
        return Promise.resolve(true);
      } else {
        const creds = { ...credentials };
        if (!creds.signer) {
          creds.signer = "keplr";
        }
        context.client.setUserCredentials(
          creds as unknown as ClientUserCredentials,
        );
        return context.client.connect();
      }
    },
    logout: context.logout,
  };
}
