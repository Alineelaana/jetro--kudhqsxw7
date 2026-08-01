import logoUrl from '@/assets/chatgpt-image-1-de-ago.de-2026-103549-f6f46.png'

export interface BudgetPdfData {
  budgetNumber: string
  emissionDate: string
  requestDate: string
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
  responsibleEmail: string
  responsiblePhone: string
  observations: string
}

export function generateBudgetPdf(data: BudgetPdfData): void {
  const fullLogoUrl = new URL(logoUrl, window.location.href).href
  const html = `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8">
<title>Orçamento ${data.budgetNumber}</title>
<style>
@page{size:A4;margin:0}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Arial,sans-serif;color:#1a1a1a;width:210mm;background:#fff}
.stripe-top{background:linear-gradient(135deg,#005B2E 0%,#01361D 100%);height:14mm;width:100%}
.stripe-bottom{background:linear-gradient(135deg,#01361D 0%,#005B2E 100%);height:10mm;width:100%;display:flex;align-items:center;justify-content:center}
.content{padding:12mm 18mm}
.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6mm}
.header img{height:60px}
.header-right{text-align:right}
.header-right h1{font-size:28px;color:#005B2E;letter-spacing:2px}
.header-right .number{font-size:16px;color:#C89B3C;font-weight:bold;margin-top:4px}
.header-right .date-line{font-size:11px;color:#666;margin-top:8px;line-height:1.7}
.gold-divider{height:2px;background:linear-gradient(90deg,#C89B3C,transparent);margin:5mm 0}
.section{margin-bottom:5mm}
.section-title{font-size:12px;font-weight:bold;color:#005B2E;text-transform:uppercase;letter-spacing:1px;padding-bottom:4px;border-bottom:2px solid #C89B3C;margin-bottom:6px}
.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:5px 16px}
.info-item{font-size:12px;line-height:1.5}
.info-item strong{color:#005B2E}
.budget-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px 16px}
.budget-item{font-size:13px;padding:10px;background:#f7f7f5;border-radius:6px;border-left:3px solid #005B2E}
.budget-item strong{color:#005B2E;display:block;font-size:10px;text-transform:uppercase;margin-bottom:3px;letter-spacing:.5px}
.responsible-box{margin-top:8px;padding:10px;background:#f0f7f3;border-radius:6px;border:1px solid rgba(0,91,46,0.12)}
.responsible-box .title{font-size:10px;text-transform:uppercase;color:#005B2E;font-weight:bold;margin-bottom:4px;letter-spacing:.5px}
.responsible-box .info{display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px 12px;font-size:12px}
.responsible-box .info strong{color:#005B2E}
.observations{font-size:12px;padding:10px;background:#f7f7f5;border-radius:6px;border-left:3px solid #C89B3C;min-height:40px;white-space:pre-wrap;margin-top:6px;line-height:1.5}
.legal{margin-top:7mm;padding-top:5mm;border-top:1px solid #ddd}
.legal p{font-size:9px;color:#888;line-height:1.5;margin-bottom:3px}
.footer-text{font-size:10px;color:#C89B3C;font-weight:bold}
@media print{body{width:210mm}}
</style></head><body>
<div class="stripe-top"></div>
<div class="content">
<div class="header"><img src="${fullLogoUrl}" alt="Velora Log" />
<div class="header-right"><h1>ORÇAMENTO</h1>
<div class="number">Nº ${data.budgetNumber}</div>
<div class="date-line">Gerado em: ${data.emissionDate}<br/>Solicitação recebida em: ${data.requestDate}</div></div></div>
<div class="gold-divider"></div>
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
</div>
<div class="responsible-box">
<div class="title">Responsável pelo Atendimento</div>
<div class="info">
<div><strong>Nome:</strong> ${data.responsible || '—'}</div>
<div><strong>E-mail:</strong> ${data.responsibleEmail || '—'}</div>
<div><strong>Telefone:</strong> ${data.responsiblePhone || '—'}</div>
</div></div>
<div style="margin-top:8px;"><div class="section-title" style="font-size:11px;">Observações</div>
<div class="observations">${data.observations || '—'}</div></div></div>
<div class="legal">
<p>1. Este orçamento tem validade de 15 (quinze) dias a partir da data de emissão, ou até a data de validade indicada, prevalecendo a que ocorrer primeiro.</p>
<p>2. Após o vencimento, os valores poderão ser reajustados sem aviso prévio, em decorrência de variações de mercado, custos de combustível, pedágios e demais fatores logísticos.</p>
<p>3. As condições de pagamento e prazos de entrega estão sujeitas a confirmação no ato da contratação.</p>
<p>4. A Velora Log não se responsabiliza por atrasos decorrentes de fatores externos, como condições climáticas, bloqueios rodoviários, fiscalização ou eventos de força maior.</p>
<p>5. A aceitação deste orçamento implica na concordância com os termos e condições aqui descritos.</p>
</div>
</div>
<div class="stripe-bottom"><span class="footer-text">Velora Log — Operações Logísticas de Excelência</span></div>
<script>window.onload=function(){setTimeout(function(){window.print()},500)}</script>
</body></html>`

  const win = window.open('', '_blank')
  if (!win) throw new Error('Pop-up bloqueado. Permita pop-ups para gerar o PDF.')
  win.document.write(html)
  win.document.close()
}
