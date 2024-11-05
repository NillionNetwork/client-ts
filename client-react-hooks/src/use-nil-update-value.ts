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

/** `ExecuteArgs` is an interface that can be passed to the `execute` function
 * @param id - `StoreId` or `string`
 * @param name - `NamedValue` or `string`
 * @param data - `NadaPrimitiveValue`
 * @param ttl - `Days` or `number`
 */
interface ExecuteArgs {
  id: StoreId | string;
  name: NamedValue | string;
  data: NadaPrimitiveValue;
  ttl: Days | number;
}

type ExecuteResult = StoreId;

type UseNilUpdateValue = UseNilHook<ExecuteArgs, ExecuteResult>;

/**
 * `useNilUpdateValue` is a hook that allows you to update a value in Nillion.
 * @returns {@link UseNilUpdateValue}
 */
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
    /** `execute` function that takes an `ExecuteArgs` object and executes the update value */
    execute: (args: ExecuteArgs) => {
      mutate.mutate(args);
    },
    /** `executeAsync` function that takes an `ExecuteArgs` object and executes the update value asynchronously */
    executeAsync: async (args: ExecuteArgs) => mutate.mutateAsync(args),
    ...nilHookBaseResult(mutate),
  };
};
