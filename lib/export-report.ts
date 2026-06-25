import { SEVERITY_META, type AuditReport } from "./auditor-types"

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

const SEVERITY_HEX: Record<string, string> = {
  critical: "#e5484d",
  high: "#e08c2b",
  medium: "#d4b22a",
  low: "#4aa3d4",
  safe: "#27b08b",
}

/**
 * Gera um relatório de auditoria em HTML e abre o diálogo de impressão,
 * permitindo salvar como PDF.
 */
export function exportReportToPdf(report: AuditReport) {
  const date = new Date(report.analyzedAt).toLocaleString("pt-BR")
  const overall = SEVERITY_META[report.overallSeverity]

  const findingsHtml = report.findings.length
    ? report.findings
        .map(
          (f) => `
        <div class="finding">
          <div class="finding-head">
            <span class="pill" style="background:${SEVERITY_HEX[f.severity]}1a;color:${SEVERITY_HEX[f.severity]};border-color:${SEVERITY_HEX[f.severity]}66">
              ${SEVERITY_META[f.severity].label}
            </span>
            <span class="cat">${escapeHtml(f.category)}</span>
            <span class="conf">${f.confidence}% confiança</span>
          </div>
          <h3>${escapeHtml(f.title)}</h3>
          <p>${escapeHtml(f.description)}</p>
          <code>${escapeHtml(f.snippet)}</code>
          <p class="rec"><strong>Recomendação:</strong> ${escapeHtml(f.recommendation)}</p>
        </div>`,
        )
        .join("")
    : `<p class="empty">Nenhum achado suspeito foi detectado neste documento.</p>`

  const html = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><title>Relatório de Auditoria — ${escapeHtml(report.fileName)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; color: #1a1a1a; margin: 40px; }
  header { border-bottom: 2px solid #eee; padding-bottom: 16px; margin-bottom: 24px; }
  h1 { font-size: 22px; margin: 0 0 4px; }
  .muted { color: #666; font-size: 13px; }
  .summary { display: flex; gap: 24px; margin: 24px 0; flex-wrap: wrap; }
  .score { font-size: 44px; font-weight: 700; }
  .box { border: 1px solid #e5e5e5; border-radius: 10px; padding: 16px 20px; }
  .pill { display: inline-block; border: 1px solid; border-radius: 999px; padding: 2px 10px; font-size: 12px; font-weight: 600; }
  .counts { display: flex; gap: 12px; flex-wrap: wrap; margin: 8px 0 0; }
  .finding { border: 1px solid #e5e5e5; border-radius: 10px; padding: 16px; margin-bottom: 12px; page-break-inside: avoid; }
  .finding-head { display: flex; gap: 8px; align-items: center; font-size: 12px; color: #666; margin-bottom: 8px; }
  .finding h3 { font-size: 15px; margin: 0 0 6px; }
  .finding p { font-size: 13px; line-height: 1.5; margin: 6px 0; color: #333; }
  code { display: block; background: #f4f4f5; border-radius: 6px; padding: 8px 10px; font-size: 12px; margin: 8px 0; white-space: pre-wrap; word-break: break-word; }
  .rec { background: #f0f7ff; border-left: 3px solid #4aa3d4; padding: 8px 10px; border-radius: 4px; }
  .empty { color: #27b08b; font-weight: 600; }
  h2 { font-size: 16px; margin: 28px 0 12px; }
  footer { margin-top: 32px; border-top: 1px solid #eee; padding-top: 12px; font-size: 11px; color: #999; }
</style></head>
<body>
  <header>
    <h1>Relatório de Auditoria de Prompt Injection</h1>
    <div class="muted">${escapeHtml(report.fileName)} · ${report.wordCount} palavras · gerado em ${date}</div>
  </header>

  <div class="summary">
    <div class="box">
      <div class="muted">Score de risco</div>
      <div class="score" style="color:${SEVERITY_HEX[report.overallSeverity]}">${report.riskScore}<span style="font-size:18px;color:#999">/100</span></div>
      <span class="pill" style="background:${SEVERITY_HEX[report.overallSeverity]}1a;color:${SEVERITY_HEX[report.overallSeverity]};border-color:${SEVERITY_HEX[report.overallSeverity]}66">${overall.label}</span>
    </div>
    <div class="box" style="flex:1">
      <div class="muted">Resumo dos achados (${report.findings.length} no total)</div>
      <div class="counts">
        <span>Crítico: <strong>${report.counts.critical}</strong></span>
        <span>Alto: <strong>${report.counts.high}</strong></span>
        <span>Médio: <strong>${report.counts.medium}</strong></span>
        <span>Baixo: <strong>${report.counts.low}</strong></span>
      </div>
      <div class="muted" style="margin-top:12px">Tipo: ${escapeHtml(report.fileType)} · ${(report.fileSize / 1024).toFixed(1)} KB · análise em ${report.durationMs} ms</div>
    </div>
  </div>

  <h2>Achados detalhados</h2>
  ${findingsHtml}

  <footer>
    Relatório gerado pelo Auditor de Prompt Injection. As detecções são heurísticas e devem ser revisadas por um analista de segurança.
  </footer>
  <script>window.onload = () => { window.print(); }</script>
</body></html>`

  const win = window.open("", "_blank")
  if (!win) {
    alert("Permita pop-ups para exportar o relatório em PDF.")
    return
  }
  win.document.open()
  win.document.write(html)
  win.document.close()
}
