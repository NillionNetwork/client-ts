import { useContext } from "react";

import { NillionContext } from "./nillion-provider";

export function useNillion(): NillionContext {
  const context = useContext(NillionContext);
  if (!context) {
    throw new Error("NillionContext is undefined");
  }
  return context;
}
