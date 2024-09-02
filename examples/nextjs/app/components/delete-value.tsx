"use client";

import { type FC, useState } from "react";
import { Delete as DeleteIcon } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import { Box, Chip, TextField, Typography } from "@mui/material";

import { useNilDeleteValue } from "@nillion/client-react-hooks";

export const DeleteValue: FC = () => {
  const nilDelete = useNilDeleteValue();
  const [id, setId] = useState<string>("");

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Delete
      </Typography>
      <TextField
        fullWidth
        label="Store identifier"
        value={id}
        onChange={(e) => {
          setId(e.target.value);
        }}
        slotProps={{
          input: {
            endAdornment: (
              <LoadingButton
                startIcon={<DeleteIcon />}
                loading={nilDelete.isLoading}
                onClick={() => {
                  nilDelete.execute(id);
                }}
                disabled={!id || nilDelete.isLoading}
              >
                Delete
              </LoadingButton>
            ),
          },
        }}
      />
      <ul>
        <li>
          <Typography sx={{ mt: 2 }}>
            Status: <Chip label={nilDelete.status} />
          </Typography>
        </li>
      </ul>
    </Box>
  );
};
