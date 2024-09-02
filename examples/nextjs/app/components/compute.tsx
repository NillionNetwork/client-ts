"use client";

import { type FC, useState } from "react";
import { Box, Typography } from "@mui/material";

import { NadaPrimitiveValue } from "@nillion/client-core";
import { useNilCompute } from "@nillion/client-react-hooks";

export const Compute: FC = () => {
  const nilStoreProgram = useNilCompute();
  const [bindings, setBindings] = useState<string>();
  const [values, setValues] = useState<NadaPrimitiveValue>();
  const [ids, setIds] = useState<string>();

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Compute
      </Typography>
      <ul>
        <li>
          <Typography sx={{ mt: 2 }}>
            Status: {nilStoreProgram.status}
          </Typography>
        </li>
        <li>
          <Typography sx={{ mt: 2 }}>
            Id: {nilStoreProgram.isSuccess ? nilStoreProgram.data : "pending"}
          </Typography>
        </li>
      </ul>
    </Box>
  );
};
