import type { Uuid, ValuesPermissions } from "@nillion/client-vms";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type UseNilHook, nilHookBaseResult } from "./nil-hook-base";
import { checkCache, createPermissionsCacheKey } from "./query-cache";
import { useNillion } from "./use-nillion";

type Options = {
  staleAfterSeconds?: number;
};
interface ExecuteArgs {
  id: Uuid;
}
type ExecuteResult = ValuesPermissions;

type UseNilRetrievePermissions = UseNilHook<ExecuteArgs, ExecuteResult>;

export const useNilRetrievePermissions = (
  options: Options,
): UseNilRetrievePermissions => {
  const { client } = useNillion();
  const queryClient = useQueryClient();

  const mutationFn = async (args: ExecuteArgs): Promise<ExecuteResult> => {
    const key = createPermissionsCacheKey(args.id);

    if (options.staleAfterSeconds) {
      const result = checkCache<ExecuteResult>(
        queryClient,
        key,
        options.staleAfterSeconds,
      );

      if (result.hit) {
        return result.data;
      }
    }

    const data = await client
      .retrievePermissions()
      .id(args.id)
      .build()
      .invoke();

    queryClient.setQueryData(key, data);

    return data;
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
