import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { getConfig } from "@/lib/config";
import "./globals.css";

const config = getConfig();

export const metadata: Metadata = {
  title: `${config.siteName}`,
  description: config.siteTagline,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} h-full`}
    >
      <body className={`${GeistSans.className} min-h-full antialiased`}>
        {children}
      </body>
    </html>
  );
}
