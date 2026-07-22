import type { Metadata, Viewport } from "next";
import { getConfig } from "@/lib/config";
import "./globals.css";

const config = getConfig();

export const metadata: Metadata = {
  title: `${config.siteName} — personal site`,
  description: config.siteTagline,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#faf8f4",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
