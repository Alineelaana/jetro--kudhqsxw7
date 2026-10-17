import jetroLogoUrl from '@/assets/whatsapp-image-2026-08-09-at-23.25.57-c8e57.jpeg'

export interface BudgetPdfData {
  id?: string
  budget_number?: string
  budgetNumber?: string
  request_number?: number | string
  client_name?: string
  clientName?: string
  client_email?: string
  clientEmail?: string
  client_phone?: string
  clientPhone?: string
  clientCompany?: string
  service?: string
  created?: string
  status?: string
  total_value?: string | number
  quote_created_at?: string
  responsible_email?: string
  responsible_phone?: string
  responsible?: string
  responsibleEmail?: string
  responsiblePhone?: string
  emissionDate?: string
  requestDate?: string
  origin?: string
  destination?: string
  merchandise?: string
  volume?: string
  operationType?: string
  periodicity?: string
  value?: string | number
  validUntil?: string
  observations?: string
  servicosInclusos?: string[]
  valorMercadoria?: string
  necessitaSeguro?: string
  necessitaPicking?: string
  necessitaCrossDocking?: string
  necessitaFracionamento?: string
  necessitaDistribuicao?: string
  prazoDesejado?: string
  quantidadeVolumes?: string
  peso?: string
  cubagem?: string
  tipoCarga?: string
  valorSeguro?: string
  formaPagamento?: string
  prazoComercial?: string
  userName?: string
  services?: Array<{
    name?: string
    servico?: string
    description?: string
    observacoes?: string
    value?: string | number
  }>
  data?: Record<string, any>
  status_history?: any[]
  sending_history?: any[]
}

export function getJetroLogoUrl(): string {
  return jetroLogoUrl
}

export function generateBudgetPdfHtml(request: BudgetPdfData): string {
  const budgetNum =
    request.budget_number ||
    (request.request_number ? `ORC-${String(request.request_number).padStart(4, '0')}` : 'ORC-0001')
  const clientName =
    request.client_name || request.data?.nome || request.data?.client_name || 'Cliente'
  const clientEmail = request.client_email || request.data?.email || '-'
  const clientPhone = request.client_phone || request.data?.telefone || '-'
  const service = request.service || request.data?.servico || 'Operações Logísticas'
  const dateStr = request.created
    ? new Date(request.created).toLocaleDateString('pt-BR')
    : new Date().toLocaleDateString('pt-BR')
  const totalVal = request.total_value
    ? `R$ ${Number(request.total_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    : 'Sob Consulta'

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>Solicitação de Orçamento - Jetro #${budgetNum}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1e293b; margin: 0; padding: 24px; background: #ffffff; line-height: 1.5; }
    .header-container { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #047857; padding-bottom: 16px; margin-bottom: 24px; }
    .logo-img { height: 68px; max-width: 260px; object-fit: contain; }
    .company-details { text-align: right; }
    .company-name { font-size: 22px; font-weight: 800; color: #047857; margin: 0; letter-spacing: 0.5px; text-transform: uppercase; }
    .company-slogan { font-size: 11px; color: #059669; font-weight: 600; margin-top: 2px; }
    .company-info { font-size: 11px; color: #64748b; margin-top: 4px; line-height: 1.3; }
    .document-banner { background: linear-gradient(135deg, #065f46 0%, #047857 100%); color: #ffffff; padding: 14px 20px; border-radius: 8px; text-align: center; margin-bottom: 24px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
    .document-title { font-size: 18px; font-weight: 700; margin: 0; letter-spacing: 1px; text-transform: uppercase; }
    .document-subtitle { font-size: 12px; color: #a7f3d0; margin-top: 4px; }
    .section-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
    .info-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 18px; }
    .card-heading { font-size: 12px; font-weight: 700; color: #047857; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; }
    .info-row { font-size: 12px; margin-bottom: 6px; display: flex; }
    .info-label { font-weight: 600; color: #475569; width: 100px; flex-shrink: 0; }
    .info-value { color: #0f172a; flex-grow: 1; }
    .status-badge { display: inline-block; background: #d1fae5; color: #065f46; font-weight: 700; font-size: 11px; padding: 2px 10px; border-radius: 12px; text-transform: uppercase; }
    .table-container { margin-bottom: 24px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th { background: #047857; color: #ffffff; font-weight: 700; text-align: left; padding: 10px 14px; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
    td { padding: 10px 14px; border-bottom: 1px solid #f1f5f9; color: #334155; }
    tr:nth-child(even) td { background-color: #f8fafc; }
    tr:last-child td { border-bottom: none; }
    .notes-box { background: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 14px 18px; margin-bottom: 24px; }
    .notes-heading { font-size: 12px; font-weight: 700; color: #b45309; text-transform: uppercase; margin-bottom: 6px; }
    .notes-content { font-size: 12px; color: #78350f; line-height: 1.5; }
    .footer { text-align: center; border-top: 1px solid #e2e8f0; padding-top: 18px; margin-top: 32px; font-size: 11px; color: #64748b; }
    .footer-brand { font-weight: 700; color: #047857; margin-bottom: 4px; }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header-container">
    <img src="${jetroLogoUrl}" alt="Jetro Logo" class="logo-img" />
    <div class="company-details">
      <div class="company-name">Jetro</div>
      <div class="company-slogan">Inteligência que Conecta. Tecnologia que Evolui.</div>
      <div class="company-info">
        Operações Logísticas Premium - Espírito Santo<br/>
        Atendimento: contato@jetrolog.com.br
      </div>
    </div>
  </div>

  <div class="document-banner">
    <h1 class="document-title">Solicitação de Orçamento</h1>
    <div class="document-subtitle">Documento Oficial de Cotação de Serviços Nº ${budgetNum}</div>
  </div>

  <div class="section-grid">
    <div class="info-card">
      <div class="card-heading">Dados do Cliente</div>
      <div class="info-row">
        <span class="info-label">Nome:</span>
        <span class="info-value">${clientName}</span>
      </div>
      <div class="info-row">
        <span class="info-label">E-mail:</span>
        <span class="info-value">${clientEmail}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Telefone:</span>
        <span class="info-value">${clientPhone}</span>
      </div>
    </div>

    <div class="info-card">
      <div class="card-heading">Resumo da Cotação</div>
      <div class="info-row">
        <span class="info-label">Nº Registro:</span>
        <span class="info-value"><strong>${budgetNum}</strong></span>
      </div>
      <div class="info-row">
        <span class="info-label">Data Emissão:</span>
        <span class="info-value">${dateStr}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Serviço:</span>
        <span class="info-value">${service}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Status:</span>
        <span class="info-value"><span class="status-badge">${request.status || 'Em Análise'}</span></span>
      </div>
    </div>
  </div>

  ${
    request.services && request.services.length > 0
      ? `
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th style="width: 30%;">Serviço / Módulo</th>
            <th style="width: 50%;">Descrição Detalhada</th>
            <th style="width: 20%; text-align: right;">Valor Estimado</th>
          </tr>
        </thead>
        <tbody>
          ${request.services
            .map(
              (s) => `
            <tr>
              <td><strong>${s.name || s.servico || service}</strong></td>
              <td>${s.description || s.observacoes || 'Serviço operacional contratado via plataforma Jetro.'}</td>
              <td style="text-align: right; font-weight: 600;">${
                s.value
                  ? `R$ ${Number(s.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                  : totalVal
              }</td>
            </tr>
          `,
            )
            .join('')}
        </tbody>
      </table>
    </div>
  `
      : `
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Serviço Solicitado</th>
            <th>Descrição</th>
            <th style="text-align: right;">Estimativa</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>${service}</strong></td>
            <td>Solicitação de cotação para operações logísticas efetuada via portal Jetro.</td>
            <td style="text-align: right; font-weight: 600;">${totalVal}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `
  }

  ${
    request.data && Object.keys(request.data).length > 0
      ? `
    <div class="notes-box">
      <div class="notes-heading">Informações Complementares da Solicitação</div>
      <div class="notes-content">
        ${Object.entries(request.data)
          .filter(
            ([k]) =>
              ![
                'nome',
                'email',
                'telefone',
                'servico',
                'client_name',
                'client_email',
                'client_phone',
              ].includes(k.toLowerCase()),
          )
          .map(
            ([key, val]) => `
            <div style="margin-bottom: 4px;">
              <strong style="text-transform: capitalize;">${key.replace(/_/g, ' ')}:</strong> ${
                typeof val === 'object' ? JSON.stringify(val) : String(val)
              }
            </div>
          `,
          )
          .join('')}
      </div>
    </div>
  `
      : ''
  }

  <div class="footer">
    <div class="footer-brand">Jetro - Operações Logísticas e Plataforma de Gestão</div>
    <div>Inteligência que Conecta. Tecnologia que Evolui. Resultados que Transformam.</div>
    <div style="margin-top: 6px; font-size: 10px; color: #94a3b8;">Documento gerado eletronicamente em ${new Date().toLocaleString('pt-BR')}. Válido sem assinatura por 30 dias.</div>
  </div>
</body>
</html>`
}

export function downloadBudgetPdf(request: BudgetPdfData): void {
  const html = generateBudgetPdfHtml(request)
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
    }, 400)
  }
}

export const generateBudgetPdf = downloadBudgetPdf
export const exportBudgetPdf = downloadBudgetPdf
