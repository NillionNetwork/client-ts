import { useMutation } from "@tanstack/react-query";

import {
  ComputeOutputId,
  NadaValues,
  ProgramBindings,
  StoreId,
} from "@nillion/client-core";

import { nilHookBaseResult, UseNilHook } from "./nil-hook-base";
import { useNillion } from "./use-nillion";

interface ExecuteArgs {
  bindings: ProgramBindings;
  values: NadaValues;
  storeIds: (StoreId | string)[];
}
type ExecuteResult = ComputeOutputId;

type UseNilCompute = UseNilHook<ExecuteArgs, ExecuteResult>;

export const useNilCompute = (): UseNilCompute => {
  const { client: nilClient } = useNillion();

  const mutationFn = async (args: ExecuteArgs): Promise<ExecuteResult> => {
    const response = await nilClient.compute(args);
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
