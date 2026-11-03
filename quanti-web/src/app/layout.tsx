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
  title: "Quanti | Your daily execution compass.",
  description:
    "Private iOS TestFlight is live. One Active Destination. One 15–20 word physical 1%. Optional HealthKit. Skippable voice. Last night’s mark writes tomorrow.",
  metadataBase: new URL("https://quanti-app.com"),
  icons: {
    icon: "/logo-mark.svg",
    apple: "/logo-mark.svg",
  },
  openGraph: {
    title: "Quanti | Your daily execution compass.",
    description:
      "Private iOS TestFlight is live. One Active Destination. One 15–20 word physical 1%. Optional HealthKit. Skippable voice. Last night’s mark writes tomorrow.",
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
    title: "Quanti | Your daily execution compass.",
    description:
      "Private iOS TestFlight is live. One Active Destination. One 15–20 word physical 1%. Optional HealthKit. Skippable voice. Last night’s mark writes tomorrow.",
    images: ["https://quanti-app.com/og-image.png"],
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
