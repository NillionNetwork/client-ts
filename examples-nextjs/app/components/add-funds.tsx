"use client";

import { useNilAddFunds } from "@nillion/client-react-hooks";
import type { FC } from "react";

export const AddFunds: FC = () => {
  const mutation = useNilAddFunds();

  let result = "";
  if (mutation.isSuccess) {
    result = "Account has been funded";
  } else if (mutation.isError) {
    result = mutation.error.message;
  }

  const args = { amount: BigInt(10) };

  return (
    <div>
      <h2>Add Funds</h2>
      <ol>
        <li>Status: {mutation.status}</li>
        <li>Result: {result}</li>
      </ol>
      <button type="button" onClick={(): void => mutation.execute(args)}>
        Execute
      </button>
    </div>
  );
};
