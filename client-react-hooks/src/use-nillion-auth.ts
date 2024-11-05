import { useContext } from "react";

import { UserSeed } from "@nillion/client-core";
import { OfflineSigner } from "@nillion/client-payments";
import { UserCredentials as ClientUserCredentials } from "@nillion/client-vms";

import { Log } from "./logging";
import { NillionContext } from "./nillion-provider";

/**
 * This file provides a hook for using the Nillion authentication context.
 * It provides a simple interface for logging in and out of the Nillion client.
 */
export interface UseNillionAuthContext {
  authenticated: boolean;
  login: (args: UserCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
}

/**
 * `UserCredentials` is a type that can be passed to the `login` function.
 * It is a union of the `UserSeed` type and a string, which can be used to
 * create a `UserSeed`. Additionally, it can include a nodeSeed and a signer
 * field, which can be used to specify a custom signer for the client.
 * @param userSeed - `UserSeed` or string
 * @param nodeSeed - string
 * @param signer - "kelpr" or a function that returns a `Promise<OfflineSigner>`
 */
export interface UserCredentials {
  userSeed: UserSeed | string;
  nodeSeed?: string;
  signer?: "keplr" | (() => Promise<OfflineSigner>);
}

/**
 * `useNillionAuth` is a hook that provides access to the Nillion authentication
 * context. It returns an object with three fields: `authenticated`, `login`,
 * and `logout`. The `authenticated` field is a boolean that indicates whether
 * the client is currently authenticated. The `login` function can be called
 * with a `UserCredentials` object to log in to the client. The `logout` function
 * can be called to log out of the client.
 * @returns UseNillionAuthContext
 * @throws Error if NillionContext is not set
 */
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
    /** login function that takes a UserCredentials object and logs in to the client */
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
    /** logout function that logs out of the client */
    logout: context.logout,
  };
}
