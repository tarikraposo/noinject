import type { AuditReport, Finding, Severity } from "../lib/auditor-types"
import { extractPdfText } from "./pdf-extract"

interface Rule {
  category: string
  title: string
  description: string
  severity: Severity
  weight: number
  confidence: number
  recommendation: string
  pattern: RegExp
}

/**
 * Conjunto de regras heurísticas para detecção de Prompt Injection.
 * Em produção, estas regras viriam do backend; aqui rodam no cliente
 * para demonstrar o fluxo completo da auditoria.
 */
const RULES: Rule[] = [
  {
    category: "instruction-override",
    title: "Tentativa de sobrescrever instruções",
    description:
      "O texto contém uma instrução para ignorar, esquecer ou descartar diretrizes anteriores — padrão clássico de prompt injection.",
    severity: "critical",
    weight: 32,
    confidence: 95,
    recommendation:
      "Isole o conteúdo do usuário do prompt do sistema e rejeite instruções que tentem redefinir o comportamento do modelo.",
    pattern:
      /\b(ignore|ignorar|desconsidere|esque[çc]a|disregard|forget)\b[^.\n]{0,40}\b(previous|anterior(es)?|above|acima|todas as|all)\b[^.\n]{0,40}\b(instru[çc][õo]es|instructions|prompts?|regras|rules)\b/gi,
  },
  {
    category: "role-hijack",
    title: "Sequestro de papel / persona",
    description:
      "Tentativa de forçar o modelo a assumir um novo papel sem restrições (ex.: 'você agora é', 'aja como', 'DAN').",
    severity: "high",
    weight: 22,
    confidence: 88,
    recommendation:
      "Fixe a persona no prompt do sistema e ignore solicitações de mudança de papel vindas de conteúdo não confiável.",
    pattern:
      /\b(you are now|voc[êe] (agora )?[ée]|aja como|act as|pretend to be|finja ser|from now on|a partir de agora)\b[^.\n]{0,50}\b(dan|jailbreak|sem restri[çc][õo]es|unrestricted|developer mode|modo desenvolvedor|admin|root)\b/gi,
  },
  {
    category: "system-prompt-leak",
    title: "Exfiltração de prompt do sistema",
    description:
      "Solicitação para revelar instruções de sistema, prompt oculto ou configurações internas.",
    severity: "high",
    weight: 20,
    confidence: 84,
    recommendation:
      "Nunca exponha o prompt do sistema. Trate pedidos de revelação como hostis e registre o evento.",
    pattern:
      /\b(reveal|mostr[ae]|repeat|repita|print|exiba|show me)\b[^.\n]{0,40}\b(system prompt|prompt do sistema|instru[çc][õo]es (do sistema|iniciais|ocultas)|hidden (prompt|instructions)|initial instructions)\b/gi,
  },
  {
    category: "data-exfiltration",
    title: "Possível exfiltração de dados",
    description:
      "Texto orienta o envio de dados, segredos ou chaves para um destino externo (URL, e-mail, webhook).",
    severity: "critical",
    weight: 28,
    confidence: 80,
    recommendation:
      "Bloqueie a saída de dados sensíveis e valide qualquer URL/endpoint antes de qualquer ação automatizada.",
    pattern:
      /\b(send|envie|post|fa[çc]a upload|exfiltrate|leak|vaze)\b[^.\n]{0,40}\b(api[_\s-]?key|chave|senha|password|secret|token|cookies?|dados? do usu[áa]rio)\b[^.\n]{0,40}\b(to|para|https?:\/\/|@)/gi,
  },
  {
    category: "encoded-payload",
    title: "Carga ofuscada / codificada",
    description:
      "Presença de instruções para decodificar Base64/ROT13 ou blocos codificados que podem esconder comandos.",
    severity: "medium",
    weight: 14,
    confidence: 70,
    recommendation:
      "Trate conteúdo codificado como não confiável e não execute instruções derivadas de decodificação automática.",
    pattern:
      /\b(decode|decodifique|base64|rot13|atob\(|fromCharCode|\\x[0-9a-f]{2})\b/gi,
  },
  {
    category: "tool-abuse",
    title: "Abuso de ferramentas / execução de comandos",
    description:
      "Tentativa de invocar ferramentas, executar código ou comandos de shell a partir do conteúdo.",
    severity: "high",
    weight: 18,
    confidence: 76,
    recommendation:
      "Exija confirmação humana para chamadas de ferramenta originadas de conteúdo de documento e aplique allowlists.",
    pattern:
      /\b(execute|execu[çc]?[ae]r?|run|rode|eval\(|system\(|os\.|subprocess|rm\s+-rf|curl\s|wget\s|powershell|bash\s+-c)\b/gi,
  },
  {
    category: "delimiter-injection",
    title: "Injeção via delimitadores falsos",
    description:
      "Uso de marcadores de papel/delimitadores para simular mensagens de sistema ou encerrar o contexto.",
    severity: "medium",
    weight: 12,
    confidence: 72,
    recommendation:
      "Escape e neutralize delimitadores no conteúdo do usuário antes de montar o prompt final.",
    pattern:
      /(\[\/?(system|assistant|user|inst)\]|<\|?(system|im_start|im_end|endoftext)\|?>|###\s*(system|instruction)|"""\s*system)/gi,
  },
  {
    category: "policy-evasion",
    title: "Evasão de políticas de segurança",
    description:
      "Linguagem que tenta contornar filtros de segurança ou induzir respostas proibidas.",
    severity: "low",
    weight: 8,
    confidence: 65,
    recommendation:
      "Reforce os filtros de moderação e não relaxe políticas por solicitação textual.",
    pattern:
      /\b(bypass|contorne|sem filtro|no filter|sem censura|uncensored|sem limites|no restrictions|ignore (safety|seguran[çc]a)|hypothetically|hipoteticamente falando)\b/gi,
  },
]

function severityToScoreContribution(rule: Rule, hits: number): number {
  // Cada ocorrência adicional contribui com retorno decrescente.
  return rule.weight * (1 + Math.log2(hits + 1) - 1)
}

function overallSeverityFromScore(score: number): AuditReport["overallSeverity"] {
  if (score >= 75) return "critical"
  if (score >= 50) return "high"
  if (score >= 25) return "medium"
  if (score > 0) return "low"
  return "safe"
}

/**
 * Analisa o texto e retorna o relatório de auditoria.
 * Simula a latência de uma chamada de API de backend.
 */
export function analyzeText(content: string): {
  findings: Finding[]
  riskScore: number
  overallSeverity: AuditReport["overallSeverity"]
  counts: Record<Severity, number>
} {
  const findings: Finding[] = []
  let rawScore = 0
  let idx = 0

  for (const rule of RULES) {
    const regex = new RegExp(rule.pattern.source, rule.pattern.flags)
    let match: RegExpExecArray | null
    let hits = 0
    while ((match = regex.exec(content)) !== null) {
      hits++
      const start = match.index
      const end = match.index + match[0].length
      findings.push({
        id: `f-${idx++}`,
        category: rule.category,
        title: rule.title,
        description: rule.description,
        severity: rule.severity,
        snippet: match[0].trim(),
        start,
        end,
        confidence: rule.confidence,
        recommendation: rule.recommendation,
      })
      if (match[0].length === 0) regex.lastIndex++
      if (hits > 25) break
    }
    if (hits > 0) {
      rawScore += severityToScoreContribution(rule, hits)
    }
  }

  const riskScore = Math.min(100, Math.round(rawScore))
  const counts: Record<Severity, number> = { critical: 0, high: 0, medium: 0, low: 0 }
  for (const f of findings) counts[f.severity]++

  // Ordena por severidade e depois por posição
  const order: Record<Severity, number> = { critical: 0, high: 1, medium: 2, low: 3 }
  findings.sort((a, b) => order[a.severity] - order[b.severity] || a.start - b.start)

  return {
    findings,
    riskScore,
    overallSeverity: overallSeverityFromScore(riskScore),
    counts,
  }
}

/** Lê o conteúdo textual de um arquivo. */
export async function readFileContent(
  file: File,
): Promise<string> {
  const extension = file.name
    .split(".")
    .pop()
    ?.toLowerCase();

  if (extension === "pdf") {
    return extractPdfText(file);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () =>
      resolve(String(reader.result ?? ""));

    reader.onerror = () =>
      reject(reader.error);

    reader.readAsText(file);
  });
}

/** Executa a auditoria completa simulando o backend. */
export async function auditDocument(file: File): Promise<AuditReport> {
  const startedAt = performance.now()
  const content = await readFileContent(file)
  console.log(content)
  // Latência simulada de processamento no backend
  await new Promise((r) => setTimeout(r, 1400 + Math.random() * 900))

  const { findings, riskScore, overallSeverity, counts } = analyzeText(content)
  const durationMs = Math.round(performance.now() - startedAt)
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0

  return {
    fileName: file.name,
    fileType: file.type || file.name.split(".").pop() || "desconhecido",
    fileSize: file.size,
    content,
    riskScore,
    overallSeverity,
    findings,
    counts,
    durationMs,
    analyzedAt: new Date().toISOString(),
    wordCount,
  }
}
