import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  Days,
  NadaPrimitiveValue,
  NamedValue,
  StoreId,
} from "@nillion/client-core";

import { createStoreCacheKey } from "./cache-key";
import { nilHookBaseResult, UseNilHook } from "./nil-hook-base";
import { useNillion } from "./use-nillion";

interface ExecuteArgs {
  id: StoreId | string;
  name: NamedValue | string;
  data: NadaPrimitiveValue;
  ttl: Days | number;
}

type ExecuteResult = StoreId;

type UseNilUpdateValue = UseNilHook<ExecuteArgs, ExecuteResult>;

export const useNilUpdateValue = (): UseNilUpdateValue => {
  const { client: nilClient } = useNillion();
  const queryClient = useQueryClient();

  const mutationFn = async (args: ExecuteArgs): Promise<ExecuteResult> => {
    const { id, data, name, ttl } = args;
    const response = await nilClient.update({
      id,
      name,
      value: data,
      ttl,
    });
    if (response.err) throw response.err as Error;

    const key = createStoreCacheKey(id);
    queryClient.setQueryData(key, data);
    return id as StoreId;
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
