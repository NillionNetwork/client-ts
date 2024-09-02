"use client";

import { type FC, useState } from "react";
import { Box, Typography } from "@mui/material";

import { useNilStoreProgram } from "@nillion/client-react-hooks";

export const StoreProgram: FC = () => {
  const nilStoreProgram = useNilStoreProgram();
  const [name, setName] = useState<string>();
  const [data, setData] = useState<Uint8Array>();

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Store program
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
