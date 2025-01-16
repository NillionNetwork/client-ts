import { useMutation } from "@tanstack/react-query";
import { type UseNilHook, nilHookBaseResult } from "./nil-hook-base";
import { useNillion } from "./use-nillion";

type ExecuteArgs = {
  amount: bigint;
};
type ExecuteResult = undefined;

type UseNilAddFunds = UseNilHook<ExecuteArgs, ExecuteResult>;

export const useNilAddFunds = (): UseNilAddFunds => {
  const { client } = useNillion();

  const mutationFn = async (args: ExecuteArgs): Promise<ExecuteResult> => {
    await client.payer.addFunds(args.amount);
  };

  const mutate = useMutation({
    mutationFn,
  });

  return {
    execute: (args: ExecuteArgs): void => {
      mutate.mutate(args);
    },
    executeAsync: async (args: ExecuteArgs): Promise<ExecuteResult> =>
      mutate.mutateAsync(args),
    ...nilHookBaseResult(mutate),
  };
};
