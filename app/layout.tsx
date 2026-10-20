import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { SITE_URL } from "@/data/personal-site";

// Fonts are self-hosted from app/fonts so builds never fetch from Google Fonts.
// Licences: app/fonts/LICENSE-*.txt (SIL OFL 1.1).
// IBM Plex Sans: an engineering typeface with good small-size legibility, read
// as plain and technical rather than as a design statement. Licence: app/fonts.
const plex = localFont({
  src: [
    { path: "./fonts/ibm-plex-sans-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/ibm-plex-sans-latin-600-normal.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-plex",
  display: "swap",
});

// Used only by the archived Workspace at /workspace/.
// preload: false, so the new site never downloads them.
const geistSans = localFont({ src: "./fonts/Geist-Variable.woff2", variable: "--font-geist-sans", weight: "100 900", display: "swap", preload: false });
const geistMono = localFont({ src: "./fonts/GeistMono-Variable.woff2", variable: "--font-geist-mono", weight: "100 900", display: "swap", preload: false });

const description =
  "Adjie Rizqan, software and full-stack engineer. Operational software for a hospital laboratory, and applied computer vision research.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Adjie Rizqan, software engineer",
  description,
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Adjie Rizqan",
    title: "Adjie Rizqan, software engineer",
    description,
    images: ["/projects/labstock/thumb-reset-a.jpg"],
  },
  twitter: { card: "summary_large_image", title: "Adjie Rizqan, software engineer", description, images: ["/projects/labstock/thumb-reset-a.jpg"] },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#121214" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${plex.variable} ${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body>{children}</body>
    </html>
  );
}
