export function TechBadge({ label }: { label: string }) {
  return (
    <span className="rounded-md border border-line bg-background px-2 py-0.5 font-mono text-[11px] text-muted">
      {label}
    </span>
  );
}
