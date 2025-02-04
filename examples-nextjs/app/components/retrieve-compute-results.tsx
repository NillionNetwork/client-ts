"use client";

import {
  useNilInvokeCompute,
  useNilOverwritePermissions,
  useNilRetrieveComputeResults,
} from "@nillion/client-react-hooks";
import { Uuid } from "@nillion/client-vms";
import { type ChangeEvent, type FC, useState } from "react";

export const RetrieveComputeResults: FC = () => {
  const mutation = useNilRetrieveComputeResults();
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
    setId(event.target.value);
  }

  function handleClick(): void {
    const options = { id };
    mutation.execute(options);
  }

  return (
    <div>
      <h2>Retrieve Compute Results</h2>
      <ol>
        <li>Status: {mutation.status}</li>
        <li>
          Result Id: <input type="text" value={id} onChange={handleChange} />
        </li>
        <li>Results: {data}</li>
      </ol>
      <button type="button" disabled={!isValidUuid} onClick={handleClick}>
        Execute
      </button>
    </div>
  );
};
