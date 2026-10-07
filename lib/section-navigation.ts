import type { MouseEvent } from "react";

/** Only same-document section links opt in. Routes, history, dialogs and views
 * retain their own navigation behavior. Native scrolling handles nested roots. */
export function navigateToSection(event: MouseEvent<HTMLAnchorElement>) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const link = event.currentTarget;
  const url = new URL(link.href, location.href);
  if (link.target || url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search || !url.hash) return;
  let id: string;
  try { id = decodeURIComponent(url.hash.slice(1)); } catch { return; }
  const target = document.getElementById(id);
  if (!target) return;
  event.preventDefault();
  // Do not create a second route/history entry or trigger Workspace remounts.
  history.replaceState(history.state, "", url.hash);
  const temporaryFocus = !target.hasAttribute("tabindex");
  if (temporaryFocus) {
    target.setAttribute("tabindex", "-1");
    target.addEventListener("blur", () => target.removeAttribute("tabindex"), { once: true });
  }
  target.focus({ preventScroll: true });
  target.scrollIntoView({
    behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    block: "start",
  });
}
