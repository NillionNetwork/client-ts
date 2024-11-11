"use client";

import { useNilDeleteValues } from "@nillion/client-react-hooks";
import { Uuid } from "@nillion/client-vms";
import { type ChangeEvent, type FC, useState } from "react";

export const DeleteValues: FC = () => {
  const mutation = useNilDeleteValues();
  const [id, setId] = useState("");
  const isValidUuid = Uuid.safeParse(id).success;

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    setId(event.target.value.trim());
  }

  function handleClick(): void {
    const options = { id };
    mutation.execute(options);
  }

  return (
    <div>
      <h2>Delete Values</h2>
      <ol>
        <li>Status: {mutation.status}</li>
        <li>
          Id: <input type="text" value={id} onChange={handleChange} />
        </li>
      </ol>
      <button type="button" disabled={!isValidUuid} onClick={handleClick}>
        Execute
      </button>
    </div>
  );
};
