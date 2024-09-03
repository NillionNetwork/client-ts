import { useMutation } from "@tanstack/react-query";

import { StoreAcl, StoreId } from "@nillion/client-core";

import { nilHookBaseResult, UseNilHook } from "./nil-hook-base";
import { useNillion } from "./use-nillion";

interface ExecuteArgs {
  id: StoreId | string;
}
type ExecuteResult = StoreAcl;

type UseNilFetchStoreAcl = UseNilHook<ExecuteArgs, ExecuteResult>;

export const useNilFetchStoreAcl = (): UseNilFetchStoreAcl => {
  const { client } = useNillion();

  const mutationFn = async (args: ExecuteArgs): Promise<ExecuteResult> => {
    const response = await client.fetchStoreAcl(args);
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
