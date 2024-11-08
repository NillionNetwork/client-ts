"use client";

import { useNilStoreValues } from "@nillion/client-react-hooks";
import { NadaValue, Uuid } from "@nillion/client-vms";
import { type ChangeEvent, type FC, useState } from "react";

export const UpdateValues: FC = () => {
  const mutation = useNilStoreValues();
  const [updateId, setUpdateId] = useState("");

  const options = {
    values: [{ name: "foo", value: NadaValue.new_secret_integer("77") }],
    ttl: 1,
    update: updateId,
  };

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
    setUpdateId(event.target.value.trim());
  }

  const isValidUuid = Uuid.safeParse(updateId).success;

  return (
    <div>
      <h2>Update Values</h2>
      <ol>
        <li>Status: {mutation.status}</li>
        <li>Data: {data}</li>
      </ol>
      <input type="text" value={updateId} onChange={handleChange} />
      <button
        type="button"
        disabled={!isValidUuid}
        onClick={(): void => mutation.execute(options)}
      >
        Execute
      </button>
    </div>
  );
};
