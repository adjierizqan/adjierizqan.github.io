import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./theme-dark.css";
import "@/components/site/site.css";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { identity } from "@/data/profile";
import { featuredWork } from "@/data/workspace";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// The description no longer advertises "an interactive workspace": that shell
// is gone. Positioning comes from the canonical profile.
export const metadata: Metadata = {
  metadataBase: new URL("https://adjierizqan.github.io"),
  title: `${identity.name} — Software Engineer`,
  description: `${identity.positioning} Case studies: ${new Intl.ListFormat("en", { type: "conjunction" }).format(featuredWork.map((p) => p.title))}.`,
  alternates: { canonical: "/" },
  openGraph: { type: "website", url: "/", siteName: identity.name },
};

const THEME_BOOT = `(function(){try{var d=document.documentElement,m=window.matchMedia("(prefers-color-scheme: dark)"),k="aw-theme";var s=localStorage.getItem(k);d.dataset.theme=s==="dark"||s==="light"?s:(m.matches?"dark":"light");var l=localStorage.getItem("aw-locale");d.lang=l==="id"?"id":"en";m.addEventListener("change",function(e){if(!localStorage.getItem(k))d.dataset.theme=e.matches?"dark":"light"})}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Theme and language before first paint: saved choice, else system theme / English. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
      </head>
      <body className="flex min-h-full flex-col">
        <a href="#content" className="skip-link">Skip to content</a>
        <SiteHeader />
        <main id="content" className="site-main flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
