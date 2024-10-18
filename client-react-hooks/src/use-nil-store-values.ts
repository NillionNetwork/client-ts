import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Days, NadaValues, StoreAcl, StoreId } from "@nillion/client-core";

import { createStoreCacheKey } from "./cache-key";
import { nilHookBaseResult, UseNilHook } from "./nil-hook-base";
import { useNillion } from "./use-nillion";

interface ExecuteArgs {
  values: NadaValues;
  ttl: Days;
  acl?: StoreAcl;
}

type ExecuteResult = StoreId;

type UseNilStoreValues = UseNilHook<ExecuteArgs, ExecuteResult>;

export const useNilStoreValues = (): UseNilStoreValues => {
  const { client: nilClient } = useNillion();
  const queryClient = useQueryClient();

  const mutationFn = async (args: ExecuteArgs): Promise<ExecuteResult> => {
    const { values, ttl, acl } = args;
    const response = await nilClient.storeValues({
      values,
      ttl,
      acl,
    });
    if (response.err) throw response.err as Error;

    const id = response.ok;
    const key = createStoreCacheKey(id);
    queryClient.setQueryData(key, id);
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
