"use client";

import { useState } from "react";
import {
  Clock,
  Download,
  FileText,
  ListChecks,
  RotateCcw,
  ScanText,
} from "lucide-react";
import type { AuditReport, Finding } from "@/lib/auditor-types";
import { Button } from "@/components/ui/button";

import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { exportReportToPdf } from "../../lib/export-report";
import { FindingsList } from "./findings-list";
import { DocumentViewer } from "./document-viewer";
import { RiskGauge } from "./risk-gauge";
import { SeverityBadge } from "./severity-badge";
import { StatCards } from "./stat-cards";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export function AuditResults({
  report,
  onReset,
}: {
  report: AuditReport;
  onReset: () => void;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [tab, setTab] = useState("findings");

  const handleSelect = (f: Finding) => {
    setActiveId(f.id);
    setTab("document");
    requestAnimationFrame(() => {
      document
        .getElementById(`hl-${f.id}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Barra do arquivo */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
            <FileText className="size-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{report.fileName}</p>
            <p className="text-xs text-muted-foreground">
              {report.fileType} · {formatBytes(report.fileSize)} ·{" "}
              {report.wordCount} palavras
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onReset}>
            <RotateCcw className="size-4" aria-hidden />
            Nova auditoria
          </Button>
          <Button size="sm" onClick={() => exportReportToPdf(report)}>
            <Download className="size-4" aria-hidden />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Dashboard: score + estatísticas */}
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <Card className="items-center justify-center gap-4 p-6">
          <RiskGauge
            score={report.riskScore}
            severity={report.overallSeverity}
          />
          <div className="flex flex-col items-center gap-2">
            <SeverityBadge severity={report.overallSeverity} />
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="size-3.5" aria-hidden />
              Analisado em {report.durationMs} ms
            </p>
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <StatCards report={report} />
          <Card className="flex-1 flex-row items-center gap-3 p-4">
            <ScanText className="size-5 shrink-0 text-primary" aria-hidden />
            <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
              {report.findings.length > 0 ? (
                <>
                  Foram detectados{" "}
                  <span className="font-medium text-foreground">
                    {report.findings.length} trecho(s) suspeito(s)
                  </span>{" "}
                  que podem indicar tentativas de prompt injection. Revise os
                  achados abaixo antes de processar este documento com um LLM.
                </>
              ) : (
                <>
                  Nenhum padrão de prompt injection foi identificado. Ainda
                  assim, mantenha as boas práticas de isolamento de contexto.
                </>
              )}
            </p>
          </Card>
        </div>
      </div>

      {/* Abas: findings e documento */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="findings">
            <ListChecks className="size-4" aria-hidden />
            Achados ({report.findings.length})
          </TabsTrigger>
          <TabsTrigger value="document">
            <ScanText className="size-4" aria-hidden />
            Documento
          </TabsTrigger>
        </TabsList>

        <TabsContent value="findings" className="mt-4">
          <FindingsList
            findings={report.findings}
            activeId={activeId}
            onSelect={handleSelect}
          />
        </TabsContent>

        <TabsContent value="document" className="mt-4">
          <DocumentViewer
            content={report.content}
            findings={report.findings}
            activeId={activeId}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
