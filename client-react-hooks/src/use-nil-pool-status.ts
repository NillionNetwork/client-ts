import type { PoolStatus } from "@nillion/client-vms";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type UseNilHook, nilHookBaseResult } from "./nil-hook-base";
import { createPoolStatusCacheKey } from "./query-cache";
import { useNillion } from "./use-nillion";

type ExecuteArgs = undefined;
type ExecuteResult = PoolStatus;

type UseNilPoolStatus = UseNilHook<ExecuteArgs, ExecuteResult>;

export const useNilPoolStatus = (): UseNilPoolStatus => {
  const { client } = useNillion();
  const queryClient = useQueryClient();

  const mutationFn = async (): Promise<ExecuteResult> => {
    const status = await client.queryPoolStatus().build().invoke();
    const key = createPoolStatusCacheKey();
    queryClient.setQueryData(key, status);
    return status;
  };

  const mutate = useMutation({
    mutationFn,
  });

  return {
    execute: (): void => {
      mutate.mutate();
    },
    executeAsync: async (): Promise<ExecuteResult> => mutate.mutateAsync(),
    ...nilHookBaseResult(mutate),
  };
};
