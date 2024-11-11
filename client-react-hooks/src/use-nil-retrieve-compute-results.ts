import type { NadaValuesRecord, Uuid } from "@nillion/client-vms";
import { useMutation } from "@tanstack/react-query";
import { type UseNilHook, nilHookBaseResult } from "./nil-hook-base";
import { useNillion } from "./use-nillion";

interface ExecuteArgs {
  id: Uuid;
}
type ExecuteResult = NadaValuesRecord;

type UseNilRetrieveComputeResults = UseNilHook<ExecuteArgs, ExecuteResult>;

export const useNilRetrieveComputeResults =
  (): UseNilRetrieveComputeResults => {
    const { client } = useNillion();

    const mutationFn = async (args: ExecuteArgs): Promise<ExecuteResult> => {
      return await client.retrieveComputeResult().id(args.id).build().invoke();
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
