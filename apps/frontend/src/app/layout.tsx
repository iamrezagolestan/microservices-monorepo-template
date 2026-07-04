import "@/styles/globals.css";

import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ObservabilityInit } from "./observability-init";
import { Providers } from "./providers";
import { Vazirmatn } from "next/font/google";

export const metadata: Metadata = { title: "Platform" };

const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
});
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning className={vazirmatn.className}>
      <body className="min-h-screen bg-primary text-primary antialiased">
        <Providers>
          <ObservabilityInit />
          {children}
        </Providers>
      </body>
    </html>
  );
}
