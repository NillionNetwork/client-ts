import type { UpdatePermissionsBuilder, Uuid } from "@nillion/client-vms";
import { useMutation } from "@tanstack/react-query";
import { type UseNilHook, nilHookBaseResult } from "./nil-hook-base";

interface ExecuteArgs {
  permissions: UpdatePermissionsBuilder;
}
type ExecuteResult = Uuid;

type useNilUpdatePermissions = UseNilHook<ExecuteArgs, ExecuteResult>;

export const useNilUpdatePermissions = (): useNilUpdatePermissions => {
  const mutationFn = async (args: ExecuteArgs): Promise<ExecuteResult> => {
    return args.permissions.build().invoke();
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
