import type { Uuid } from "@nillion/client-vms";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { nilHookBaseResult } from "./nil-hook-base";
import type { UseNilHook } from "./nil-hook-base";
import { createStoreCacheKey } from "./query-cache";
import { useNillion } from "./use-nillion";

type ExecuteArgs = {
  id: Uuid;
};
type ExecuteResult = Uuid;

type UseNilDeleteValues = UseNilHook<ExecuteArgs, ExecuteResult>;

export const useNilDeleteValues = (): UseNilDeleteValues => {
  const { client } = useNillion();
  const queryClient = useQueryClient();

  const mutationFn = async (args: ExecuteArgs): Promise<ExecuteResult> => {
    const queryKey = createStoreCacheKey(args.id);

    const id = await client.deleteValues().id(args.id).build().invoke();
    queryClient.removeQueries({ queryKey });
    return id;
  };

  const mutate = useMutation({
    mutationFn,
  });

  return {
    execute: (args: ExecuteArgs): void => {
      mutate.mutate(args);
    },
    executeAsync: async (args: ExecuteArgs) => mutate.mutateAsync(args),
    ...nilHookBaseResult(mutate),
  };
};
