import { ComputeResultId, NadaPrimitiveValue } from "@nillion/client-core";
import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import { useNillion } from "../use-nillion";
import { createProgramResultCacheKey } from "../use-store";

type TData = Record<string, NadaPrimitiveValue>;
type TError = Error;

interface TVariables {
  id: ComputeResultId | string;
}

export interface UseFetchProgramOutputArgs {
  id: ComputeResultId | string;
}

export type UseFetchProgramOutputOverrides = Partial<
  UseQueryOptions<TData, TError, TVariables>
>;
export type UseFetchProgramOutputResult = UseQueryResult<TData>;

export const useFetchProgramOutput = (
  args: UseFetchProgramOutputArgs,
  overrides: UseFetchProgramOutputOverrides = {},
) => {
  const nillionClient = useNillion();
  const enabled = !!args.id;
  const queryKey = createProgramResultCacheKey(args.id);

  const queryFn = async (): Promise<TData> => {
    const response = await nillionClient.fetchProgramOutput(args);
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
