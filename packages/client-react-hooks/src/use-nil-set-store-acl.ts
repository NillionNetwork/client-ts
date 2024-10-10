import { useMutation } from "@tanstack/react-query";

import { ActionId, StoreAcl, StoreId } from "@nillion/client-core";

import { nilHookBaseResult } from "./nil-hook-base";
import { UseNilHook } from "./nil-hook-base";
import { useNillion } from "./use-nillion";

/**
 * `ExecuteArgs` is an interface that can be passed to the `execute` function.
 * @param id - `StoreId` or `string`
 * @param acl - `StoreAcl`
 */
interface ExecuteArgs {
  id: StoreId | string;
  acl: StoreAcl;
}
type ExecuteResult = ActionId;

/**
 * `UseNilSetStoreAcl` is a hook that allows you to set a store acl.
 * execute - It executes the NilHook synchronously, allowing the user to check for its status via {@link isSuccess} and {@link isError}.
 * executeAsync -  It executes the NilHook asynchronously, allowing the usage of `async/await` or `.then()`.
 */
type UseNilSetStoreAcl = UseNilHook<ExecuteArgs, ExecuteResult>;

/**
 * `useNilSetStoreAcl` is a hook that allows you to set a store acl.
 * @returns {@link UseNilSetStoreAcl}
 */
export const useNilSetStoreAcl = (): UseNilSetStoreAcl => {
  const { client } = useNillion();

  const mutationFn = async (args: ExecuteArgs): Promise<ExecuteResult> => {
    const response = await client.setStoreAcl(args);
    if (response.err) throw response.err as Error;
    return response.ok;
  };

  const mutate = useMutation({
    mutationFn,
  });

  return {
    /** `execute` function that takes an `ExecuteArgs` object and executes the set store acl */
    execute: (args: ExecuteArgs) => {
      mutate.mutate(args);
    },
    /** `executeAsync` function that takes an `ExecuteArgs` object and executes the set store acl asynchronously */
    executeAsync: async (args: ExecuteArgs) => mutate.mutateAsync(args),
    ...nilHookBaseResult(mutate),
  };
};
