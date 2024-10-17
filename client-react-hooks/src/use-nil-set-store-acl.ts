import { useMutation } from "@tanstack/react-query";

import { ActionId, StoreAcl, StoreId } from "@nillion/client-core";

import { nilHookBaseResult } from "./nil-hook-base";
import { UseNilHook } from "./nil-hook-base";
import { useNillion } from "./use-nillion";

interface ExecuteArgs {
  id: StoreId | string;
  acl: StoreAcl;
}
type ExecuteResult = ActionId;

type UseNilSetStoreAcl = UseNilHook<ExecuteArgs, ExecuteResult>;

export const useNilSetStoreAcl = (): UseNilSetStoreAcl => {
  const { client } = useNillion();

  const mutationFn = async (args: ExecuteArgs): Promise<ExecuteResult> => {
    const response = await client.setStoreAcl(args);
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
