"use client";

import {
  useNilUpdatePermissions,
  useNillion,
} from "@nillion/client-react-hooks";
import { UpdatePermissionsBuilder, Uuid } from "@nillion/client-vms";
import { type ChangeEvent, type FC, useMemo, useState } from "react";

export const UpdatePermissions: FC = () => {
  const { client } = useNillion();
  const mutation = useNilUpdatePermissions();
  const [id, setId] = useState("");
  const isValidUuid = Uuid.safeParse(id).success;

  const permissions = useMemo(() => {
    return UpdatePermissionsBuilder.init(client)
      .revokeRetrieve(client.id)
      .revokeDelete(client.id);
  }, [client.id]);

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    setId(event.target.value);
  }

  function handleClick(): void {
    const options = { id, permissions };
    mutation.execute(options);
  }

  return (
    <div>
      <h2>Update Permissions</h2>
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
