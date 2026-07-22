import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Syne } from "next/font/google";
import { getConfig } from "@/lib/config";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const plex = IBM_Plex_Sans({
  variable: "--font-plex",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const config = getConfig();

export const metadata: Metadata = {
  title: `${config.siteName} — Findings`,
  description: config.siteTagline,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${plex.variable} ${plexMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased">
        <div className="noise" aria-hidden />
        {children}
      </body>
    </html>
  );
}
