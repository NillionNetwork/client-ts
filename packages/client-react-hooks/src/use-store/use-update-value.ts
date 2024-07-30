import {
  ActionId,
  Days,
  NadaPrimitiveValue,
  NamedValue,
  StoreId,
} from "@nillion/client-core";
import { StoreValueArgs } from "@nillion/client-vms";
import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";
import { useNillion } from "../use-nillion";
import { createStoreCacheKey } from "./types";

type TData = ActionId;
type TError = Error;

interface TVariables {
  id: StoreId | string;
  values: Record<NamedValue | string, NadaPrimitiveValue | StoreValueArgs>;
  ttl: Days | number;
}

export type UpdatedValueArgs = object;

export type UpdateValueOverrides = Partial<
  UseMutationOptions<TData, TError, TVariables>
>;

export type UseUpdateValueResult = UseMutationResult<TData, TError, TVariables>;

export const useUpdateValue = (
  _args: UpdatedValueArgs = {},
  overrides: UpdateValueOverrides = {},
): UseUpdateValueResult => {
  const nillionClient = useNillion();
  const queryClient = useQueryClient();

  const mutationFn = async (args: TVariables): Promise<TData> => {
    const parsedId = StoreId.parse(args.id);
    const response = await nillionClient.update({
      ...args,
      id: parsedId,
    });

    if (response.err) throw response.err as TError;
    await queryClient.invalidateQueries({
      queryKey: createStoreCacheKey(parsedId),
    });
    return response.ok;
  };

  return useMutation({
    mutationFn,
    ...overrides,
  });
};
