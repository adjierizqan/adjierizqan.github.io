import type { Metadata } from "next";
import { WorkspacePrototype } from "@/components/WorkspacePrototype";

export const metadata: Metadata = {
  title: "Adjie Workspace — Interactive prototype",
  description:
    "Explore Adjie Rizqan's operational software and applied AI work through a browse-first interactive workspace.",
};

export default function WorkspacePage() {
  return <WorkspacePrototype />;
}
