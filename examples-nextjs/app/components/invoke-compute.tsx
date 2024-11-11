"use client";

import {
  useNilInvokeCompute,
  useNilOverwritePermissions,
  useNillion,
} from "@nillion/client-react-hooks";
import { NadaValue, ProgramId, Uuid } from "@nillion/client-vms";
import { type ChangeEvent, type FC, useState } from "react";

export const InvokeCompute: FC = () => {
  const { client } = useNillion();
  const mutation = useNilInvokeCompute();
  const [programId, setProgramId] = useState("");
  const isValidProgramId = ProgramId.safeParse(programId).success;

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    setProgramId(event.target.value);
  }

  function handleClick(): void {
    // Assumes addition_division.py
    const options = {
      programId,
      inputBindings: [{ party: "Party1", user: client.id }],
      outputBindings: [{ party: "Party1", users: [client.id] }],
      valueIds: [],
      computeTimeValues: [
        {
          name: "A",
          value: NadaValue.new_secret_integer("10"),
        },
        {
          name: "B",
          value: NadaValue.new_secret_integer("4"),
        },
      ],
    };
    mutation.execute(options);
  }

  let resultId = "";
  if (mutation.isSuccess) {
    resultId = mutation.data;
  } else if (mutation.isError) {
    resultId = mutation.error.message;
  }

  return (
    <div>
      <h2>Invoke Compute</h2>
      <ol>
        <li>Status: {mutation.status}</li>
        <li>
          Program id:{" "}
          <input type="text" value={programId} onChange={handleChange} />
        </li>
        <li>Compute result id: {resultId}</li>
      </ol>
      <button type="button" disabled={!isValidProgramId} onClick={handleClick}>
        Execute
      </button>
    </div>
  );
};
