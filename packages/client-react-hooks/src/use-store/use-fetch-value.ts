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

type TData = Record<NamedValue, NadaPrimitiveValue>;
type TError = Error;

interface FetchValueArgs {
  id: StoreId | string | null;
  name: NamedValue | string;
  type: NadaValueType;
}

export type FetchValueOverrides = Partial<UseQueryOptions<TData>>;

export type UseFetchValueResult = UseQueryResult<TData>;

export const useFetchValue = (
  args: FetchValueArgs,
  overrides: FetchValueOverrides = {},
): UseFetchValueResult => {
  const nillionClient = useNillion();
  const enabled = !!args.id;
  const queryKey = createStoreCacheKey(args.id);

  const queryFn = async (): Promise<TData> => {
    const id = StoreId.parse(args.id);
    const response = await nillionClient.fetch({
      ...args,
      id,
    });
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
