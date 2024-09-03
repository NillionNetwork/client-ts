"use client";

import { type FC, useState } from "react";
import { GetApp as GetIcon } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import { Box, TextField, Typography } from "@mui/material";

import { useNilFetchStoreAcl } from "@nillion/client-react-hooks";

export const FetchStoreAcl: FC = () => {
  const nilFetchStoreAcl = useNilFetchStoreAcl();
  const [id, setId] = useState<string>("");

  const handleClick = () => {
    if (!id) throw new Error("fetch-store-acl: Id is required");
    nilFetchStoreAcl.execute({ id });
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
      <Typography variant="h5" gutterBottom>
        Fetch Store Acl
      </Typography>
      <Typography variant="body2">
        Info: Currently, fetch-acl can only return an empty acl object.
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
        loading={nilFetchStoreAcl.isLoading}
        onClick={handleClick}
        disabled={!id || nilFetchStoreAcl.isLoading}
      >
        Fetch
      </LoadingButton>
      <ul>
        <li>
          <Typography sx={{ mt: 2 }}>
            Status: {nilFetchStoreAcl.status}
          </Typography>
        </li>
        <li>
          <Typography sx={{ mt: 2 }}>
            Acl:{" "}
            {nilFetchStoreAcl.isSuccess
              ? JSON.stringify(nilFetchStoreAcl.data)
              : "idle"}
          </Typography>
        </li>
      </ul>
    </Box>
  );
};
