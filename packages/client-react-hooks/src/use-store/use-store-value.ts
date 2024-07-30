import {
  Days,
  NadaPrimitiveValue,
  NamedValue,
  Permissions,
  StoreId,
} from "@nillion/client-core";
import type { StoreValueArgs as ClientStoreValueArgs } from "@nillion/client-vms";
import type { UseMutationOptions } from "@tanstack/react-query";
import {
  useMutation,
  UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";
import { useNillion } from "../use-nillion";
import { createStoreCacheKey } from "./types";

type TData = StoreId;

type TError = Error;

interface TVariables {
  values: Record<
    NamedValue | string,
    NadaPrimitiveValue | ClientStoreValueArgs
  >;
  ttl: Days | number;
  permissions?: Permissions;
}

export type StoreValueArgs = object;

export type StoreValueOverrides = Partial<
  UseMutationOptions<TData, TError, TVariables>
>;

export type UseStoreValueResult = UseMutationResult<TData, TError, TVariables>;

export const useStoreValue = (
  _args: StoreValueArgs = {},
  overrides: StoreValueOverrides = {},
): UseStoreValueResult => {
  const nillionClient = useNillion();
  const queryClient = useQueryClient();

  const mutationFn = async (args: TVariables): Promise<TData> => {
    const response = await nillionClient.store(args);
    if (response.err) throw response.err as Error;
    return response.ok;
  };

  const onSuccess = (id: TData, variables: TVariables): void => {
    const queryKey = createStoreCacheKey(id);
    // TODO(tim): is it better to store with its type, eg, `type: IntegerSecret`?
    queryClient.setQueryData(queryKey, variables.values);
  };

  return useMutation({
    mutationFn,
    onSuccess,
    ...overrides,
  });
};
