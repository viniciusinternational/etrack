import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "E-Track - Government Performance & Accountability Platform",
  description:
    "A comprehensive platform for tracking government projects, finances, and performance across ministries, departments, and agencies.",
  keywords: [
    "government",
    "accountability",
    "projects",
    "finance",
    "tracking",
    "performance",
  ],
  authors: [{ name: "E-Track Development Team" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

import QueryProvider from "@/providers/query-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full antialiased`}>
        <QueryProvider>
          <div className="w-full max-w-full">{children}</div>
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
