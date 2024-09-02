"use client";

import { type FC, useState } from "react";
import { Save as SaveIcon } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import { Box, TextField, Typography } from "@mui/material";

import { useNilStoreValue } from "@nillion/client-react-hooks";

export const StoreValue: FC = () => {
  const nilStore = useNilStoreValue({ ttl: 1 });
  const [secret, setSecret] = useState<number>();

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Store secret integer
      </Typography>
      <TextField
        fullWidth
        label="Secret value"
        value={secret}
        type="number"
        onChange={(e) => {
          setSecret(Number(e.target.value));
        }}
        slotProps={{
          input: {
            endAdornment: (
              <LoadingButton
                sx={{ ml: 4 }}
                startIcon={<SaveIcon />}
                loading={nilStore.isLoading}
                onClick={() => {
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  nilStore.execute(secret!);
                }}
                disabled={!secret || nilStore.isLoading}
              >
                Save
              </LoadingButton>
            ),
          },
        }}
      />
      <ul>
        <li>
          <Typography sx={{ mt: 2 }}>Status: {nilStore.status}</Typography>
        </li>
        <li>
          <Typography sx={{ mt: 2 }}>
            Id: {nilStore.isSuccess ? nilStore.data : "pending"}
          </Typography>
        </li>
      </ul>
    </Box>
  );
};
