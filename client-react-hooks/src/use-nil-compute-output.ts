import { useMutation } from "@tanstack/react-query";

import { ComputeOutputId, NadaPrimitiveValue } from "@nillion/client-core";

import { nilHookBaseResult, UseNilHook } from "./nil-hook-base";
import { useNillion } from "./use-nillion";

/**
 * `ExecuteArgs` is an interface that can be passed to the `execute` function.
 * @param id - `ComputeOutputId` or `string`
 */
interface ExecuteArgs {
  id: ComputeOutputId | string;
}

type ExecuteResult = Record<string, NadaPrimitiveValue>;

/**
 * `UseNilComputeOutput` is a hook that allows you to execute a compute output.
 * execute - It executes the NilHook synchronously, allowing the user to check for its status via {@link isSuccess} and {@link isError}.
 * executeAsync -  It executes the NilHook asynchronously, allowing the usage of `async/await` or `.then()`.
 */
type UseNilComputeOutput = UseNilHook<ExecuteArgs, ExecuteResult>;

/**
 * `useNilComputeOutput` is a hook that allows you to execute a compute output.
 * @returns {@link UseNilComputeOutput}
 */
export const useNilComputeOutput = (): UseNilComputeOutput => {
  const { client: nilClient } = useNillion();

  const mutationFn = async (args: ExecuteArgs): Promise<ExecuteResult> => {
    const response = await nilClient.fetchComputeOutput(args);
    if (response.err) throw response.err as Error;
    return response.ok;
  };

  const mutate = useMutation({
    mutationFn,
  });

  return {
    /** execute function that takes an ExecuteArgs object and executes the compute output */
    execute: (args: ExecuteArgs) => {
      mutate.mutate(args);
    },
    /** executeAsync function that takes an ExecuteArgs object and executes the compute output asynchronously */
    executeAsync: async (args: ExecuteArgs) => mutate.mutateAsync(args),
    ...nilHookBaseResult(mutate),
  };
};
