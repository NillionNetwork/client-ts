"use client";

import { type FC, useState } from "react";
import { Box, Typography } from "@mui/material";

import { useNilStoreProgram } from "@nillion/client-react-hooks";

export const SetPermissions: FC = () => {
  const nilSetPermissions = useNilStoreProgram();
  const [id, setId] = useState<string>();

  const [computeAcl, setComputeAcl] = useState<string>();
  const [deleteAcl, setDeleteAcl] = useState<string>();
  const [fetchAcl, setFetchAcl] = useState<string>();
  const [updateAcl, setUpdateAcl] = useState<string>();

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Set permissions
      </Typography>
      <ul>
        <li>
          <Typography sx={{ mt: 2 }}>
            Status: {nilSetPermissions.status}
          </Typography>
        </li>
        <li>
          <Typography sx={{ mt: 2 }}>
            Id:{" "}
            {nilSetPermissions.isSuccess ? nilSetPermissions.data : "pending"}
          </Typography>
        </li>
      </ul>
    </Box>
  );
};
