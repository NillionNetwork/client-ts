import { useMutation } from "@tanstack/react-query";

import { StoreAcl, StoreId } from "@nillion/client-core";

import { nilHookBaseResult, UseNilHook } from "./nil-hook-base";
import { useNillion } from "./use-nillion";

/**
 * `ExecuteArgs` is an interface that can be passed to the `execute` function.
 * @param id - `StoreId` or `string`
 */
interface ExecuteArgs {
  id: StoreId | string;
}
type ExecuteResult = StoreAcl;

/**
 * `UseNilFetchStoreAcl` is a hook that allows you to fetch a store acl.
 * execute - executes the NilHook synchronously, allowing the user to check for its status via {@link isSuccess} and {@link isError}.
 * executeAsync - executes the NilHook asynchronously, allowing the usage of `async/await` or `.then()`.
 */
type UseNilFetchStoreAcl = UseNilHook<ExecuteArgs, ExecuteResult>;

/**
 * `useNilFetchStoreAcl` is a hook that allows you to fetch a store acl.
 * @returns {@link UseNilFetchStoreAcl}
 */
export const useNilFetchStoreAcl = (): UseNilFetchStoreAcl => {
  const { client } = useNillion();

  const mutationFn = async (args: ExecuteArgs): Promise<ExecuteResult> => {
    const response = await client.fetchStoreAcl(args);
    if (response.err) throw response.err as Error;
    return response.ok;
  };

  const mutate = useMutation({
    mutationFn,
  });

  return {
    /* execute function that takes an `ExecuteArgs` object and executes the fetch store acl */
    execute: (args: ExecuteArgs) => {
      mutate.mutate(args);
    },
    /* executeAsync function that takes an `ExecuteArgs` object and executes the fetch store acl asynchronously */
    executeAsync: async (args: ExecuteArgs) => mutate.mutateAsync(args),
    ...nilHookBaseResult(mutate),
  };
};
