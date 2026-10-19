import type { Metadata } from "next";
import { WorkspacePrototype } from "@/components/WorkspacePrototype";

// Previous portfolio interface with the optional Ask AI. Not indexed; the new
// site is canonical for every project.
export const metadata: Metadata = {
  title: "Workspace and Ask — Adjie Rizqan",
  description: "The previous Adjie Workspace interface, kept for its Ask AI feature.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/workspace/" },
};

export default function WorkspacePage() {
  return <WorkspacePrototype basePath="/workspace/" />;
}
