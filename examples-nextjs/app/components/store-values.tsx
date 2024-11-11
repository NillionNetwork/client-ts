"use client";

import { useNilStoreValues } from "@nillion/client-react-hooks";
import { NadaValue } from "@nillion/client-vms";
import type { FC } from "react";

export const StoreValues: FC = () => {
  const mutation = useNilStoreValues();

  let id = "";
  if (mutation.isSuccess) {
    id = mutation.data;
  } else if (mutation.isError) {
    id = mutation.error.message;
  }

  const options = {
    values: [{ name: "foo", value: NadaValue.new_secret_integer("42") }],
    ttl: 1,
  };

  const stringifiedOptions = JSON.stringify({
    ...options,
    values: options.values.map(({ name, value }) => ({
      name,
      value: { type: "", value: value.to_integer() },
    })),
  });

  function handleClick(): void {
    mutation.execute(options);
  }

  return (
    <div>
      <h2>Store Values</h2>
      <ol>
        <li>Status: {mutation.status}</li>
        <li>Options: {stringifiedOptions}</li>
        <li>Store Id: {id}</li>
      </ol>
      <button type="button" onClick={handleClick}>
        Execute
      </button>
    </div>
  );
};
