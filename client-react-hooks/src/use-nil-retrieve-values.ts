import type { NadaValuesRecord, Uuid } from "@nillion/client-vms";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { nilHookBaseResult } from "./nil-hook-base";
import type { UseNilHook } from "./nil-hook-base";
import { checkCache } from "./query-cache";
import { createStoreCacheKey } from "./query-cache";
import { useNillion } from "./use-nillion";

type Options = {
  staleAfterSeconds?: number;
};
type ExecuteArgs = {
  id: Uuid;
};
type ExecuteResult = NadaValuesRecord;

type UseNilRetrieveValues = UseNilHook<ExecuteArgs, ExecuteResult>;

export const useNilRetrieveValues = (
  options: Options = { staleAfterSeconds: 5 * 60 },
): UseNilRetrieveValues => {
  const { client } = useNillion();
  const queryClient = useQueryClient();

  const mutationFn = async (args: ExecuteArgs): Promise<ExecuteResult> => {
    const { id } = args;
    const key = createStoreCacheKey(id);

    if (options.staleAfterSeconds) {
      const result = checkCache<ExecuteResult>(
        queryClient,
        key,
        options.staleAfterSeconds,
      );

      if (result.hit) {
        return result.data;
      }
    }

    const data = await client.retrieveValues().id(id).build().invoke();
    queryClient.setQueryData(key, data);
    return data;
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
