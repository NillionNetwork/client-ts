import { useMutation, useQueryClient } from "@tanstack/react-query";

import { StoreId } from "@nillion/client-core";

import { createStoreCacheKey } from "./cache-key";
import { nilHookBaseResult } from "./nil-hook-base";
import { UseNilHook } from "./nil-hook-base";
import { useNillion } from "./use-nillion";

/**
 * `ExecuteArgs` is an interface that can be passed to the `execute` function
 * @param id - `StoreId` or `string`
 */
interface ExecuteArgs {
  id: StoreId | string;
}

type ExecuteResult = StoreId;

/**
 * `UseNilDeleteValue` is a hook that allows you to delete a value from a store.
 * execute - It executes the NilHook synchronously, allowing the user to check for its status via {@link isSuccess} and {@link isError}.
 * executeAsync -  It executes the NilHook asynchronously, allowing the usage of `async/await` or `.then()`.
 */
type UseNilDeleteValue = UseNilHook<ExecuteArgs, ExecuteResult>;

/**
 * `useNilDeleteValue` is a hook that allows you to delete a value from a store.
 * @returns {@link UseNilDeleteValue}
 */
export const useNilDeleteValue = (): UseNilDeleteValue => {
  const { client: nilClient } = useNillion();
  const queryClient = useQueryClient();

  const mutationFn = async (args: ExecuteArgs): Promise<ExecuteResult> => {
    const { id } = args;
    const key = createStoreCacheKey(id);

    const response = await nilClient.deleteValues(args);
    if (response.err) throw response.err as Error;

    const cachedData = queryClient.getQueryState(key);
    if (cachedData) {
      queryClient.removeQueries({ queryKey: key });
    }

    return response.ok;
  };

  const mutate = useMutation({
    mutationFn,
  });

  return {
    /** execute function that takes an `ExecuteArgs` object and executes the delete value */
    execute: (args: ExecuteArgs) => {
      mutate.mutate(args);
    },
    /** executeAsync function that takes an `ExecuteArgs` object and executes the delete value asynchronously */
    executeAsync: async (args: ExecuteArgs) => mutate.mutateAsync(args),
    ...nilHookBaseResult(mutate),
  };
};
