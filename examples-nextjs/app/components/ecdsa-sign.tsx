"use client";

import { useNilInvokeCompute, useNillion } from "@nillion/client-react-hooks";
import { Uuid } from "@nillion/client-vms";
import { type ChangeEvent, type FC, useState } from "react";

export const EcdsaSign: FC = () => {
  const { client } = useNillion();
  const mutation = useNilInvokeCompute();
  const [id, setId] = useState("");
  const isValidUuid = Uuid.safeParse(id).success;

  const tecdsaProgramId = "builtin/tecdsa_sign";

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    setId(event.target.value);
  }

  function handleClick(): void {
    // Assumes addition_division.py
    const options = {
      programId: tecdsaProgramId,
      inputBindings: [
        { party: "tecdsa_key_party", user: client.id },
        { party: "tecdsa_digest_message_party", user: client.id },
      ],
      outputBindings: [{ party: "tecdsa_output_party", users: [client.id] }],
      valueIds: [id],
      computeTimeValues: [],
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
        <li> Program id: {tecdsaProgramId}</li>
        <li>
          Id: <input type="text" value={id} onChange={handleChange} />
        </li>
        <li>Compute result id: {resultId}</li>
      </ol>
      <button type="button" disabled={!isValidUuid} onClick={handleClick}>
        Execute
      </button>
    </div>
  );
};
