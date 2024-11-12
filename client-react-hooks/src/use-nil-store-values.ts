import type {
  NadaValue,
  TtlDays,
  Uuid,
  ValuesPermissions,
} from "@nillion/client-vms";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Log } from "./logging";
import { type UseNilHook, nilHookBaseResult } from "./nil-hook-base";
import { createStoreCacheKey } from "./query-cache";
import { useNillion } from "./use-nillion";

type ExecuteArgs = {
  values: { name: string; value: NadaValue }[];
  ttl: TtlDays;
  id?: Uuid;
  permissions?: ValuesPermissions;
};

type ExecuteResult = Uuid;

type UseNilStoreValues = UseNilHook<ExecuteArgs, ExecuteResult>;

export const useNilStoreValues = (): UseNilStoreValues => {
  const { client } = useNillion();
  const queryClient = useQueryClient();

  const mutationFn = async (args: ExecuteArgs): Promise<ExecuteResult> => {
    const { values, ttl, id: updateId, permissions } = args;

    if (!values.length) {
      throw new Error("Values cannot be empty");
    }

    const builder = client.storeValues().ttl(ttl);

    if (permissions) {
      builder.permissions(permissions);
    }

    if (updateId) {
      Log.info("Updating value: %O", updateId);
      builder.id(updateId);
    }

    for (const { name, value } of values) {
      builder.value(name, value);
    }

    const jsSerializable = builder._values.to_record();
    const id = await builder.build().invoke();
    const key = createStoreCacheKey(id);
    queryClient.setQueryData(key, jsSerializable);
    return id;
  };

  const mutate = useMutation({
    mutationFn,
  });

  return {
    execute: (args: ExecuteArgs): void => {
      mutate.mutate(args);
    },
    executeAsync: async (args: ExecuteArgs): Promise<Uuid> =>
      mutate.mutateAsync(args),
    ...nilHookBaseResult(mutate),
  };
};
