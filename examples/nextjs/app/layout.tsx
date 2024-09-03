import { CssBaseline, ThemeProvider } from "@mui/material";
import { theme } from "@/app/lib";
import { Roboto } from "next/font/google";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nillion - NextJS",
};

const roboto = Roboto({
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
    <html lang="en" className={roboto.className}>
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
