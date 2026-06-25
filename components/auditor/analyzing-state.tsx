"use client"

import { useEffect, useState } from "react"
import { Loader2, ShieldCheck } from "lucide-react"
import { Card } from "../ui/card"
import { Progress } from "../ui/progress"



const STEPS = [
  "Extraindo texto do documento…",
  "Normalizando e tokenizando conteúdo…",
  "Aplicando regras de detecção…",
  "Calculando score de risco…",
  "Compilando relatório de auditoria…",
]

export function AnalyzingState({ fileName }: { fileName: string }) {
  const [step, setStep] = useState(0)
  const [progress, setProgress] = useState(8)

  useEffect(() => {
    const stepTimer = setInterval(() => {
      setStep((s) => Math.min(s + 1, STEPS.length - 1))
    }, 480)
    const progTimer = setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 14, 96))
    }, 260)
    return () => {
      clearInterval(stepTimer)
      clearInterval(progTimer)
    }
  }, [])

  return (
    <Card className="items-center gap-5 p-10 text-center">
      <div className="relative flex size-16 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
        <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <ShieldCheck className="size-7" aria-hidden />
        </div>
      </div>

      <div>
        <h3 className="text-base font-medium">Auditando documento</h3>
        <p className="mt-1 truncate text-sm text-muted-foreground">{fileName}</p>
      </div>

      <div className="w-full max-w-sm">
        <Progress value={progress} />
        <p className="mt-3 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          {STEPS[step]}
        </p>
      </div>
    </Card>
  )
}