"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { identity } from "@/data/profile";

const NAV = [
  { href: "/work/", label: "Work" },
  { href: "/#about", label: "About" },
  { href: identity.contact.resumeTarget, label: "Résumé", external: true },
  { href: "/#contact", label: "Contact" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    requestAnimationFrame(() => buttonRef.current?.focus());
  };

  const current = (href: string) =>
    href === "/work/" && (pathname === "/work/" || pathname === "/work" || pathname.startsWith("/projects/")) ? "page" : undefined;

  return (
    <header className="site-header">
      <div className="wrap site-header-inner">
        <Link href="/" className="site-name">{identity.name}</Link>
        <nav className="site-nav" aria-label="Main">
          <ul>
            {NAV.map((item) => (
              <li key={item.href}>
                {item.external ? (
                  <a href={item.href}>{item.label}</a>
                ) : (
                  <Link href={item.href} aria-current={current(item.href)}>{item.label}</Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
        <button ref={buttonRef} type="button" className="button-quiet menu-button" aria-expanded={open} aria-controls="menu-sheet" onClick={() => setOpen(true)}>
          Menu
        </button>
      </div>
      {open && (
        <div id="menu-sheet" className="menu-sheet" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="site-header-inner">
            <Link href="/" className="site-name" onClick={close}>{identity.name}</Link>
            <button ref={closeRef} type="button" className="button-quiet" onClick={close}>Close</button>
          </div>
          <nav aria-label="Main">
            <ul>
              {NAV.map((item) => (
                <li key={item.href}>
                  {item.external ? <a href={item.href}>{item.label}</a> : <Link href={item.href} onClick={() => setOpen(false)}>{item.label}</Link>}
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}
