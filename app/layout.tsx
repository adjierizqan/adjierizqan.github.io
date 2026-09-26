import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./theme-dark.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://adjierizqan.github.io"),
  title: "Adjie — Software Engineer & AI Builder",
  description:
    "Explore Adjie Rizqan's operational software and applied AI work through a browse-first interactive workspace.",
  alternates: { canonical: "/" },
};

const THEME_BOOT = `(function(){try{var d=document.documentElement,m=window.matchMedia("(prefers-color-scheme: dark)"),k="aw-theme";var s=localStorage.getItem(k);d.dataset.theme=s==="dark"||s==="light"?s:(m.matches?"dark":"light");m.addEventListener("change",function(e){if(!localStorage.getItem(k))d.dataset.theme=e.matches?"dark":"light"})}catch(e){}})();`;

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
        {/* Theme before first paint: saved choice, else the system preference (followed live). */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
      </head>
      <body className="flex min-h-full flex-col">
        <main className="site-main flex-1">{children}</main>
      </body>
    </html>
  );
}
