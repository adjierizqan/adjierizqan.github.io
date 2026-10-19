import "../../globals.css";
import "../../theme-dark.css";
import "@/components/workspace/motion.css";
import "@/components/workspace/interface.css";

// The previous macOS-style Workspace, kept with its optional Ask AI at /workspace/.
// Its global styles load only on this route; links into the new site are plain
// anchors, so the two stylesheets never share a document.
const THEME_BOOT = `(function(){try{var d=document.documentElement,m=window.matchMedia("(prefers-color-scheme: dark)"),k="aw-theme";d.classList.add("h-full","antialiased");document.body.classList.add("flex","min-h-full","flex-col");var s=localStorage.getItem(k);d.dataset.theme=s==="dark"||s==="light"?s:(m.matches?"dark":"light");d.lang="en";m.addEventListener("change",function(e){if(!localStorage.getItem(k))d.dataset.theme=e.matches?"dark":"light"})}catch(e){}})();`;

export default function WorkspaceLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      {/* Theme before first paint: saved choice, else system theme. */}
      <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
      <div className="site-main flex-1">{children}</div>
    </>
  );
}
