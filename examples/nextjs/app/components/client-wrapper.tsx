"use client";

import { ReactNode } from "react";
import { ThemeProvider } from "@emotion/react";
import { CssBaseline } from "@mui/material";

import { NillionProvider } from "@nillion/client-react-hooks";

import { theme } from "@/app/lib";

export const ClientWrapper: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  return (
    <>
      <CssBaseline />
      <ThemeProvider theme={theme}>
        <NillionProvider network="devnet">{children}</NillionProvider>
      </ThemeProvider>
    </>
  );
};
