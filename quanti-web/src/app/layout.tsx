import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Quanti | Name now. Move 1% toward next.",
  description:
    "Say where you are and where you want to go. Quanti turns overnight signals and a 15-second check into one 1% move for today.",
  metadataBase: new URL("https://quanti-app.com"),
  icons: {
    icon: "/logo-mark.svg",
    apple: "/logo-mark.svg",
  },
  openGraph: {
    title: "Quanti | Name now. Move 1% toward next.",
    description:
      "Say where you are and where you want to go. Quanti turns overnight signals and a 15-second check into one 1% move for today.",
    url: "https://quanti-app.com",
    siteName: "Quanti",
    images: [
      {
        url: "https://quanti-app.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Quanti App Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Quanti | Name now. Move 1% toward next.",
    description:
      "Say where you are and where you want to go. Quanti turns overnight signals and a 15-second check into one 1% move for today.",
    images: ["https://quanti-app.com/og-image.png"],
  },
  other: {
    "apple-itunes-app": "app-id=YOUR_APP_ID",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0b0712] text-[#f8fafc]">{children}</body>
    </html>
  );
}
