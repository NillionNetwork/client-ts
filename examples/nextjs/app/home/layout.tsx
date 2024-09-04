import { type FC } from "react";
import { ClientWrapper } from "@/app/components";

const HomeLayout: FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return <ClientWrapper>{children}</ClientWrapper>;
};

export default HomeLayout;
