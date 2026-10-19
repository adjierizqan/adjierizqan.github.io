import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { SITE_URL } from "@/data/personal-site";

// Fonts are self-hosted from app/fonts so builds never fetch from Google Fonts.
// Licences: app/fonts/LICENSE-*.txt (SIL OFL 1.1).
const grotesk = localFont({
  src: "./fonts/schibsted-grotesk-latin-wght-normal.woff2",
  variable: "--font-grotesk",
  weight: "400 900",
  display: "swap",
});

const literata = localFont({
  src: [
    { path: "./fonts/literata-latin-wght-normal.woff2", style: "normal" },
    { path: "./fonts/literata-latin-wght-italic.woff2", style: "italic" },
  ],
  variable: "--font-literata",
  weight: "200 900",
  display: "swap",
});

// Used only by the archived Workspace at /workspace/.
const geistSans = localFont({ src: "./fonts/Geist-Variable.woff2", variable: "--font-geist-sans", weight: "100 900", display: "swap" });
const geistMono = localFont({ src: "./fonts/GeistMono-Variable.woff2", variable: "--font-geist-mono", weight: "100 900", display: "swap" });

const description =
  "Adjie Rizqan, software and full-stack engineer. Operational software for a hospital laboratory, and applied computer vision research.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Adjie Rizqan — Software Engineer",
  description,
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Adjie Rizqan",
    title: "Adjie Rizqan — Software Engineer",
    description,
    images: ["/projects/labstock/thumb-reset-a.jpg"],
  },
  twitter: { card: "summary_large_image", title: "Adjie Rizqan — Software Engineer", description, images: ["/projects/labstock/thumb-reset-a.jpg"] },
};

export const viewport: Viewport = { themeColor: "#f5f6f3" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${grotesk.variable} ${literata.variable} ${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body>{children}</body>
    </html>
  );
}
