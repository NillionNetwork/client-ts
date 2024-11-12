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
    values: [
      { name: "foo", value: NadaValue.new_secret_integer("42") },
      { name: "bar", value: NadaValue.new_public_integer("23") },
      {
        name: "baz",
        value: NadaValue.new_secret_blob(Uint8Array.from([1, 2, 3])),
      },
    ],
    ttl: 1,
  };

  const stringifiedOptions = JSON.stringify({
    ...options,
    values: options.values.map(({ name, value }) => ({
      name,
      value: {
        type: value.type_name(),
        value:
          value.type_name() === "SecretBlob"
            ? value.to_byte_array()
            : value.to_integer(),
      },
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
