import { useMutation } from "@tanstack/react-query";

import { ComputeResultId } from "@nillion/client-core";

import { nilHookBaseResult, UseNilHook } from "./nil-hook-base";
import { useNillion } from "./use-nillion";

type ExecuteArgs = ComputeResultId | string;
type ExecuteResult = object;

type UseNilComputeOutput = UseNilHook<ExecuteArgs, ExecuteResult>;

export const useNilComputeOutput = (): UseNilComputeOutput => {
  const { client: nilClient } = useNillion();

  const mutationFn = async (id: ExecuteArgs): Promise<ExecuteResult> => {
    const response = await nilClient.fetchComputeOutput({ id });
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
