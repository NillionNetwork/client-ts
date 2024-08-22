import * as React from "react";
import { RouterProvider } from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@mui/joy";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { NillionClientProvider } from "@nillion/client-react-hooks";

import { client } from "./nillion";
import { router } from "./router";
import { theme } from "./theme";

export function App() {
  return (
    <CssBaseline>
      <ThemeProvider theme={theme}>
        <NillionClientProvider client={client}>
          <RouterProvider router={router} />
          <ReactQueryDevtools initialIsOpen={false} />
        </NillionClientProvider>
      </ThemeProvider>
    </CssBaseline>
  );
}
