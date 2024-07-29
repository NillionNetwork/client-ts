import {
  NadaPrimitiveValue,
  NadaValueType,
  NamedValue,
  StoreId,
} from "@nillion/client-core";
import { useNillion } from "../use-nillion";
import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import { createKey } from "./types";

type TData = Record<NamedValue, NadaPrimitiveValue>;
type TError = Error;

interface FetchValueArgs {
  id: StoreId | string | null;
  name: NamedValue | string;
  type: NadaValueType;
}

export type UseFetchValueResult = UseQueryResult<TData>;

export type FetchValueOverrides = Partial<UseQueryOptions<TData>>;

export function useFetchValue(
  args: FetchValueArgs,
  overrides: FetchValueOverrides = {},
): UseFetchValueResult {
  const nillionClient = useNillion();

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
    queryKey: createKey(args.id),
    enabled: !!args.id,
    retry: false,
    queryFn,
    ...overrides,
  });
}
