"use client";

import {
  useNilOverwritePermissions,
  useNillion,
} from "@nillion/client-react-hooks";
import { Uuid, ValuesPermissionsBuilder } from "@nillion/client-vms";
import { type ChangeEvent, type FC, useMemo, useState } from "react";

export const OverwritePermissions: FC = () => {
  const { client } = useNillion();
  const mutation = useNilOverwritePermissions();
  const [id, setId] = useState("");
  const isValidUuid = Uuid.safeParse(id).success;
  const permissions = useMemo(
    () => ValuesPermissionsBuilder.default(client.id),
    [client.id],
  );

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    setId(event.target.value);
  }

  function handleClick(): void {
    const options = { id, permissions };
    mutation.execute(options);
  }

  return (
    <div>
      <h2>Overwrite Permissions</h2>
      <ol>
        <li>Status: {mutation.status}</li>
        <li>New permissions: {JSON.stringify(permissions.toObject())}</li>
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
