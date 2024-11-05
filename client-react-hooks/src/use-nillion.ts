import { useContext } from "react";

import { NillionContext } from "./nillion-provider";

/**
 * `useNillion`
 * A custom hook that returns the {@link NillionContext}.
 * @returns {@link NillionContext}
 * @throws error if `NillionContext` is undefined
 */
export function useNillion(): NillionContext {
  const context = useContext(NillionContext);
  if (!context) {
    throw new Error(
      "NillionContext is undefined. Be sure to call setCredentials() and login().",
    );
  }
  return context;
}
