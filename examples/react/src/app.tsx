import * as React from "react";
import { NillionClientProvider } from "@nillion/react-hooks";
import { NillionClient, PrivateKeyBase16 } from "@nillion/client";
import { CssBaseline, extendTheme, ThemeProvider } from "@mui/joy";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Root } from "./root";
import { ErrorPage } from "./error-page";
import { Store, ViewStore } from "./store";
import { Home } from "./home";
import { NamedNetwork, NodeSeed, Url, UserSeed } from "@nillion/core";
import { createSignerFromKey } from "@nillion/payments";

const client = NillionClient.create({
  network: NamedNetwork.enum.Devnet,

  overrides: async () => {
    const signer = await createSignerFromKey(
      PrivateKeyBase16.parse(
        "9a975f567428d054f2bf3092812e6c42f901ce07d9711bc77ee2cd81101f42c5",
      ),
    );
    return {
      endpoint: Url.parse("http://localhost:8080/nilchain"),
      signer,
      userSeed: UserSeed.parse("nillion-testnet-seed-1"),
      nodeSeed: NodeSeed.parse("nillion-testnet-seed-1"),
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
