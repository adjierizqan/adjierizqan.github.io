import Link from "next/link";
import "@/components/site/site.css";

export default function NotFound() {
  return (
    <main id="main" className="wrap" style={{ paddingTop: "15vh", paddingBottom: "15vh" }}>
      <p className="t-small muted">404</p>
      <h1 className="t-h1" style={{ margin: "16px 0 20px" }}>This page isn’t here.</h1>
      <p className="t-prose">The project may have moved. Every case study is listed on the work page.</p>
      <p style={{ marginTop: 16, display: "flex", gap: 28, flexWrap: "wrap" }}>
        <Link href="/work/" className="link">See all work</Link>
        <Link href="/" className="link">Go to the home page</Link>
      </p>
    </main>
  );
}
