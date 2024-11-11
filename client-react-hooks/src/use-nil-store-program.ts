import type { ProgramId, ProgramName } from "@nillion/client-vms";
import { useMutation } from "@tanstack/react-query";
import { type UseNilHook, nilHookBaseResult } from "./nil-hook-base";
import { useNillion } from "./use-nillion";

interface ExecuteArgs {
  name: ProgramName | string;
  program: Uint8Array;
}
type ExecuteResult = ProgramId;

type UseNilStoreProgram = UseNilHook<ExecuteArgs, ExecuteResult>;

export const useNilStoreProgram = (): UseNilStoreProgram => {
  const { client } = useNillion();

  const mutationFn = async (args: ExecuteArgs): Promise<ExecuteResult> => {
    return await client
      .storeProgram()
      .name(args.name)
      .program(args.program)
      .build()
      .invoke();
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
