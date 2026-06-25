"use client";

import { useState } from "react";
import { ChevronDown, Lightbulb, ShieldCheck } from "lucide-react";
import type { Finding } from "@/lib/auditor-types";
import { Card } from "@/components/ui/card";
import { cn } from "../../lib/utils";
import { SeverityBadge } from "./severity-badge";

export function FindingsList({
  findings,
  activeId,
  onSelect,
}: {
  findings: Finding[];
  activeId?: string | null;
  onSelect?: (finding: Finding) => void;
}) {
  if (findings.length === 0) {
    return (
      <Card className="flex flex-col items-center gap-2 border-severity-safe/40 bg-severity-safe/5 p-10 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-severity-safe/15 text-severity-safe">
          <ShieldCheck className="size-6" aria-hidden />
        </div>
        <h3 className="text-base font-medium">Nenhum achado suspeito</h3>
        <p className="max-w-sm text-sm text-muted-foreground text-pretty">
          O documento não acionou nenhuma das regras de detecção de prompt
          injection.
        </p>
      </Card>
    );
  }

  return (
    <ul className="flex flex-col gap-2.5">
      {findings.map((finding) => (
        <FindingItem
          key={finding.id}
          finding={finding}
          active={activeId === finding.id}
          onSelect={onSelect}
        />
      ))}
    </ul>
  );
}

function FindingItem({
  finding,
  active,
  onSelect,
}: {
  finding: Finding;
  active?: boolean;
  onSelect?: (finding: Finding) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <li>
      <Card
        className={cn(
          "gap-0 overflow-hidden p-0 transition-colors",
          active && "ring-1 ring-primary",
        )}
      >
        <button
          type="button"
          onClick={() => {
            setOpen((o) => !o);
            onSelect?.(finding);
          }}
          className="flex w-full items-start gap-3 p-4 text-left"
        >
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <SeverityBadge severity={finding.severity} />
              <span className="font-mono text-xs text-muted-foreground">
                {finding.category}
              </span>
            </div>
            <h4 className="mt-2 text-sm font-medium text-foreground">
              {finding.title}
            </h4>
            <code className="mt-1.5 line-clamp-1 block rounded bg-secondary px-2 py-1 font-mono text-xs text-muted-foreground">
              {finding.snippet}
            </code>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="font-mono text-xs text-muted-foreground">
              {finding.confidence}%
            </span>
            <ChevronDown
              className={cn(
                "size-4 text-muted-foreground transition-transform",
                open && "rotate-180",
              )}
              aria-hidden
            />
          </div>
        </button>

        {open && (
          <div className="border-t border-border px-4 py-3">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {finding.description}
            </p>
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-primary/30 bg-primary/5 p-3">
              <Lightbulb
                className="mt-0.5 size-4 shrink-0 text-primary"
                aria-hidden
              />
              <div>
                <p className="text-xs font-medium text-primary">Recomendação</p>
                <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                  {finding.recommendation}
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>
    </li>
  );
}
