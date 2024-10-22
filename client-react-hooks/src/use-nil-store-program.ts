import { useMutation } from "@tanstack/react-query";

import { ProgramId, ProgramName } from "@nillion/client-core";

import { nilHookBaseResult } from "./nil-hook-base";
import { UseNilHook } from "./nil-hook-base";
import { useNillion } from "./use-nillion";

interface ExecuteArgs {
  name: ProgramName | string;
  program: Uint8Array;
}
type ExecuteResult = ProgramId;

type UseNilStoreProgram = UseNilHook<ExecuteArgs, ExecuteResult>;

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
    execute: (args: ExecuteArgs) => {
      mutate.mutate(args);
    },
    executeAsync: async (args: ExecuteArgs) => mutate.mutateAsync(args),
    ...nilHookBaseResult(mutate),
  };
};
