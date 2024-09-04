"use client";

import { type FC, useState } from "react";
import { Save as SaveIcon } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import { Box, TextField, Typography } from "@mui/material";

import { useNilStoreValue } from "@nillion/client-react-hooks";

export const StoreValue: FC = () => {
  const nilStore = useNilStoreValue();
  const [secret, setSecret] = useState<number | null>(null);

  const handleClick = () => {
    if (!secret) throw new Error("store-value: Value required");
    nilStore.execute({ name: "data", data: secret, ttl: 1 }!);
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
      <Typography variant="h5">Store Secret Integer</Typography>
      <Box sx={{ mb: 4 }} />
      <TextField
        fullWidth
        label="Secret value"
        value={secret ? secret : ""}
        type="number"
        onChange={(e) => {
          setSecret(Number(e.target.value));
        }}
      />
      <LoadingButton
        variant="outlined"
        sx={{ width: "150px", mt: 4 }}
        startIcon={<SaveIcon />}
        loading={nilStore.isLoading}
        onClick={handleClick}
        disabled={!secret || nilStore.isLoading}
      >
        Save
      </LoadingButton>
      <ul>
        <li>
          <Typography sx={{ mt: 2 }}>Status: {nilStore.status}</Typography>
        </li>
        <li>
          <Typography sx={{ mt: 2 }}>
            Id: {nilStore.isSuccess ? nilStore.data : "idle"}
          </Typography>
        </li>
      </ul>
    </Box>
  );
};
