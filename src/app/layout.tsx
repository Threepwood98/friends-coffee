import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { exampleBusinessDetails, siteUrl } from "@/lib/site";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${exampleBusinessDetails.name} | Carta`,
    template: `%s | ${exampleBusinessDetails.name}`,
  },
  description: exampleBusinessDetails.description,
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: exampleBusinessDetails.name,
  },
  twitter: {
    card: "summary",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
