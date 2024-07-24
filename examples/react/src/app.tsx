import * as React from "react";
import { NillionClientProvider } from "@nillion/client-react-hooks";
import { NillionClient } from "@nillion/client-vms";
import { CssBaseline, extendTheme, ThemeProvider } from "@mui/joy";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Root } from "./root";
import { ErrorPage } from "./error-page";
import { Store, ViewStore } from "./store";
import { Home } from "./home";
import { createSignerFromKey } from "@nillion/client-payments";

const client = NillionClient.create({
  network: "TestFixture",
  userSeed: "thm",
  nodeSeed: "thm",

  overrides: async () => {
    const signer = await createSignerFromKey(
      "5c98e049ceca4e2c342516e1b81c689e779da9dbae64ea6b92d52684a92095e6",
    );
    return {
      signer,
      endpoint: "http://localhost:8080/nilchain",
    };
  },
});

const theme = extendTheme({});
const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "stores",
        element: <Store />,
      },
      {
        path: "stores/:id",
        element: <ViewStore />,
      },
    ],
  },
]);

export function App() {
  return (
    <CssBaseline>
      <ThemeProvider theme={theme}>
        <NillionClientProvider client={client}>
          <RouterProvider router={router} />
        </NillionClientProvider>
      </ThemeProvider>
    </CssBaseline>
  );
}
