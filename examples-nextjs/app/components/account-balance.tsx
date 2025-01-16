"use client";

import { useNilAccountBalance } from "@nillion/client-react-hooks";
import type { FC } from "react";

export const AccountBalance: FC = () => {
  const mutation = useNilAccountBalance();

  let data = "";
  if (mutation.isSuccess) {
    // stringify cannot handle BigInts
    data = JSON.stringify(mutation.data, (_, v) =>
      typeof v === "bigint" ? v.toString() : v,
    );
  } else if (mutation.isError) {
    data = mutation.error.message;
  }

  return (
    <div>
      <h2>Account Balance</h2>
      <ol>
        <li>Status: {mutation.status}</li>
        <li>Result: {data}</li>
      </ol>
      <button type="button" onClick={(): void => mutation.execute()}>
        Execute
      </button>
    </div>
  );
};
