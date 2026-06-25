import { SEVERITY_META, type Severity } from "@/lib/auditor-types";
import { cn } from "../../lib/utils";

export function SeverityBadge({
  severity,
  className,
}: {
  severity: Severity | "safe";
  className?: string;
}) {
  const meta = SEVERITY_META[severity];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        meta.bgClass,
        meta.borderClass,
        meta.textClass,
        className,
      )}
    >
      <span
        className="size-1.5 rounded-full"
        style={{ backgroundColor: meta.token }}
        aria-hidden
      />
      {meta.label}
    </span>
  );
}
