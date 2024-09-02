"use client";

import { type FC, useState } from "react";
import { GetApp as GetIcon } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import { Box, Chip, TextField, Typography } from "@mui/material";

import { useNilFetchValue } from "@nillion/client-react-hooks";

export const FetchValue: FC = () => {
  const nilFetch = useNilFetchValue({
    type: "SecretInteger",
    staleAfter: 10000,
  });
  const [id, setId] = useState<string>("");

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Fetch secret integer
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
                startIcon={<GetIcon />}
                loading={nilFetch.isLoading}
                onClick={() => {
                  nilFetch.execute(id);
                }}
                disabled={!id || nilFetch.isLoading}
              >
                Fetch
              </LoadingButton>
            ),
          },
        }}
      />
      <ul>
        <li>
          <Typography sx={{ mt: 2 }}>
            Status: <Chip label={nilFetch.status} />
          </Typography>
        </li>
        <li>
          <Typography sx={{ mt: 2 }}>
            Secret: {nilFetch.isSuccess ? nilFetch.data : ""}
          </Typography>
        </li>
      </ul>
    </Box>
  );
};
