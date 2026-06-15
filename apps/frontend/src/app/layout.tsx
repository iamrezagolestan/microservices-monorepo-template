import "../styles/globals.css";
import { Vazirmatn } from 'next/font/google'

import type { ReactNode } from "react";
import { ObservabilityInit } from "./observability-init";
import { Providers } from "./providers";

export const metadata = { title: "Platform" };

const vazirmatn = Vazirmatn({
  subsets: ['arabic'],
})

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning className={vazirmatn.className}>
      <body className="min-h-screen bg-white text-slate-900 antialiased">
        <Providers>
          <ObservabilityInit />
          {children}
        </Providers>
      </body>
    </html>
  );
}
