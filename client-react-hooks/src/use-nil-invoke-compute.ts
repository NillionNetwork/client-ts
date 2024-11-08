import type {
  InputBindings,
  NadaValue,
  OutputBindings,
  ProgramId,
  Uuid,
} from "@nillion/client-vms";
import { useMutation } from "@tanstack/react-query";
import { type UseNilHook, nilHookBaseResult } from "./nil-hook-base";
import { useNillion } from "./use-nillion";

interface ExecuteArgs {
  programId: ProgramId | string;
  inputBindings: InputBindings[];
  outputBindings: OutputBindings[];
  valueIds: Uuid[];
  computeTimeValues: { name: string; value: NadaValue }[];
}
type ExecuteResult = Uuid;

type UseNilCompute = UseNilHook<ExecuteArgs, ExecuteResult>;

export const useNilInvokeCompute = (): UseNilCompute => {
  const { client } = useNillion();

  const mutationFn = async (args: ExecuteArgs): Promise<ExecuteResult> => {
    const {
      programId,
      valueIds,
      computeTimeValues,
      inputBindings,
      outputBindings,
    } = args;

    const builder = client.invokeCompute().program(programId);
    builder.valueIds(...valueIds);

    for (const { party, user } of inputBindings) {
      builder.inputParty(party, user);
    }

    for (const { party, users } of outputBindings) {
      builder.outputParty(party, users);
    }

    for (const { name, value } of computeTimeValues) {
      builder.computeTimeValues(name, value);
    }

    return builder.build().invoke();
  };

  const mutate = useMutation({
    mutationFn,
  });

  return {
    execute: (args: ExecuteArgs) => {
      mutate.mutate(args);
    },
    executeAsync: async (args: ExecuteArgs) => mutate.mutateAsync(args),
    ...nilHookBaseResult(mutate),
  };
};
