import type { Metadata, Viewport } from "next";
import { Caveat_Brush, Geist, Geist_Mono } from "next/font/google";

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

const caveatBrush = Caveat_Brush({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
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
      className={`${caveatBrush.variable} ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
