"use client";

import { type FC, useState } from "react";
import { GetApp as GetIcon } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import { Box, TextField, Typography } from "@mui/material";

import { useNilComputeOutput } from "@nillion/client-react-hooks";
import { ComputeOutputId } from "@nillion/client-core";

export const ComputeOutput: FC = () => {
  const nilComputeOutput = useNilComputeOutput();
  const [computeId, setComputeId] = useState<ComputeOutputId | string>("");

  const handleClick = () => {
    if (!computeId) throw new Error("compute-output: Compute id is required");
    nilComputeOutput.execute({ id: computeId });
  };

  let computeOutput = "idle";
  if (nilComputeOutput.isSuccess) {
    // 9f76de18-1120-4759-9e0e-c55b162e9b4d
    computeOutput = JSON.stringify(nilComputeOutput.data, (key, value) => {
      if (typeof value === "bigint") {
        return value.toString();
      }
      return value;
    });
  }

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "grey.400",
        borderRadius: 2,
        p: 2,
      }}
    >
      <Typography variant="h5">Compute Output</Typography>
      <Box sx={{ mb: 4 }} />
      <TextField
        fullWidth
        label="Compute output id"
        value={computeId}
        onChange={(e) => {
          setComputeId(e.target.value);
        }}
      />
      <LoadingButton
        variant="outlined"
        sx={{ width: "150px", mt: 4 }}
        startIcon={<GetIcon />}
        loading={nilComputeOutput.isLoading}
        onClick={handleClick}
        disabled={!computeId || nilComputeOutput.isLoading}
      >
        Fetch
      </LoadingButton>
      <ul>
        <li>
          <Typography sx={{ mt: 2 }}>
            Status: {nilComputeOutput.status}
          </Typography>
        </li>
        <li>
          <Typography sx={{ mt: 2 }}>Output: {computeOutput}</Typography>
        </li>
      </ul>
    </Box>
  );
};
