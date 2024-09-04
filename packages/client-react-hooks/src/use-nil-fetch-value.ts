import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  NadaPrimitiveValue,
  NadaValueType,
  NamedValue,
  StoreId,
} from "@nillion/client-core";

import { createStoreCacheKey } from "./cache-key";
import { Log } from "./logging";
import { nilHookBaseResult } from "./nil-hook-base";
import { UseNilHook } from "./nil-hook-base";
import { useNillion } from "./use-nillion";

interface Options {
  type: NadaValueType;
  staleAfter?: number;
}

interface ExecuteArgs {
  id: StoreId | string;
  name: NamedValue | string;
}
type ExecuteResult = NadaPrimitiveValue;

type UseNilFetchValue = UseNilHook<ExecuteArgs, ExecuteResult>;

export const useNilFetchValue = (options: Options): UseNilFetchValue => {
  const { client: nilClient } = useNillion();
  const queryClient = useQueryClient();

  const mutationFn = async (args: ExecuteArgs): Promise<ExecuteResult> => {
    const { id, name } = args;
    const key = createStoreCacheKey(id);

    if (options.staleAfter) {
      const cachedData = queryClient.getQueryState<ExecuteResult>(key);
      if (cachedData) {
        const currentTime = Date.now();
        const dataAge = currentTime - cachedData.dataUpdatedAt;
        const staleTimeThreshold = options.staleAfter ?? 5 * 60 * 1000; // default to 5 minutes

        if (
          dataAge <= staleTimeThreshold &&
          cachedData.status === "success" &&
          cachedData.data
        ) {
          Log("Cache hit: %O", cachedData.data);
          return cachedData.data;
        }
      }
    }

    const response = await nilClient.fetch({
      id,
      name,
      type: options.type,
    });
    if (response.err) throw response.err as Error;

    const data = response.ok;
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
