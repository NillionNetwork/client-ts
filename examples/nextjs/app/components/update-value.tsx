"use client";

import { type FC, useState } from "react";
import { Save as SaveIcon } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import { Box, TextField, Typography } from "@mui/material";

import { useNilUpdateValue } from "@nillion/client-react-hooks";

export const UpdateValue: FC = () => {
  const nilUpdate = useNilUpdateValue();
  const [id, setId] = useState<string>();
  const [secret, setSecret] = useState<number>();

  const handleUpdate = () => {
    if (!id || !secret)
      throw new Error("update-value: Id and new value required");
    nilUpdate.execute({
      id,
      data: secret,
      ttl: 1,
    });
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Update secret integer
      </Typography>
      <TextField
        fullWidth
        label="Identifier"
        value={id}
        onChange={(e) => {
          setId(e.target.value);
        }}
      />
      <Box sx={{ my: 2 }} />
      <TextField
        fullWidth
        label="New secret value"
        value={secret}
        type="number"
        onChange={(e) => {
          setSecret(Number(e.target.value));
        }}
      />
      <LoadingButton
        variant="outlined"
        sx={{ width: "150px", mt: 4 }}
        startIcon={<SaveIcon />}
        loading={nilUpdate.isLoading}
        onClick={handleUpdate}
        disabled={!secret || !id || nilUpdate.isLoading}
      >
        Update
      </LoadingButton>
      <ul>
        <li>
          <Typography sx={{ mt: 2 }}>Status: {nilUpdate.status}</Typography>
        </li>
        <li>
          <Typography sx={{ mt: 2 }}>
            Id: {nilUpdate.isSuccess ? nilUpdate.data : ""}
          </Typography>
        </li>
      </ul>
    </Box>
  );
};
