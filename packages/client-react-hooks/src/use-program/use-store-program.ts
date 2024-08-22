import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
} from "@tanstack/react-query";

import { ProgramId, ProgramName } from "@nillion/client-core";

import { useNillion } from "../use-nillion";

type TData = ProgramId;
type TError = Error;

interface TVariables {
  name: ProgramName | string;
  program: Uint8Array;
}

export type UseProgramArgs = object;
export type UseProgramOverrides = Partial<
  UseMutationOptions<TData, TError, TVariables>
>;
export type UseProgramResult = UseMutationResult<TData>;

export const useStoreProgram = (
  _args: UseProgramArgs = {},
  overrides: UseProgramOverrides = {},
) => {
  const nillionClient = useNillion();

  const mutationFn = async (args: TVariables): Promise<TData> => {
    const response = await nillionClient.storeProgram(args);
    if (response.err) throw response.err as TError;
    return response.ok;
  };

  return useMutation({
    mutationFn,
    ...overrides,
  });
};
