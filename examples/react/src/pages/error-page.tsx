import * as React from "react";
import { useRouteError } from "react-router-dom";
import { Box, Typography } from "@mui/joy";

export const ErrorPage = () => {
  const error = useRouteError() as { statusText?: string; message?: string };
  console.error(error);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        height: "100vh",
      }}
    >
      <Typography level="h1">Oops!</Typography>
      <Typography>Sorry, an unexpected error has occurred.</Typography>
      <Typography>{error.statusText ?? error.message ?? "Unknown"}</Typography>
    </Box>
  );
};
