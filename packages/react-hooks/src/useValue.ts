import { StoreId } from "@nillion/client";
import { useNillion } from "./useNillion";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { NadaValueType } from "@nillion/core";

export type UseNillionValueHook = {
  id: string;
  // eslint-disable-next-line
} & any;

export interface UseNillionValueHookArgs {
  id?: StoreId;
  data?: number;
}

export function useValue(initialId = "") {
  const nillion = useNillion();
  const [id, setId] = useState(initialId);

  const mutate = useMutation({
    mutationKey: [id],
    mutationFn: async (
      value: number,
      // data: Record<string, NadaPrimitiveValue | StoreValueArgs>,
    ) => {
      const result = await nillion.client.store({ foo: value });
      if (result.err) {
        throw result.err as Error;
      }

      setId(result.ok);
      return result.ok;
    },
  });

  const query = useQuery({
    enabled: !!id,
    queryKey: [id],
    queryFn: async () => {
      const result = await nillion.client.fetch(id, [
        ["foo", NadaValueType.enum.IntegerSecret],
      ]);

      if (result.err) {
        throw result.err as Error;
      }
      return result.ok;
    },
  });

  return {
    id,
    mutate,
    query,
  };
}
