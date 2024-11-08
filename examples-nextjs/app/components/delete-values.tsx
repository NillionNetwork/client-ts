"use client";

import { useNilDeleteValues } from "@nillion/client-react-hooks";
import { Uuid } from "@nillion/client-vms";
import { type ChangeEvent, type FC, useState } from "react";

export const DeleteValues: FC = () => {
  const mutation = useNilDeleteValues();
  const [id, setId] = useState("");

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    setId(event.target.value.trim());
  }
  const isValidUuid = Uuid.safeParse(id).success;

  return (
    <div>
      <h2>Delete Values</h2>
      <ol>
        <li>Status: {mutation.status}</li>
      </ol>
      <input type="text" value={id} onChange={handleChange} />
      <button
        type="button"
        disabled={!isValidUuid}
        onClick={(): void => mutation.execute({ id })}
      >
        Execute
      </button>
    </div>
  );
};
