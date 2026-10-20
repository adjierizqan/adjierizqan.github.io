import "@/components/site/site.css";

export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <main id="main" className="page">{children}</main>
    </>
  );
}
