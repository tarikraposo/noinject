"use client"

import { useMemo } from "react"
import { SEVERITY_META, type Finding, type Severity } from "@/lib/auditor-types"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "../lib/utils"

interface Segment {
  text: string
  finding?: Finding
}

const order: Record<Severity, number> = { critical: 0, high: 1, medium: 2, low: 3 }

export function DocumentViewer({
  content,
  findings,
  activeId,
}: {
  content: string
  findings: Finding[]
  activeId?: string | null
}) {
  const segments = useMemo<Segment[]>(() => {
    if (!content) return [{ text: "" }]
    // Ordena por posição; em sobreposição, mantém o de maior severidade.
    const sorted = [...findings].sort(
      (a, b) => a.start - b.start || order[a.severity] - order[b.severity],
    )
    const result: Segment[] = []
    let cursor = 0
    for (const f of sorted) {
      if (f.start < cursor) continue // pula sobreposições
      if (f.start > cursor) {
        result.push({ text: content.slice(cursor, f.start) })
      }
      result.push({ text: content.slice(f.start, f.end), finding: f })
      cursor = f.end
    }
    if (cursor < content.length) {
      result.push({ text: content.slice(cursor) })
    }
    return result
  }, [content, findings])

  return (
    <ScrollArea className="h-[460px] rounded-lg border border-border bg-secondary/30">
      <pre className="whitespace-pre-wrap break-words p-4 font-mono text-sm leading-relaxed text-foreground">
        {segments.map((seg, i) => {
          if (!seg.finding) return <span key={i}>{seg.text}</span>
          const meta = SEVERITY_META[seg.finding.severity]
          const isActive = seg.finding.id === activeId
          return (
            <mark
              key={i}
              id={`hl-${seg.finding.id}`}
              title={seg.finding.title}
              className={cn(
                "rounded px-0.5 text-foreground underline decoration-dotted underline-offset-2 transition-shadow",
                meta.bgClass,
                isActive && "ring-2 ring-offset-2 ring-offset-background",
              )}
              style={{
                boxShadow: `inset 0 -2px 0 ${meta.token}`,
                ...(isActive ? { ["--tw-ring-color" as string]: meta.token } : {}),
              }}
            >
              {seg.text}
            </mark>
          )
        })}
      </pre>
    </ScrollArea>
  )
}
