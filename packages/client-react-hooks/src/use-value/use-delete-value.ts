import { StoreId } from "@nillion/client-core";
import { useNillion } from "../use-nillion";
import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";
import { createKey } from "./types";

type TData = StoreId;
type TError = Error;
type TVariables = StoreId | string;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DeleteValueArgs {}

export type DeleteValueOverrides = Partial<
  UseMutationOptions<TData, TError, TVariables>
>;

export type UseDeleteValueResult = UseMutationResult<TData, TError, TVariables>;

export function useDeleteValue(
  _args: DeleteValueArgs = {},
  overrides: DeleteValueOverrides = {},
): UseDeleteValueResult {
  const nillionClient = useNillion();
  const queryClient = useQueryClient();

  const mutationFn = async (id: TVariables): Promise<TData> => {
    const parsed = StoreId.parse(id);
    const response = await nillionClient.deleteValues({ id: parsed });

    if (response.err) throw response.err as TError;

    await queryClient.invalidateQueries({ queryKey: createKey(id) });
    return response.ok;
  };

  return useMutation({
    mutationFn,
    ...overrides,
  });
}
