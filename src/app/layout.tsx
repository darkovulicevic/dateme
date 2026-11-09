import type { Metadata, Viewport } from "next";
import { Fraunces, Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

export const metadata: Metadata = {
  title: "Date Me?",
  description: "Would you go on a date with me?",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Date Me?",
    description: "Would you go on a date with me?",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#fbf3ee",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${outfit.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="min-h-full font-sans text-ink">{children}</body>
    </html>
  );
}
