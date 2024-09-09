import { useMutation } from "@tanstack/react-query";

import { ComputeOutputId, NadaPrimitiveValue } from "@nillion/client-core";

import { nilHookBaseResult, UseNilHook } from "./nil-hook-base";
import { useNillion } from "./use-nillion";

/**
 * ExecuteArgs is a set of arguments that can be passed to the execute function.
 * @property id - The ID of the compute output to execute.
 * @interface
 */
interface ExecuteArgs {
  id: ComputeOutputId | string;
}

/**
 * ExecuteResult is a set of results that can be returned from the execute function.
 */
export type ExecuteResult = Record<string, NadaPrimitiveValue>;

/**
 * UseNilComputeOutput is a hook that allows you to execute a compute output.
 */
export type UseNilComputeOutput = UseNilHook<ExecuteArgs, ExecuteResult>;

/**
 * useNilComputeOutput is a hook that allows you to execute a compute output.
 * @param none
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
    /** Execute the NilHook. */
    execute: (args: ExecuteArgs) => {
      mutate.mutate(args);
    },
    /** Execute the NilHook asynchronously. */
    executeAsync: async (args: ExecuteArgs) => mutate.mutateAsync(args),
    ...nilHookBaseResult(mutate),
  };
};
