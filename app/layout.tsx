import type { Metadata } from "next";
import "../styles/globals.css";
import {Suspense} from "react";
import {Toaster} from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Handball Referees",
};

export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
        <head>
            <link rel="icon" href="/urbh_logo.png" sizes="any"/>
        </head>
      <body className="h-[100vh] bg-[url('../public/background.png')] bg-no-repeat bg-contain bg-right">
      <Suspense>
          {children}
      </Suspense>
      <Toaster/>
      </body>
    </html>
  );
}
