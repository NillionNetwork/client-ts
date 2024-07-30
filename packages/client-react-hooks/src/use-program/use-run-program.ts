import {
  ComputeResultId,
  NadaValues,
  ProgramBindings,
  StoreId,
} from "@nillion/client-core";
import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
} from "@tanstack/react-query";
import { useNillion } from "../use-nillion";

type TData = ComputeResultId;
type TError = Error;

interface TVariables {
  bindings: ProgramBindings;
  values: NadaValues;
  storeIds: (StoreId | string)[];
}

export type UseRunProgramArgs = object;
export type UseRunProgramOverrides = Partial<
  UseMutationOptions<TData, TError, TVariables>
>;
export type UseRunProgramResult = UseMutationResult<TData>;

export const useRunProgram = (
  _args: UseRunProgramArgs = {},
  overrides: UseRunProgramOverrides = {},
) => {
  const nillionClient = useNillion();

  const mutationFn = async (args: TVariables): Promise<TData> => {
    const response = await nillionClient.runProgram(args);
    if (response.err) throw response.err as TError;
    return response.ok;
  };

  return useMutation({
    mutationFn,
    ...overrides,
  });
};
