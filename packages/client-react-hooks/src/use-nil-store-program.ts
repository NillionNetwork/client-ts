import { useMutation } from "@tanstack/react-query";

import { ProgramId, ProgramName } from "@nillion/client-core";

import { nilHookBaseResult } from "./nil-hook-base";
import { UseNilHook } from "./nil-hook-base";
import { useNillion } from "./use-nillion";

/**
 * `ExecuteArgs` is an interface that can be passed to the `execute` function.
 * @param name: `ProgramName` or `string`
 * @param program: `Uint
 */
export interface ExecuteArgs {
  name: ProgramName | string;
  program: Uint8Array;
}
type ExecuteResult = ProgramId;

type UseNilStoreProgram = UseNilHook<ExecuteArgs, ExecuteResult>;

/**
 * `useNilStoreProgram` is a hook that allows you to store a program in Nillion.
 * @returns {@link UseNilStoreProgram}
 * @interface
 */
export const useNilStoreProgram = (): UseNilStoreProgram => {
  const { client: nilClient } = useNillion();

  const mutationFn = async (args: ExecuteArgs): Promise<ExecuteResult> => {
    const response = await nilClient.storeProgram(args);
    if (response.err) throw response.err as Error;
    return response.ok;
  };

  const mutate = useMutation({
    mutationFn,
  });

  return {
    /** `execute` function that takes an `ExecuteArgs` object and executes the store program */
    execute: (args: ExecuteArgs) => {
      mutate.mutate(args);
    },
    /** `executeAsync` function that takes an `ExecuteArgs` object and executes the store program asynchronously */
    executeAsync: async (args: ExecuteArgs) => mutate.mutateAsync(args),
    ...nilHookBaseResult(mutate),
  };
};
