import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  Days,
  NadaPrimitiveValue,
  NamedValue,
  StoreAcl,
  StoreId,
} from "@nillion/client-core";

import { createStoreCacheKey } from "./cache-key";
import { nilHookBaseResult, UseNilHook } from "./nil-hook-base";
import { useNillion } from "./use-nillion";

interface ExecuteArgs {
  name: NamedValue | string;
  data: NadaPrimitiveValue;
  ttl: Days | number;
  acl?: StoreAcl;
}

type ExecuteResult = StoreId;

type UseNilStoreValue = UseNilHook<ExecuteArgs, ExecuteResult>;

export const useNilStoreValue = (): UseNilStoreValue => {
  const { client: nilClient } = useNillion();
  const queryClient = useQueryClient();

  const mutationFn = async (args: ExecuteArgs): Promise<ExecuteResult> => {
    const { name, data, ttl, acl } = args;
    const response = await nilClient.store({
      name,
      value: data,
      ttl,
      acl,
    });
    if (response.err) throw response.err as Error;

    const id = response.ok;
    const key = createStoreCacheKey(id);
    queryClient.setQueryData(key, data);
    return id;
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
