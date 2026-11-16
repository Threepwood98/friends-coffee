import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import localFont from "next/font/local";

import { exampleBusinessDetails, siteUrl } from "@/lib/site";

import "./globals.css";

const friendsLettering = localFont({
  src: "./fonts/GABRWFFR.ttf",
  variable: "--font-friends",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${exampleBusinessDetails.name} | Menú`,
    template: `%s | ${exampleBusinessDetails.name}`,
  },
  description: exampleBusinessDetails.description,
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: exampleBusinessDetails.name,
  },
  twitter: {
    card: "summary_large_image",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFF8EF" },
    { media: "(prefers-color-scheme: dark)", color: "#271F15" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${friendsLettering.variable} ${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-dvh flex-col">{children}</body>
    </html>
  );
}
