import { SEVERITY_META, type AuditReport, type Severity } from "@/lib/auditor-types"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const SEVERITIES: Severity[] = ["critical", "high", "medium", "low"]

export function StatCards({ report }: { report: AuditReport }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {SEVERITIES.map((sev) => {
        const meta = SEVERITY_META[sev]
        const count = report.counts[sev]
        return (
          <Card
            key={sev}
            className={cn(
              "gap-2 border p-4",
              count > 0 ? meta.borderClass : "border-border",
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{meta.label}</span>
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: meta.token }}
                aria-hidden
              />
            </div>
            <span
              className={cn(
                "font-mono text-3xl font-semibold tabular-nums",
                count > 0 ? meta.textClass : "text-muted-foreground",
              )}
            >
              {count}
            </span>
            <span className="text-xs text-muted-foreground">
              {count === 1 ? "achado" : "achados"}
            </span>
          </Card>
        )
      })}
    </div>
  )
}
