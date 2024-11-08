"use client";

import {
  useNilInvokeCompute,
  useNilOverwritePermissions,
} from "@nillion/client-react-hooks";
import { type ChangeEvent, type FC, useState } from "react";

export const InvokeCompute: FC = () => {
  const mutation = useNilInvokeCompute();

  return (
    <div>
      <h2>Invoke Compute</h2>
      <ol>
        <li>Status: {mutation.status}</li>
        <li>TODO</li>
      </ol>
    </div>
  );
};
