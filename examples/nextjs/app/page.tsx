import { type FC } from "react";
import { Box } from "@mui/material";

import {
  ClientWrapper,
  Compute,
  ComputeOutput,
  DeleteValue,
  FetchPermissions,
  FetchValue,
  Login,
  SetPermissions,
  StoreProgram,
  StoreValue,
  UpdateValue,
} from "@/app/components";

const LoginLayout: FC = () => {
  return (
    <ClientWrapper>
      <Box sx={{ m: 4, display: "flex", flexDirection: "column", gap: 4 }}>
        <Login />
        <StoreValue />
        <FetchValue />
        <UpdateValue />
        <DeleteValue />
        <SetPermissions />
        <FetchPermissions />
        <StoreProgram />
        <Compute />
        <ComputeOutput />
      </Box>
    </ClientWrapper>
  );
};

export default LoginLayout;
