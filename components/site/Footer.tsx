import { JAGAU_URL } from "@/data/personal-site";

export function Footer() {
  return (
    <footer className="site-footer">
      <p className="small">I also run <a href={JAGAU_URL}>JAGAU</a>, a small independent software studio.</p>
      <p className="caption">Product screens use demo or synthetic data. No hospital records are shown.</p>
    </footer>
  );
}
