"use client"

import { SEVERITY_META, type AuditReport } from "@/lib/auditor-types"

export function RiskGauge({
  score,
  severity,
}: {
  score: number
  severity: AuditReport["overallSeverity"]
}) {
  const meta = SEVERITY_META[severity]
  const radius = 78
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="relative flex items-center justify-center">
      <svg width="200" height="200" viewBox="0 0 200 200" className="-rotate-90">
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth="12"
        />
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke={meta.token}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 900ms cubic-bezier(0.4,0,0.2,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-mono text-5xl font-semibold tabular-nums"
          style={{ color: meta.token }}
        >
          {score}
        </span>
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          Score de risco
        </span>
      </div>
    </div>
  )
}
