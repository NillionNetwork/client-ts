import { useMutation, useQueryClient } from "@tanstack/react-query";

import { StoreId } from "@nillion/client-core";

import { createStoreCacheKey } from "./cache-key";
import { nilHookBaseResult } from "./nil-hook-base";
import { UseNilHook } from "./nil-hook-base";
import { useNillion } from "./use-nillion";

type ExecuteArgs = StoreId | string;
type ExecuteResult = StoreId;

type UseNilDeleteValue = UseNilHook<ExecuteArgs, ExecuteResult>;

export const useNilDeleteValue = (): UseNilDeleteValue => {
  const { client: nilClient } = useNillion();
  const queryClient = useQueryClient();

  const mutationFn = async (id: ExecuteArgs): Promise<ExecuteResult> => {
    const key = createStoreCacheKey(id);

    const response = await nilClient.deleteValues({
      id,
    });
    if (response.err) throw response.err as Error;

    const cachedData = queryClient.getQueryState(key);
    if (cachedData) {
      queryClient.removeQueries({ queryKey: key });
    }

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
