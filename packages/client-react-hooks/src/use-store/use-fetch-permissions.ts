import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";

import { Permissions, StoreId } from "@nillion/client-core";

import { useNillion } from "../use-nillion";
import { createPermissionsCacheKey } from "./types";

type TData = Permissions;

type TError = Error;

export interface FetchPermissionsArgs {
  id: StoreId | string | null;
}

export type FetchPermissionsOverrides = Partial<UseQueryOptions<TData>>;

export type UseFetchPermissionsResult = UseQueryResult<TData>;

export const useFetchPermissions = (
  args: FetchPermissionsArgs,
  overrides: FetchPermissionsOverrides = {},
): UseFetchPermissionsResult => {
  const nillionClient = useNillion();
  const queryKey = createPermissionsCacheKey(args.id);
  const enabled = !!args.id;

  const queryFn = async (): Promise<TData> => {
    if (!args.id)
      throw new Error(`args.id is not defined: ${JSON.stringify(args)}`);

    const response = await nillionClient.fetchPermissions({ id: args.id });
    if (response.err) throw response.err as TError;
    return response.ok;
  };

  return useQuery({
    enabled,
    queryKey,
    retry: false,
    queryFn,
    ...overrides,
  });
};
