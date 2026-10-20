"use client";

import { useState } from "react";

export function CopyEmail({ email }: { email: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setState("copied");
    } catch {
      setState("failed");
    }
    window.setTimeout(() => setState("idle"), 2000);
  };
  return (
    <>
      <button type="button" className="copy" onClick={copy}>{state === "copied" ? "Copied" : "Copy email"}</button>
      <span className="sr-only" role="status">
        {state === "copied" ? "Email address copied" : state === "failed" ? "Copy failed. Select the address instead." : ""}
      </span>
    </>
  );
}
