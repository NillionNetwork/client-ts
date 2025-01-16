import { useMutation } from "@tanstack/react-query";
import { type UseNilHook, nilHookBaseResult } from "./nil-hook-base";
import { useNillion } from "./use-nillion";

type ExecuteArgs = undefined;
type ExecuteResult = bigint;

type UseNilAccountBalance = UseNilHook<ExecuteArgs, ExecuteResult>;

export const useNilAccountBalance = (): UseNilAccountBalance => {
  const { client } = useNillion();

  const mutationFn = async (): Promise<ExecuteResult> => {
    const response = await client.payer.accountBalance();
    return response.balance;
  };

  const mutate = useMutation({
    mutationFn,
  });

  return {
    execute: (): void => {
      mutate.mutate();
    },
    executeAsync: async (): Promise<ExecuteResult> => mutate.mutateAsync(),
    ...nilHookBaseResult(mutate),
  };
};
