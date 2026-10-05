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
  title: "Quanti — The Verified Social Ledger",
  description:
    "Track your real life, log AI-verified stats, and share recaps that actually mean something. Launching soon on iOS.",
  metadataBase: new URL("https://quanti-app.com"),
  openGraph: {
    title: "Quanti — The Verified Social Ledger",
    description:
      "Track your real life, log AI-verified stats, and share recaps that actually mean something.",
    url: "https://quanti-app.com",
    siteName: "Quanti",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0b0712] text-[#f8fafc]">{children}</body>
    </html>
  );
}
