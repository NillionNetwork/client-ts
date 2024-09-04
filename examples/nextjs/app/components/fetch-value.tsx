"use client";

import { type FC, useState } from "react";
import { GetApp as GetIcon } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import { Box, TextField, Typography } from "@mui/material";

import { useNilFetchValue } from "@nillion/client-react-hooks";

export const FetchValue: FC = () => {
  const nilFetch = useNilFetchValue({
    type: "SecretInteger",
    staleAfter: 10000,
  });
  const [id, setId] = useState<string>("");

  const handleClick = () => {
    if (!id) throw new Error("fetch-value: Id is required");
    nilFetch.execute({ id, name: "data" });
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
      <Typography variant="h5">Fetch Secret Integer</Typography>
      <Typography variant="body2">
        The hook's 'staleAfter' argument enables caching. Remove the key or set
        it to 0 to disable caching.
      </Typography>
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
        startIcon={<GetIcon />}
        loading={nilFetch.isLoading}
        onClick={handleClick}
        disabled={!id || nilFetch.isLoading}
      >
        Fetch
      </LoadingButton>
      <ul>
        <li>
          <Typography sx={{ mt: 2 }}>Status: {nilFetch.status}</Typography>
        </li>
        <li>
          <Typography sx={{ mt: 2 }}>
            Secret: {nilFetch.isSuccess ? nilFetch.data : "idle"}
          </Typography>
        </li>
      </ul>
    </Box>
  );
};
