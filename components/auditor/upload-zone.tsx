"use client";

import { useCallback, useRef, useState } from "react";
import { FileText, ShieldAlert, UploadCloud } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "@/components/ui/button";

const ACCEPTED = [".pdf", ".docx", ".txt", ".md"];

export function UploadZone({
  onFile,
  disabled,
}: {
  onFile: (file: File) => void;
  disabled?: boolean;
}) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      onFile(files[0]);
    },
    [onFile],
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        if (!disabled) handleFiles(e.dataTransfer.files);
      }}
      className={cn(
        "relative flex flex-col items-center justify-center rounded-xl border border-dashed bg-card/50 px-6 py-14 text-center transition-colors",
        dragging ? "border-primary bg-primary/5" : "border-border",
        disabled && "pointer-events-none opacity-60",
      )}
    >
      <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <UploadCloud className="size-7" aria-hidden />
      </div>
      <h3 className="text-base font-medium text-foreground text-balance">
        Arraste um documento ou selecione um arquivo
      </h3>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground text-pretty">
        Auditoria de Prompt Injection em PDF, DOCX, TXT e Markdown. Os arquivos
        são analisados em busca de instruções maliciosas.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        <Button onClick={() => inputRef.current?.click()} disabled={disabled}>
          <FileText className="size-4" aria-hidden />
          Selecionar arquivo
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        {ACCEPTED.map((ext) => (
          <span
            key={ext}
            className="rounded-md border border-border bg-secondary px-2 py-0.5 font-mono text-xs text-muted-foreground"
          >
            {ext}
          </span>
        ))}
      </div>

      <p className="mt-6 flex items-center gap-1.5 text-xs text-muted-foreground">
        <ShieldAlert className="size-3.5" aria-hidden />
        Processamento local no navegador — nenhum dado sai da sua máquina nesta
        demonstração.
      </p>
    </div>
  );
}
