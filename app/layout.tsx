import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./theme-dark.css";
import "@/components/workspace/motion.css";
import "@/components/workspace/interface.css";

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
  title: "Adjie Rizqan — Software Engineer",
  description:
    "Explore Adjie Rizqan's operational software and applied AI work inside Adjie Workspace.",
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: { type: "website", url: "/", title: "Adjie Rizqan — Software Engineer", description: "Operational software, data-heavy applications and applied computer vision.", images: ["/projects/labstock/thumb-reset-a.jpg"] },
  twitter: { card: "summary_large_image", title: "Adjie Rizqan — Software Engineer", images: ["/projects/labstock/thumb-reset-a.jpg"] },
};

const THEME_BOOT = `(function(){try{var d=document.documentElement,m=window.matchMedia("(prefers-color-scheme: dark)"),k="aw-theme";var s=localStorage.getItem(k);d.dataset.theme=s==="dark"||s==="light"?s:(m.matches?"dark":"light");d.lang="en";m.addEventListener("change",function(e){if(!localStorage.getItem(k))d.dataset.theme=e.matches?"dark":"light"})}catch(e){}})();`;

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
        <div className="site-main flex-1">{children}</div>
      </body>
    </html>
  );
}
