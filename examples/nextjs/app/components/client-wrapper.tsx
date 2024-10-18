"use client";

import { type FC, ReactNode } from "react";

import { NillionProvider } from "@nillion/client-react-hooks";

export const ClientWrapper: FC<{ children: ReactNode }> = ({ children }) => {
  return <NillionProvider network="devnet">{children}</NillionProvider>;
};
