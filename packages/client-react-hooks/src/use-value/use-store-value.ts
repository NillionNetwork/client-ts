import {
  Days,
  NadaPrimitiveValue,
  NamedValue,
  Permissions,
  StoreId,
} from "@nillion/client-core";
import type { StoreValueArgs as ClientStoreValueArgs } from "@nillion/client-vms";
import { useNillion } from "../use-nillion";
import type { UseMutationOptions } from "@tanstack/react-query";
import {
  useMutation,
  UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";
import { createKey } from "./types";

type TData = StoreId;

type TError = Error;

export interface TVariables {
  values: Record<
    NamedValue | string,
    NadaPrimitiveValue | ClientStoreValueArgs
  >;
  ttl: Days | number;
  permissions?: Permissions;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface StoreValueArgs {}

export type StoreValueOverrides = Partial<
  UseMutationOptions<TData, TError, TVariables>
>;

export type UseStoreValueResult = UseMutationResult<TData, TError, TVariables>;

export function useStoreValue(
  _args: StoreValueArgs = {},
  overrides: StoreValueOverrides = {},
): UseStoreValueResult {
  const nillionClient = useNillion();
  const queryClient = useQueryClient();

  const mutationFn = async (args: TVariables): Promise<TData> => {
    const response = await nillionClient.store(args);
    if (response.err) throw response.err as Error;
    return response.ok;
  };

  const onSuccess = (data: TData, variables: TVariables): void => {
    const key = createKey(data);
    queryClient.setQueryData(key, variables.values);
  };

  return useMutation({
    mutationFn,
    onSuccess,
    ...overrides,
  });
}
