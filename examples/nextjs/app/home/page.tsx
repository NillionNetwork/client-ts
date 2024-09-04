"use client";

import { type FC } from "react";
import { Box } from "@mui/material";

import {
  Compute,
  ComputeOutput,
  DeleteValue,
  FetchStoreAcl,
  FetchValue,
  Login,
  SetStoreAcl,
  StoreProgram,
  StoreValue,
  UpdateValue,
} from "@/app/components";

const LoginLayout: FC = () => {
  return (
    <Box sx={{ m: 4, display: "flex", flexDirection: "column", gap: 4 }}>
      <Login />
      <StoreValue />
      <FetchValue />
      <UpdateValue />
      <DeleteValue />
      <SetStoreAcl />
      <FetchStoreAcl />
      <StoreProgram />
      <Compute />
      <ComputeOutput />
    </Box>
  );
};

export default LoginLayout;
