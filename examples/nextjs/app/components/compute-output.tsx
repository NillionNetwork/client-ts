"use client";

import { type FC, useState } from "react";
import { Box, Typography } from "@mui/material";

import { useNilComputeOutput } from "@nillion/client-react-hooks";

export const ComputeOutput: FC = () => {
  const nilComputeOutput = useNilComputeOutput();
  const [id, setId] = useState<string>();

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Fetch compute output
      </Typography>
      <ul>
        <li>
          <Typography sx={{ mt: 2 }}>
            Status: {nilComputeOutput.status}
          </Typography>
        </li>
        <li>
          <Typography sx={{ mt: 2 }}>
            Id:{" "}
            {nilComputeOutput.isSuccess
              ? JSON.stringify(nilComputeOutput.data)
              : "pending"}
          </Typography>
        </li>
      </ul>
    </Box>
  );
};
