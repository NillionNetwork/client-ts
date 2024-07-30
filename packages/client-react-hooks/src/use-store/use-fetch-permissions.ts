import { Permissions, StoreId } from "@nillion/client-core";
import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
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
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const response = await nillionClient.fetchPermissions({ id: args.id! });
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
