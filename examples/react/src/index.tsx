import * as React from "react";
import ReactDOM from "react-dom/client";

import { App } from "./app";

const root = ReactDOM.createRoot(
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  document.getElementById("root")!,
);

root.render(<App />);
