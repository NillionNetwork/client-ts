import { ActionId, Permissions, StoreId } from "@nillion/client-core";
import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";

import { useNillion } from "../use-nillion";
import { createPermissionsCacheKey } from "./types";

type TData = ActionId;

type TError = Error;

interface TVariables {
  id: StoreId | string;
  permissions: Permissions;
}

export type SetPermissionsArgs = object;

export type SetPermissionsOverrides = Partial<
  UseMutationOptions<TData, TError, TVariables>
>;

export type UseSetPermissionsResult = UseMutationResult<
  TData,
  TError,
  TVariables
>;

export const useSetPermissions = (
  _args: SetPermissionsArgs = {},
  overrides: SetPermissionsOverrides = {},
): UseSetPermissionsResult => {
  const nillionClient = useNillion();
  const queryClient = useQueryClient();

  const mutationFn = async (args: TVariables): Promise<TData> => {
    const response = await nillionClient.setPermissions(args);
    if (response.err) throw response.err as TError;
    return response.ok;
  };

  const onSuccess = (_id: TData, variables: TVariables): void => {
    const queryKey = createPermissionsCacheKey(variables.id);
    queryClient.setQueryData(queryKey, variables.permissions);
  };

  return useMutation({
    mutationFn,
    onSuccess,
    ...overrides,
  });
};
