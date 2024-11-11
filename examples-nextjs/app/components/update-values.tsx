"use client";

import { useNilStoreValues } from "@nillion/client-react-hooks";
import { NadaValue, Uuid } from "@nillion/client-vms";
import { type ChangeEvent, type FC, useState } from "react";

export const UpdateValues: FC = () => {
  const mutation = useNilStoreValues();
  const [id, setId] = useState("");
  const isValidUuid = Uuid.safeParse(id).success;

  let data = "";
  if (mutation.isSuccess) {
    // stringify cannot handle BigInts
    data = data = JSON.stringify(mutation.data, (_, v) =>
      typeof v === "bigint" ? v.toString() : v,
    );
  } else if (mutation.isError) {
    data = mutation.error.message;
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    setId(event.target.value.trim());
  }

  function handleClick(): void {
    const options = {
      values: [{ name: "foo", value: NadaValue.new_secret_integer("77") }],
      ttl: 1,
      update: id,
    };
    mutation.execute(options);
  }

  return (
    <div>
      <h2>Update Values</h2>
      <ol>
        <li>Status: {mutation.status}</li>
        <li>
          Id: <input type="text" value={id} onChange={handleChange} />
        </li>
        <li>Data: {data}</li>
      </ol>
      <button type="button" disabled={!isValidUuid} onClick={handleClick}>
        Execute
      </button>
    </div>
  );
};
