import { identity } from "@/data/profile";
import { JAGAU_URL, PROVENANCE_NOTE } from "@/data/personal-site";

export function Footer() {
  return (
    <footer className="wrap">
      <div className="site-footer">
        <p>© 2026 {identity.name}</p>
        <p>{PROVENANCE_NOTE}</p>
        <ul>
          <li><a href={identity.contact.github} className="inline-link">GitHub</a></li>
          <li><a href={identity.contact.linkedin} className="inline-link">LinkedIn</a></li>
          <li><a href={JAGAU_URL} className="inline-link">JAGAU</a></li>
          <li><a href="/workspace/" className="inline-link">Ask about my work</a></li>
        </ul>
      </div>
    </footer>
  );
}
