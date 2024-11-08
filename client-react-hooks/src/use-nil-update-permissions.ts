import type {
  ComputePermissionCommandBuilder,
  PermissionCommandBuilder,
  Uuid,
} from "@nillion/client-vms";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type UseNilHook, nilHookBaseResult } from "./nil-hook-base";
import { useNillion } from "./use-nillion";

interface ExecuteArgs {
  id: Uuid;
  retrieve?: PermissionCommandBuilder;
  update?: PermissionCommandBuilder;
  _delete?: PermissionCommandBuilder;
  compute?: ComputePermissionCommandBuilder;
}
type ExecuteResult = Uuid;

type useNilUpdatePermissions = UseNilHook<ExecuteArgs, ExecuteResult>;

export const useNilUpdatePermissions = (): useNilUpdatePermissions => {
  const { client } = useNillion();
  const queryClient = useQueryClient();

  const mutationFn = async (args: ExecuteArgs): Promise<ExecuteResult> => {
    const { id, retrieve, update, _delete, compute } = args;
    const builder = client.updatePermissions().valuesId(id);

    if (retrieve) {
      builder.retrieve(retrieve);
    }

    if (update) {
      builder.update(update);
    }

    if (_delete) {
      builder.delete(_delete);
    }

    if (compute) {
      builder.compute(compute);
    }

    return builder.build().invoke();
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
