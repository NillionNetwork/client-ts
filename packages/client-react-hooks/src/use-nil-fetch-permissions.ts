import { useMutation } from "@tanstack/react-query";

import { Permissions, StoreId } from "@nillion/client-core";

import { nilHookBaseResult, UseNilHook } from "./nil-hook-base";
import { useNillion } from "./use-nillion";

interface ExecuteArgs {
  id: StoreId | string;
}
type ExecuteResult = Permissions;

type UseNilFetchPermissions = UseNilHook<ExecuteArgs, ExecuteResult>;

export const useNilFetchPermissions = (): UseNilFetchPermissions => {
  const { client: nilClient } = useNillion();

  const mutationFn = async (args: ExecuteArgs): Promise<ExecuteResult> => {
    const response = await nilClient.fetchPermissions(args);
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
