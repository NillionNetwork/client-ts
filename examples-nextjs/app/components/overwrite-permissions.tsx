"use client";

import { useNilOverwritePermissions } from "@nillion/client-react-hooks";
import { type ChangeEvent, type FC, useState } from "react";

export const OverwritePermissions: FC = () => {
  const mutation = useNilOverwritePermissions();

  return (
    <div>
      <h2>Overwrite Permissions</h2>
      <ol>
        <li>Status: {mutation.status}</li>
        <li>TODO</li>
      </ol>
    </div>
  );
};
