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

/**
 * `Options` is an interface that can be passed to the `useNilFetchValue` hook.
 * @param type - `NadaValueType`
 * @param staleAfter - `number`
 */
interface Options {
  type: NadaValueType;
  staleAfter?: number;
}

/**
 * `ExecuteArgs` is an interface that can be passed to the `execute` function.
 * @param id - `StoreId` or `string`
 * @param name - `NamedValue` or `string`
 */
interface ExecuteArgs {
  id: StoreId | string;
  name: NamedValue | string;
}
type ExecuteResult = NadaPrimitiveValue;

/**
 * `UseNilFetchValue` is a hook that allows you to fetch a value from a store.
 * execute - It executes the NilHook synchronously, allowing the user to check for its status via {@link isSuccess} and {@link isError}.
 * executeAsync -  It executes the NilHook asynchronously, allowing the usage of `async/await` or `.then()`.
 */
type UseNilFetchValue = UseNilHook<ExecuteArgs, ExecuteResult>;

/**
 * `useNilFetchValue` is a hook that allows you to fetch a value from a store.
 * @returns {@link UseNilFetchValue}
 */
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
    /** execute function that takes an ExecuteArgs object and executes the fetch value */
    execute: (args: ExecuteArgs) => {
      mutate.mutate(args);
    },
    /** executeAsync function that takes an ExecuteArgs object and executes the fetch value asynchronously */
    executeAsync: async (args: ExecuteArgs) => mutate.mutateAsync(args),
    ...nilHookBaseResult(mutate),
  };
};
