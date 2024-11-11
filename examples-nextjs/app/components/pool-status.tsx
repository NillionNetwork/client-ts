"use client";

import { useNilPoolStatus } from "@nillion/client-react-hooks";
import type { FC } from "react";

export const PoolStatus: FC = () => {
  const mutation = useNilPoolStatus();

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
      <h2>Query Pool Status</h2>
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
