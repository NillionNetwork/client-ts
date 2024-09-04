"use client";

import { type FC, useState } from "react";
import { Delete as DeleteIcon } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import { Box, TextField, Typography } from "@mui/material";

import { useNilDeleteValue } from "@nillion/client-react-hooks";

export const DeleteValue: FC = () => {
  const nilDelete = useNilDeleteValue();
  const [id, setId] = useState<string>("");

  const handleClick = () => {
    if (!id) throw new Error("delete-value: Id is required");
    nilDelete.execute({ id });
  };

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "grey.400",
        borderRadius: 2,
        p: 2,
      }}
    >
      <Typography variant="h5">Delete Store</Typography>
      <Box sx={{ mb: 4 }} />
      <TextField
        fullWidth
        label="Store identifier"
        value={id}
        onChange={(e) => {
          setId(e.target.value);
        }}
      />
      <LoadingButton
        variant="outlined"
        sx={{ width: "150px", mt: 4 }}
        startIcon={<DeleteIcon />}
        loading={nilDelete.isLoading}
        onClick={handleClick}
        disabled={!id || nilDelete.isLoading}
      >
        Delete
      </LoadingButton>
      <ul>
        <li>
          <Typography sx={{ mt: 2 }}>Status: {nilDelete.status}</Typography>
        </li>
      </ul>
    </Box>
  );
};
