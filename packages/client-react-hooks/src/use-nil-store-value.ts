import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  Days,
  NadaPrimitiveValue,
  StoreAcl,
  StoreId,
} from "@nillion/client-core";

import { createStoreCacheKey } from "./cache-key";
import { nilHookBaseResult, UseNilHook } from "./nil-hook-base";
import { useNillion } from "./use-nillion";

interface Options {
  ttl: Days | number;
  acl?: StoreAcl;
}

interface ExecuteArgs {
  data: NadaPrimitiveValue;
}
type ExecuteResult = StoreId;

type UseNilStoreValue = UseNilHook<ExecuteArgs, ExecuteResult>;

export const useNilStoreValue = (options: Options): UseNilStoreValue => {
  const { client: nilClient } = useNillion();
  const queryClient = useQueryClient();
  const { ttl, acl } = options;

  const mutationFn = async (args: ExecuteArgs): Promise<ExecuteResult> => {
    const { data } = args;
    const response = await nilClient.store({
      name: "data",
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
