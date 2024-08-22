import {
  NadaPrimitiveValue,
  NadaValueType,
  NamedValue,
  StoreId,
} from "@nillion/client-core";
import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";

import { useNillion } from "../use-nillion";
import { createStoreCacheKey } from "./types";

type TData = NadaPrimitiveValue;
type TError = Error;

interface FetchValueArgs {
  id: StoreId | string | null;
  name: NamedValue | string;
  type: NadaValueType;
}

export type FetchValueOverrides = Partial<UseQueryOptions<TData>>;

export type UseFetchValueResult<T extends TData> = UseQueryResult<T>;

export const useFetchValue = <T extends TData>(
  args: FetchValueArgs,
  overrides: FetchValueOverrides = {},
): UseFetchValueResult<T> => {
  const nillionClient = useNillion();
  const enabled = !!args.id;
  const queryKey = createStoreCacheKey(args.id);

  const queryFn = async (): Promise<T> => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const id = args.id!;

    const response = await nillionClient.fetch({
      ...args,
      id,
    });
    if (response.err) throw response.err as TError;
    return response.ok as T;
  };

  return useQuery({
    enabled,
    queryKey,
    retry: false,
    queryFn,
    ...overrides,
  }) as UseFetchValueResult<T>;
};
