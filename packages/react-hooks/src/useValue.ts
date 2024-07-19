import { NadaPrimitiveValue, StoreId } from "@nillion/client";
import { useState } from "react";
import { useNillion } from "./useNillion";

export interface UseNillionValueHook {
  loading: boolean;
  error?: Error;
  id: string;
  data: Record<string, NadaPrimitiveValue>;
  store: (value: number) => void;
}

export interface UseNillionValueHookArgs {
  id?: StoreId;
  data?: number;
}

export function useValue(_args?: UseNillionValueHookArgs): UseNillionValueHook {
  const nillion = useNillion();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>();
  const [data, setData] = useState<Record<string, NadaPrimitiveValue>>({});
  const [id, setId] = useState<string>("unset");

  const doStore = async (value: number) => {
    setLoading(true);
    setError(undefined);
    setId("Waiting ...");

    const result = await nillion.client.store({ foo: value });
    if (result.err) {
      setError(result.err);
      setLoading(false);
    } else {
      setId(result.ok);
      setData({ foo: value });
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    id,
    data,
    store: (value) => {
      void doStore(value);
    },
  };
}
