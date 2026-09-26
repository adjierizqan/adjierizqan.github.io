import { ID } from "@/lib/i18n-id";

// Portfolio language. English is the source text; Indonesian comes from lib/i18n-id.ts, keyed by the
// exact English string. html[lang] is set before paint by app/layout.tsx and is the source of truth.
export type Locale = "en" | "id";
export const LOCALE_KEY = "aw-locale";

// The active locale for this render pass. WorkspacePrototype sets it at the top of its render,
// before any child renders, so every component in the tree reads the same value.
let active: Locale = "en";
export function setActiveLocale(locale: Locale) { active = locale; }
export function activeLocale(): Locale { return active; }

/** Marks English copy stored in data/constants; it is translated where it is shown with t(). */
export const tk = (en: string) => en;

/** Static copy: the English text, or its Indonesian translation when ID is selected. */
export function t(en: string): string {
  return active === "id" ? ID[en] ?? en : en;
}
/** Copy with dynamic parts, written in both languages at the call site. */
export function L(en: string, id: string): string {
  return active === "id" ? id : en;
}

export function subscribeToLocale(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  return () => observer.disconnect();
}
export const readLocale = (): Locale => (document.documentElement.lang === "id" ? "id" : "en");
export const readLocaleOnServer = (): Locale => "en";
export function setLocale(locale: Locale) {
  document.documentElement.lang = locale;
  try { localStorage.setItem(LOCALE_KEY, locale); } catch { /* private mode: lasts for this page */ }
}
