import type { Metadata } from "next";
import { Roboto } from "next/font/google";

export const metadata: Metadata = {
  title: "Nillion - NextJS",
};

const font = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={font.className}>
      <body>{children}</body>
    </html>
  );
}
