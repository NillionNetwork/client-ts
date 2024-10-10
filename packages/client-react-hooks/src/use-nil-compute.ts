import { useMutation } from "@tanstack/react-query";

import {
  ComputeOutputId,
  NadaValues,
  ProgramBindings,
  StoreId,
} from "@nillion/client-core";

import { nilHookBaseResult, UseNilHook } from "./nil-hook-base";
import { useNillion } from "./use-nillion";

/** ExecuteArgs is an interface that can be passed to the `execute` function.
 * @param bindings - `ProgramBindings`
 * @param values - `NadaValues`
 * @param storeIds - array of `StoreId`s or strings
 */
interface ExecuteArgs {
  bindings: ProgramBindings;
  values?: NadaValues;
  storeIds?: (StoreId | string)[];
}
type ExecuteResult = ComputeOutputId;

/**
 * `UseNilCompute` is a hook that allows you to execute a compute operation on Nillion.
 * execute - It executes the NilHook synchronously, allowing the user to check for its status via {@link isSuccess} and {@link isError}.
 * executeAsync -  It executes the NilHook asynchronously, allowing the usage of `async/await` or `.then()`.
 */
type UseNilCompute = UseNilHook<ExecuteArgs, ExecuteResult>;

/**
 * `useNilCompute` is a hook that allows you to execute a compute.
 * @returns {@link UseNilCompute}
 */
export const useNilCompute = (): UseNilCompute => {
  const { client: nilClient } = useNillion();

  const mutationFn = async (args: ExecuteArgs): Promise<ExecuteResult> => {
    const computeArgs = {
      bindings: args.bindings,
      values: args.values ?? NadaValues.create(),
      storeIds: args.storeIds ?? [],
    };
    const response = await nilClient.compute(computeArgs);
    if (response.err) throw response.err as Error;
    return response.ok;
  };

  const mutate = useMutation({
    mutationFn,
  });

  return {
    /** `execute` function that takes an `ExecuteArgs` object and executes the compute */
    execute: (args: ExecuteArgs) => {
      mutate.mutate(args);
    },
    /** `executeAsync` function that takes an `ExecuteArgs` object and executes the compute asynchronously */
    executeAsync: async (args: ExecuteArgs) => mutate.mutateAsync(args),
    ...nilHookBaseResult(mutate),
  };
};
