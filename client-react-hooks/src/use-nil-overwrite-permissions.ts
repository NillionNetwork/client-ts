import { useMutation } from "@tanstack/react-query";

import type { Uuid, ValuesPermissions } from "@nillion/client-vms/types";
import { nilHookBaseResult } from "./nil-hook-base";
import type { UseNilHook } from "./nil-hook-base";
import { useNillion } from "./use-nillion";

interface ExecuteArgs {
  id: Uuid;
  permissions: ValuesPermissions;
}
type ExecuteResult = ValuesPermissions;

type UseNilOverwritePermissions = UseNilHook<ExecuteArgs, ExecuteResult>;

export const useNilOverwritePermissions = (): UseNilOverwritePermissions => {
  const { client } = useNillion();

  const mutationFn = async (args: ExecuteArgs): Promise<ExecuteResult> => {
    return await client
      .overwritePermissions()
      .id(args.id)
      .permissions(args.permissions)
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
