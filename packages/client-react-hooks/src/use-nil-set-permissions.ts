import { useMutation } from "@tanstack/react-query";

import { ActionId, Permissions, StoreId } from "@nillion/client-core";

import { nilHookBaseResult } from "./nil-hook-base";
import { UseNilHook } from "./nil-hook-base";
import { useNillion } from "./use-nillion";

interface ExecuteArgs {
  id: StoreId | string;
  permissions: Permissions;
}
type ExecuteResult = ActionId;

type UseNilSetPermissions = UseNilHook<ExecuteArgs, ExecuteResult>;

export const useNilSetPermissions = (): UseNilSetPermissions => {
  const { client: nilClient } = useNillion();

  const mutationFn = async (args: ExecuteArgs): Promise<ExecuteResult> => {
    const response = await nilClient.setPermissions(args);
    if (response.err) throw response.err as Error;
    return response.ok;
  };

  const mutate = useMutation({
    mutationFn,
  });

  return {
    execute: (args: ExecuteArgs) => {
      mutate.mutate(args);
    },
    executeAsync: async (args: ExecuteArgs) => mutate.mutateAsync(args),
    ...nilHookBaseResult(mutate),
  };
};
