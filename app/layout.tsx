import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "./components/Analytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Portfolio — Cork Board",
    template: "%s | Portfolio"
  },
  description: "A modern, interactive portfolio website showcasing projects, skills, and professional experience with a unique Windows Explorer-inspired interface.",
  keywords: ["portfolio", "developer", "projects", "skills", "web development"],
  authors: [{ name: "Your Name" }],
  creator: "Your Name",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://yourdomain.com",
    siteName: "Portfolio — Cork Board",
    title: "Portfolio — Cork Board",
    description: "A modern, interactive portfolio website showcasing projects, skills, and professional experience.",
    images: [
      {
        url: process.env.NEXT_PUBLIC_SITE_URL 
          ? `${process.env.NEXT_PUBLIC_SITE_URL}/og-image.jpg`
          : "https://yourdomain.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Portfolio — Cork Board",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Portfolio — Cork Board",
    description: "A modern, interactive portfolio website showcasing projects, skills, and professional experience.",
    images: [
      process.env.NEXT_PUBLIC_SITE_URL 
        ? `${process.env.NEXT_PUBLIC_SITE_URL}/og-image.jpg`
        : "https://yourdomain.com/og-image.jpg"
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com'),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
