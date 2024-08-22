import * as React from "react";
import { createBrowserRouter } from "react-router-dom";

import { ErrorPage, Home, Program, Store } from "./pages";
import { Root } from "./root";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "",
        element: <Home />,
      },
      {
        path: "store",
        element: <Store />,
      },
      {
        path: "program",
        element: <Program />,
      },
    ],
  },
]);
