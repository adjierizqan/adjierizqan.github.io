import type { Metadata } from "next";
import { RedirectTo } from "@/components/RedirectTo";

// The workspace is the root experience now; keep old /workspace/?project=… links working.
export const metadata: Metadata = { robots: { index: false }, alternates: { canonical: "/" } };

export default function WorkspaceRedirect() {
  return <RedirectTo href="/" keepQuery />;
}
