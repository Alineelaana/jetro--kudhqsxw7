import logoUrl from '@/assets/chatgpt-image-1-de-ago.de-2026-103549-f6f46.png'

const PRESENTATION_MESSAGE =
  'A VeloraLog agradece a oportunidade de apresentar esta proposta comercial. Nosso compromisso é oferecer soluções logísticas inteligentes, eficientes e personalizadas, agregando segurança, agilidade e redução de custos para sua operação.'

const DIFFERENTIALS_TEXT =
  'A VeloraLog oferece muito mais do que serviços logísticos: entregamos inteligência operacional. Atuamos com planejamento, tecnologia, segurança e eficiência para desenvolver soluções personalizadas que reduzem custos, aumentam a produtividade e garantem operações confiáveis do início ao fim.'

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
  servicosInclusos: string[]
  valorMercadoria: string
  necessitaSeguro: string
  necessitaPicking: string
  necessitaCrossDocking: string
  necessitaFracionamento: string
  necessitaDistribuicao: string
  prazoDesejado: string
  quantidadeVolumes: string
  peso: string
  cubagem: string
  tipoCarga: string
  valorSeguro: string
  formaPagamento: string
  prazoComercial: string
}

export function generateBudgetPdf(data: BudgetPdfData): void {
  const fullLogoUrl = new URL(logoUrl, window.location.href).href
  const servicesHtml = data.servicosInclusos
    .map((s) => `<div class="service-item">✔ ${s}</div>`)
    .join('')
  const servicesSection = data.servicosInclusos.length
    ? `<div class="section"><div class="section-title">Serviços Inclusos</div><div class="services-checklist">${servicesHtml}</div></div>`
    : ''
  const html = `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8">
<title>Orçamento ${data.budgetNumber}</title>
<style>
@page{size:A4;margin:0}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Arial,sans-serif;color:#1a1a1a;width:210mm;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.stripe-top{background:linear-gradient(135deg,#005B2E 0%,#01361D 100%);height:14mm;width:100%;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.stripe-bottom{background:linear-gradient(135deg,#01361D 0%,#005B2E 100%);height:10mm;width:100%;display:flex;align-items:center;justify-content:center;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.content{padding:10mm 18mm}
.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:5mm}
.header img{height:120px;width:auto}
.header-right{text-align:right}
.header-right h1{font-size:26px;color:#005B2E;letter-spacing:2px}
.header-right .number{font-size:15px;color:#C89B3C;font-weight:bold;margin-top:4px}
.header-right .date-line{font-size:11px;color:#666;margin-top:6px;line-height:1.6}
.gold-divider{height:2px;background:linear-gradient(90deg,#C89B3C,transparent);margin:4mm 0}
.presentation{background:#f0f7f3;border-left:4px solid #005B2E;border-radius:6px;padding:8px 14px;margin-bottom:4mm}
.presentation p{font-size:11px;line-height:1.5;color:#333;font-style:italic}
.section{margin-bottom:4mm}
.section-title{font-size:12px;font-weight:bold;color:#005B2E;text-transform:uppercase;letter-spacing:1px;padding-bottom:4px;border-bottom:2px solid #C89B3C;margin-bottom:6px}
.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:4px 16px}
.info-item{font-size:11.5px;line-height:1.45}
.info-item strong{color:#005B2E}
.services-checklist{display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px 12px}
.service-item{font-size:11.5px;color:#005B2E;font-weight:600;padding:2px 0}
.budget-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px 16px}
.budget-item{font-size:12.5px;padding:8px;background:#f7f7f5;border-radius:6px;border-left:3px solid #005B2E}
.budget-item strong{color:#005B2E;display:block;font-size:10px;text-transform:uppercase;margin-bottom:3px;letter-spacing:.5px}
.responsible-box{margin-top:6px;padding:8px;background:#f0f7f3;border-radius:6px;border:1px solid rgba(0,91,46,0.12)}
.responsible-box .title{font-size:10px;text-transform:uppercase;color:#005B2E;font-weight:bold;margin-bottom:4px;letter-spacing:.5px}
.responsible-box .info{display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px 12px;font-size:11.5px}
.responsible-box .info strong{color:#005B2E}
.observations{font-size:11.5px;padding:8px;background:#f7f7f5;border-radius:6px;border-left:3px solid #C89B3C;min-height:30px;white-space:pre-wrap;margin-top:5px;line-height:1.45}
.brand-section{background:linear-gradient(135deg,#f0f7f3 0%,#faf5e8 100%);border-radius:8px;padding:10px 14px;margin-top:3mm;border:1px solid rgba(200,155,60,0.25)}
.brand-section .title{font-size:11px;text-transform:uppercase;color:#005B2E;font-weight:bold;margin-bottom:4px;letter-spacing:.5px}
.brand-section p{font-size:11px;line-height:1.5;color:#333}
.footer-text{font-size:10px;color:#C89B3C;font-weight:bold}
@media print{body{width:210mm;-webkit-print-color-adjust:exact;print-color-adjust:exact}.stripe-top,.stripe-bottom{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style></head><body>
<div class="stripe-top"></div>
<div class="content">
<div class="header"><img src="${fullLogoUrl}" alt="Velora Log" />
<div class="header-right"><h1>ORÇAMENTO</h1>
<div class="number">Nº ${data.budgetNumber}</div>
<div class="date-line">Solicitação recebida em: ${data.requestDate}<br/>Gerado em: ${data.emissionDate}</div></div></div>
<div class="gold-divider"></div>
<div class="presentation"><p>${PRESENTATION_MESSAGE}</p></div>
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
<div class="info-item"><strong>Tipo de Carga:</strong> ${data.tipoCarga || '—'}</div>
<div class="info-item"><strong>Valor da Mercadoria:</strong> ${data.valorMercadoria ? 'R$ ' + data.valorMercadoria : '—'}</div>
<div class="info-item"><strong>Prazo Desejado:</strong> ${data.prazoDesejado || '—'}</div>
<div class="info-item"><strong>Qtd. Volumes:</strong> ${data.quantidadeVolumes || '—'}</div>
<div class="info-item"><strong>Peso:</strong> ${data.peso ? data.peso + ' kg' : '—'}</div>
<div class="info-item"><strong>Cubagem:</strong> ${data.cubagem ? data.cubagem + ' m³' : '—'}</div>
<div class="info-item"><strong>Necessita Seguro:</strong> ${data.necessitaSeguro || '—'}</div>
<div class="info-item"><strong>Necessita Picking:</strong> ${data.necessitaPicking || '—'}</div>
<div class="info-item"><strong>Necessita Cross Docking:</strong> ${data.necessitaCrossDocking || '—'}</div>
<div class="info-item"><strong>Necessita Fracionamento:</strong> ${data.necessitaFracionamento || '—'}</div>
<div class="info-item"><strong>Necessita Distribuição:</strong> ${data.necessitaDistribuicao || '—'}</div>
</div></div>
${servicesSection}
<div class="section"><div class="section-title">Proposta Comercial</div>
<div class="budget-grid">
<div class="budget-item"><strong>Valor</strong>R$ ${data.value || '—'}</div>
<div class="budget-item"><strong>Validade do Orçamento</strong>${data.validUntil || '—'}</div>
<div class="budget-item"><strong>Valor do Seguro</strong>R$ ${data.valorSeguro || '—'}</div>
<div class="budget-item"><strong>Forma de Pagamento</strong>${data.formaPagamento || '—'}</div>
<div class="budget-item"><strong>Prazo</strong>${data.prazoComercial || '—'}</div>
</div>
<div class="responsible-box">
<div class="title">Responsável pelo Atendimento</div>
<div class="info">
<div><strong>Nome:</strong> ${data.responsible || '—'}</div>
<div><strong>E-mail:</strong> ${data.responsibleEmail || '—'}</div>
<div><strong>Telefone:</strong> ${data.responsiblePhone || '—'}</div>
</div></div>
<div style="margin-top:6px;"><div class="section-title" style="font-size:11px;">Observações</div>
<div class="observations">${data.observations || '—'}</div></div></div>
<div class="brand-section">
<div class="title">Nossos Diferenciais</div>
<p>${DIFFERENTIALS_TEXT}</p>
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
