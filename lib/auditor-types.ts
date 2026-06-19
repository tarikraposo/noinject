export type Severity = "critical" | "high" | "medium" | "low"

export interface Finding {
  id: string
  /** Categoria técnica do achado */
  category: string
  /** Título legível */
  title: string
  /** Explicação do porquê é suspeito */
  description: string
  severity: Severity
  /** Trecho exato detectado no documento */
  snippet: string
  /** Posição inicial do trecho no texto */
  start: number
  /** Posição final do trecho no texto */
  end: number
  /** Confiança da detecção (0-100) */
  confidence: number
  /** Recomendação de mitigação */
  recommendation: string
}

export interface AuditReport {
  fileName: string
  fileType: string
  fileSize: number
  /** Conteúdo textual extraído */
  content: string
  /** Score de risco 0-100 */
  riskScore: number
  /** Severidade geral derivada do score */
  overallSeverity: Severity | "safe"
  findings: Finding[]
  /** Contagem por severidade */
  counts: Record<Severity, number>
  /** Tempo de análise simulado (ms) */
  durationMs: number
  analyzedAt: string
  wordCount: number
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
