"use client"

import { useEffect, useState } from "react"
import { Loader2, ShieldCheck } from "lucide-react"


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
}