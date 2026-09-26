"use client";

import { useEffect } from "react";

// Static export has no server redirects. Replace the location (keeping any query and hash the old
// URL carried) as soon as the page runs; a delayed meta refresh covers visitors without JavaScript.
export function RedirectTo({ href, keepQuery = false }: { href: string; keepQuery?: boolean }) {
  useEffect(() => {
    const extra = keepQuery ? window.location.search + window.location.hash : "";
    window.location.replace(href + extra);
  }, [href, keepQuery]);
  return (
    <>
      <meta httpEquiv="refresh" content={`1;url=${href}`} />
      <p style={{ padding: "2rem", fontFamily: "system-ui, sans-serif", fontSize: 14 }}>
        Adjie&apos;s portfolio has moved to <a href={href}>adjierizqan.github.io</a>.
      </p>
    </>
  );
}
