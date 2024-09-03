"use client";

import { ReactNode } from "react";

import { NillionProvider } from "@nillion/client-react-hooks";

export const ClientWrapper: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  return <NillionProvider network="devnet">{children}</NillionProvider>;
};
