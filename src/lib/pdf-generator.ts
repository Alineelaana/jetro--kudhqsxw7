import logoUrl from '@/assets/chatgpt-image-1-de-ago.de-2026-103549-f6f46.png'

export interface BudgetPdfData {
  budgetNumber: string
  emissionDate: string
  clientName: string
  clientEmail: string
  clientPhone: string
  clientCompany: string
  service: string
  origin: string
  destination: string
  merchandise: string
  volume: string
  operationType: string
  periodicity: string
  value: string
  validUntil: string
  responsible: string
  observations: string
}

export function generateBudgetPdf(data: BudgetPdfData): void {
  const fullLogoUrl = new URL(logoUrl, window.location.href).href
  const html = `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8">
<title>Orçamento ${data.budgetNumber}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Arial,sans-serif;color:#1a1a1a;padding:40px}
.header{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #005B2E;padding-bottom:20px;margin-bottom:30px}
.header img{height:70px}
.header-right{text-align:right}
.header-right h1{font-size:24px;color:#005B2E}
.header-right .number{font-size:16px;color:#C89B3C;font-weight:bold}
.header-right .date{font-size:12px;color:#666;margin-top:4px}
.section{margin-bottom:25px}
.section-title{font-size:14px;font-weight:bold;color:#005B2E;border-bottom:1px solid #C89B3C;padding-bottom:5px;margin-bottom:10px;text-transform:uppercase}
.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px 20px}
.info-item{font-size:13px}
.info-item strong{color:#005B2E}
.budget-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px 20px}
.budget-item{font-size:14px;padding:8px;background:#f8f8f8;border-radius:4px}
.budget-item strong{color:#005B2E;display:block;font-size:11px;text-transform:uppercase;margin-bottom:2px}
.observations{font-size:13px;padding:12px;background:#f8f8f8;border-radius:4px;border-left:3px solid #005B2E;min-height:60px;white-space:pre-wrap}
.legal{margin-top:40px;padding-top:15px;border-top:1px solid #ddd}
.legal p{font-size:10px;color:#888;line-height:1.5;margin-bottom:3px}
.footer{margin-top:30px;text-align:center;font-size:11px;color:#C89B3C;font-weight:bold}
@media print{body{padding:20px}}
</style></head><body>
<div class="header"><img src="${fullLogoUrl}" alt="Velora Log" />
<div class="header-right"><h1>ORÇAMENTO</h1>
<div class="number">Nº ${data.budgetNumber}</div>
<div class="date">Emissão: ${data.emissionDate}</div></div></div>
<div class="section"><div class="section-title">Dados do Cliente</div>
<div class="info-grid">
<div class="info-item"><strong>Nome:</strong> ${data.clientName || '—'}</div>
<div class="info-item"><strong>Empresa:</strong> ${data.clientCompany || '—'}</div>
<div class="info-item"><strong>E-mail:</strong> ${data.clientEmail || '—'}</div>
<div class="info-item"><strong>Telefone:</strong> ${data.clientPhone || '—'}</div>
<div class="info-item"><strong>Serviço:</strong> ${data.service || '—'}</div>
<div class="info-item"><strong>Tipo de Operação:</strong> ${data.operationType || '—'}</div>
<div class="info-item"><strong>Origem:</strong> ${data.origin || '—'}</div>
<div class="info-item"><strong>Destino:</strong> ${data.destination || '—'}</div>
<div class="info-item"><strong>Mercadoria:</strong> ${data.merchandise || '—'}</div>
<div class="info-item"><strong>Volume:</strong> ${data.volume || '—'}</div>
<div class="info-item"><strong>Periodicidade:</strong> ${data.periodicity || '—'}</div>
</div></div>
<div class="section"><div class="section-title">Proposta Comercial</div>
<div class="budget-grid">
<div class="budget-item"><strong>Valor</strong>R$ ${data.value || '—'}</div>
<div class="budget-item"><strong>Validade do Orçamento</strong>${data.validUntil || '—'}</div>
<div class="budget-item" style="grid-column:1 / -1;"><strong>Responsável</strong>${data.responsible || '—'}</div>
</div>
<div style="margin-top:12px;"><div class="section-title" style="font-size:12px;">Observações</div>
<div class="observations">${data.observations || '—'}</div></div></div>
<div class="legal">
<p>1. Este orçamento tem validade de 15 (quinze) dias a partir da data de emissão, ou até a data de validade indicada, prevalecendo a que ocorrer primeiro.</p>
<p>2. Após o vencimento, os valores poderão ser reajustados sem aviso prévio, em decorrência de variações de mercado, custos de combustível, pedágios e demais fatores logísticos.</p>
<p>3. As condições de pagamento e prazos de entrega estão sujeitas a confirmação no ato da contratação.</p>
<p>4. Os valores apresentados não incluem impostos (ICMS, ISS, etc.), salvo quando expressamente indicado.</p>
<p>5. A Velora Log não se responsabiliza por atrasos decorrentes de fatores externos, como condições climáticas, bloqueios rodoviários, fiscalização ou eventos de força maior.</p>
<p>6. A aceitação deste orçamento implica na concordância com os termos e condições aqui descritos.</p>
</div>
<div class="footer">Velora Log — Operações Logísticas de Excelência</div>
<script>window.onload=function(){setTimeout(function(){window.print()},500)}</script>
</body></html>`

  const win = window.open('', '_blank')
  if (!win) throw new Error('Pop-up bloqueado. Permita pop-ups para gerar o PDF.')
  win.document.write(html)
  win.document.close()
}
