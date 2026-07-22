import type { Metadata, Viewport } from "next";
import { Google_Sans, Google_Sans_Code } from "next/font/google";
import { getConfig } from "@/lib/config";
import "./globals.css";

const googleSans = Google_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-google-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const googleSansCode = Google_Sans_Code({
  subsets: ["latin", "latin-ext"],
  variable: "--font-google-sans-code",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

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
      className={`${googleSans.variable} ${googleSansCode.variable} h-full`}
    >
      <body className={`${googleSans.className} min-h-full antialiased`}>
        {children}
      </body>
    </html>
  );
}
