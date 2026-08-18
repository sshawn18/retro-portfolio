import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { site } from "@/content/site";
import { GoogleAnalytics } from "@next/third-parties/google";

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: `${site.name} — Portfolio`,
  description: site.tagline,
  icons: {
    // Classic 90s headphone emoji rendered as an SVG favicon
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎧</text></svg>",
  },
};

/** GA4 measurement ID — public by design (visible in page source). */
const GA_ID = "G-8NKP2BTF1V";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full ${plexMono.variable}`}>
      <body className="h-full">{children}</body>
      {process.env.NODE_ENV === "production" ? <GoogleAnalytics gaId={GA_ID} /> : null}
    </html>
  );
}
