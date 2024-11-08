"use client";

import { useNilRetrievePermissions } from "@nillion/client-react-hooks";
import { Uuid } from "@nillion/client-vms";
import { type ChangeEvent, type FC, useState } from "react";

export const RetrievePermissions: FC = () => {
  const mutation = useNilRetrievePermissions({
    staleAfterSeconds: 30,
  });
  const [id, setId] = useState("");

  let data = "";
  if (mutation.isSuccess) {
    data = JSON.stringify(mutation.data.toJson());
  } else if (mutation.isError) {
    data = mutation.error.message;
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    setId(event.target.value);
  }

  const isValidUuid = Uuid.safeParse(id).success;

  return (
    <div>
      <h2>Retrieve Permissions</h2>
      <ol>
        <li>Status: {mutation.status}</li>
        <li>Permissions: {data}</li>
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
