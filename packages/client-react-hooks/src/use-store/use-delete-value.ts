import { StoreId } from "@nillion/client-core";
import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";
import { useNillion } from "../use-nillion";
import { createStoreCacheKey } from "./types";

type TData = StoreId;
type TError = Error;
type TVariables = StoreId | string;

export type DeleteValueArgs = object;

export type DeleteValueOverrides = Partial<
  UseMutationOptions<TData, TError, TVariables>
>;

export type UseDeleteValueResult = UseMutationResult<TData, TError, TVariables>;

export const useDeleteValue = (
  _args: DeleteValueArgs = {},
  overrides: DeleteValueOverrides = {},
): UseDeleteValueResult => {
  const nillionClient = useNillion();
  const queryClient = useQueryClient();

  const mutationFn = async (id: TVariables): Promise<TData> => {
    const parsedId = StoreId.parse(id);
    const response = await nillionClient.deleteValues({ id: parsedId });

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
