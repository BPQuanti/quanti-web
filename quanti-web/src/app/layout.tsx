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
  title: "Quanti — Intelligent Financial Analytics",
  description: "Track, analyze, and optimize your personal finances with Quanti.",
  metadataBase: new URL("https://quanti-app.com"),
  openGraph: {
    title: "Quanti — Intelligent Financial Analytics",
    description: "Track, analyze, and optimize your personal finances with Quanti.",
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
    title: "Quanti — Intelligent Financial Analytics",
    description: "Track, analyze, and optimize your personal finances with Quanti.",
    images: ["https://quanti-app.com/og-image.png"],
  },
  other: {
    "apple-itunes-app": "app-id=YOUR_APP_ID",
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
