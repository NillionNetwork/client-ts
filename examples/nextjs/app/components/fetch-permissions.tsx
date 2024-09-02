"use client";

import { type FC, useState } from "react";
import { Box, Typography } from "@mui/material";

import { useNilFetchPermissions } from "@nillion/client-react-hooks";

export const FetchPermissions: FC = () => {
  const nilFetchPermissions = useNilFetchPermissions();
  const [id, setId] = useState<string>();

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Fetch permissions
      </Typography>
      <ul>
        <li>
          <Typography sx={{ mt: 2 }}>
            Status: {nilFetchPermissions.status}
          </Typography>
        </li>
        <li>
          <Typography sx={{ mt: 2 }}>
            Id:{" "}
            {nilFetchPermissions.isSuccess
              ? JSON.stringify(nilFetchPermissions.data)
              : "pending"}
          </Typography>
        </li>
      </ul>
    </Box>
  );
};
