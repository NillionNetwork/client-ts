"use client";

import { useNilUpdatePermissions } from "@nillion/client-react-hooks";
import { Uuid } from "@nillion/client-vms";
import { type ChangeEvent, type FC, useState } from "react";

export const UpdatePermissions: FC = () => {
  const mutation = useNilUpdatePermissions();
  const [id, setId] = useState("");

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    setId(event.target.value);
  }

  const isValidUuid = Uuid.safeParse(id).success;

  return (
    <div>
      <h2>Update Permissions</h2>
      <ol>
        <li>Status: {mutation.status}</li>
        <li>New permissions: {false}</li>
      </ol>
      <input type="text" value={id} onChange={handleChange} />
      <button type="button" disabled={!isValidUuid}>
        Execute
      </button>
    </div>
  );
};
