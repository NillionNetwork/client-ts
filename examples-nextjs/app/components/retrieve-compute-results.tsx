"use client";

import {
  useNilInvokeCompute,
  useNilOverwritePermissions,
  useNilRetrieveComputeResults,
} from "@nillion/client-react-hooks";
import { type ChangeEvent, type FC, useState } from "react";

export const RetrieveComputeResults: FC = () => {
  const mutation = useNilRetrieveComputeResults();

  return (
    <div>
      <h2>Retrieve Compute Results</h2>
      <ol>
        <li>Status: {mutation.status}</li>
        <li>TODO</li>
      </ol>
    </div>
  );
};
