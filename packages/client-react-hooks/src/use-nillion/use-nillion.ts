import { NillionClient } from "@nillion/client-vms";
import { useContext } from "react";

import { NillionClientContext } from "./nillion-provider";

export function useNillion(): NillionClient {
  const context = useContext(NillionClientContext);
  if (!context) {
    throw new Error(
      "No NillionClient set, use NillionClientProvider to set one.",
    );
  }
  return context;
}
