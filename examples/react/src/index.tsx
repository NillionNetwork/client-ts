import { App } from "./App";
import React from "react";
import ReactDOM from "react-dom/client";
import debug from "debug";

export const logger = debug("nillion:demo:react");
debug.enable("nillion:*");

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);

root.render(<App />);
