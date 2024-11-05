import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "@/trpc/react";
import ProgressBarProvider from "../components/progress-bar";

export const metadata: Metadata = {
  title: "MOE Competition",
  description: "Coding competitions for secondary students",
  icons: [{ rel: "icon", url: "/scratch.svg" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <ProgressBarProvider>
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </ProgressBarProvider>
      </body>
    </html>
  );
}
