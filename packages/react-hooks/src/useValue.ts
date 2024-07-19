import { NadaValue, NadaValues, StoreId, ValueName } from "@nillion/client";
import { useEffect, useState } from "react";
import { useNillion } from "./useNillion";

export interface UseNillionValueHook {
  loading: boolean;
  error?: Error;
  id: string;
  data: number;
  store: (value: number) => void;
  // fetch: unknown;
  // delete: unknown;
  // update: unknown;
  // fetchPermissions: unknown;
  // setPermissions: unknown;
}

export interface UseNillionValueHookArgs {
  id?: StoreId;
  data?: number;
}

export function useValue(args?: UseNillionValueHookArgs): UseNillionValueHook {
  const nillion = useNillion();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>();
  const [data, setData] = useState<number>(0);
  const [id, setId] = useState<string>("unset");

  useEffect(() => {
    async function run() {
      console.log("running. current value is: ", data);
    }

    void run().catch((e: unknown) => {
      const error = new Error("useValue encountered an error", { cause: e });
      console.error(error);
      setError(error);
    });
  }, [data]);

  const doStore = (value: number) => {
    setLoading(true);
    setError(undefined);
    setId("waiting ...");
    console.log("storing value:", value);
    const values = NadaValues.create().insert(
      ValueName.parse("foo"),
      NadaValue.createIntegerSecret(value),
    );
    nillion.client
      .storeValues({ values })
      .then((result) => {
        if (result.err) {
          setError(result.err);
          setLoading(false);
        } else {
          setId(result.ok);
          setData(value);
          setLoading(false);
        }
      })
      .catch((e) => {
        setError(e);
      });
  };

  return {
    loading,
    error,
    id,
    data,
    store: (value) => {
      doStore(value);
    },
  };
}
