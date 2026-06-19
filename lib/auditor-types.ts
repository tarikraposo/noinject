export type Severity = "critical" | "high" | "medium" | "low";

export interface Finding {
    id: string;
    category: string;
    title: string;
    description: string;
    severity: Severity;
    snippet: string;
    start: number;
    end: number;
    confidence: number;
    recommendation: string;
}

export interface AuditReport {
    fileName: string;
    fileType: string;
    fileSize: number;
    content: string;
    riskScore: number;
    overallSeverity: Severity | "safe";
    findings: Finding[];
    counts: Record<Severity, number>;
    durationMs: number;
    analyzedAt: string;
    wordCount: number;
}

export const SEVERITY_META: Record<
  Severity | "safe",
  { label: string; token: string; textClass: string; bgClass: string; borderClass: string }
> = {
  critical: {
    label: "Crítico",
    token: "var(--severity-critical)",
    textClass: "text-severity-critical",
    bgClass: "bg-severity-critical/15",
    borderClass: "border-severity-critical/40",
  },
  high: {
    label: "Alto",
    token: "var(--severity-high)",
    textClass: "text-severity-high",
    bgClass: "bg-severity-high/15",
    borderClass: "border-severity-high/40",
  },
  medium: {
    label: "Médio",
    token: "var(--severity-medium)",
    textClass: "text-severity-medium",
    bgClass: "bg-severity-medium/15",
    borderClass: "border-severity-medium/40",
  },
  low: {
    label: "Baixo",
    token: "var(--severity-low)",
    textClass: "text-severity-low",
    bgClass: "bg-severity-low/15",
    borderClass: "border-severity-low/40",
  },
  safe: {
    label: "Seguro",
    token: "var(--severity-safe)",
    textClass: "text-severity-safe",
    bgClass: "bg-severity-safe/15",
    borderClass: "border-severity-safe/40",
  },
}