"use client";

import { useEffect, useState } from "react";

/**
 * Light/dark switch. The theme is applied before first paint by the inline
 * script in app/layout.tsx (system preference unless a choice was saved under
 * "aw-theme"); this only reads that state and changes it. Same storage key, so
 * a choice made in the old workspace carries over.
 */
const KEY = "aw-theme";
type Theme = "light" | "dark";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const read = () => setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  const next: Theme = theme === "dark" ? "light" : "dark";
  const toggle = () => {
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem(KEY, next); } catch { /* private mode: still switches */ }
  };

  return (
    <button type="button" className="site-icon-btn" onClick={toggle}
            aria-label={theme ? `Switch to ${next} theme` : "Switch theme"}
            // Rendered before hydration knows the theme; the label settles once mounted.
            suppressHydrationWarning>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
           strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {theme === "dark"
          ? <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>
          : <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />}
      </svg>
    </button>
  );
}
