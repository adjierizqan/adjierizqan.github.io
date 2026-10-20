import Link from "next/link";
import "@/components/site/site.css";

export default function NotFound() {
  return (
    <main id="main" className="page">
      <div className="col">
        <p className="small muted">404</p>
        <h1 style={{ fontSize: 32, lineHeight: 1.2, margin: "12px 0 16px" }}>This page isn’t here.</h1>
        <p>The project may have moved. Every case study is listed on the home page.</p>
        <p style={{ marginTop: 12 }}><Link href="/" className="home-link">Go to the home page</Link></p>
      </div>
    </main>
  );
}
