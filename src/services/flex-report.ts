import * as XLSX from 'xlsx'
import type { FlexMovement, FlexFilters } from './flex'

export interface FlexReportFilters {
  dateFrom?: string
  dateTo?: string
  empresaId?: string
  filialId?: string
  rcaId?: string
  gerenteId?: string
  equipeId?: string
  clienteId?: string
  produtoId?: string
  pedido?: string
  nf?: string
  type?: string
  integrationStatus?: string
}

const TYPE_LABEL: Record<string, string> = {
  credito_gerado: 'Crédito gerado',
  credito_liberado: 'Crédito liberado',
  reserva: 'Reserva',
  flex_gasto: 'FLEX gasto',
  liberacao_reserva: 'Liberação de reserva',
  estorno: 'Estorno',
  ajuste: 'Ajuste',
}

function fmtDate(value?: string | null): string {
  if (!value) return ''
  try {
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return value
    return d.toLocaleString('pt-BR')
  } catch {
    return value || ''
  }
}

function fmtMoney(v: number | undefined | null): string {
  const n = Number(v || 0)
  return n.toFixed(2).replace('.', ',')
}

/** Linhas do modelo (a) — resumo gerencial por RCA. */
export function buildFlexSummaryRows(
  movements: FlexMovement[],
  filters: FlexReportFilters,
  movementsBeforePeriod: FlexMovement[] = [],
): Record<string, string | number>[] {
  const perRca: Record<
    string,
    {
      nome: string
      gerente: string
      equipe: string
      inicial: number
      gerado: number
      liberado: number
      gasto: number
      reservado: number
      estornos: number
      ajustes: number
    }
  > = {}

  // Saldo inicial do período: saldo_after do último movimento ANTES do filtro de data
  for (const m of movements) {
    const key = m.rca_id
    if (!perRca[key]) {
      perRca[key] = {
        nome: m.rca_name || m.rca_id,
        gerente: m.gerente_name || '',
        equipe: m.equipe_name || '',
        inicial: 0,
        gerado: 0,
        liberado: 0,
        gasto: 0,
        reservado: 0,
        estornos: 0,
        ajustes: 0,
      }
    }
    const row = perRca[key]
    row.gerente = m.gerente_name || row.gerente
    row.equipe = m.equipe_name || row.equipe
    const v = Number(m.valor_flex || 0)
    if (m.type === 'credito_gerado') row.gerado += v
    else if (m.type === 'credito_liberado') row.liberado += v
    else if (m.type === 'flex_gasto') row.gasto += v
    else if (m.type === 'reserva') row.reservado += v
    else if (m.type === 'estorno') row.estornos += v
    else if (m.type === 'ajuste') row.ajustes += v
  }

  // Saldo inicial do período: soma dos movimentos ANTES do dateFrom
  for (const key of Object.keys(perRca)) {
    let inicial = 0
    for (const m of movementsBeforePeriod) {
      if (m.rca_id !== key) continue
      if (m.type === 'credito_gerado' || m.type === 'credito_liberado')
        inicial += Number(m.valor_flex || 0)
      else if (m.type === 'flex_gasto') inicial -= Number(m.valor_flex || 0)
      else if (m.type === 'estorno') inicial -= Number(m.valor_flex || 0)
      else if (m.type === 'ajuste') inicial += 0 // ajustes contam no período, não no inicial
    }
    perRca[key].inicial = inicial
  }

  return Object.values(perRca).map((r) => ({
    RCA: r.nome,
    Gerente: r.gerente,
    Equipe: r.equipe,
    'Saldo inicial do período': fmtMoney(r.inicial),
    'FLEX gerado': fmtMoney(r.gerado),
    'FLEX liberado': fmtMoney(r.liberado),
    'FLEX gasto': fmtMoney(r.gasto),
    'Reservas em aberto': fmtMoney(r.reservado),
    Estornos: fmtMoney(r.estornos),
    Ajustes: fmtMoney(r.ajustes),
    'Saldo disponível': fmtMoney(
      r.inicial + r.gerado + r.liberado + r.ajustes - r.gasto - r.estornos,
    ),
  }))
}

export interface FlexAccountRow {
  rca_id: string
  rca_name: string
  balance: number
  reserved: number
}

/** Linhas do modelo (b) — extrato detalhado por movimento. */
export function buildFlexDetailRows(movements: FlexMovement[]): Record<string, string | number>[] {
  return movements.map((m) => ({
    'Data/Hora': fmtDate(m.created),
    'Tipo de movimento': TYPE_LABEL[m.type] || m.type,
    Situação: m.status,
    Empresa: m.empresa_id,
    Filial: m.filial_id,
    RCA: m.rca_name || m.rca_id,
    Gerente: m.gerente_name || '',
    Equipe: m.equipe_name || '',
    Cliente: m.cliente_name || m.cliente_id,
    Produto: m.produto_descricao || m.produto_id,
    Quantidade: m.quantidade ?? '',
    'Preço-base': fmtMoney(m.preco_base),
    'Preço negociado': fmtMoney(m.preco_negociado),
    'Valor FLEX': fmtMoney(m.valor_flex),
    'Pedido FV': m.pedido_fv || '',
    'Pedido Huram': m.pedido_huram || '',
    NF: m.nf || '',
    Integração: m.integration_status || '',
    'Vínculo (crédito→uso)': m.link_type && m.link_id ? m.link_type + ' · ' + m.link_id : '',
    Motivo: m.reason || '',
    'Saldo antes': fmtMoney(m.balance_before),
    'Saldo depois': fmtMoney(m.balance_after),
  }))
}

function filterParts(filters: FlexReportFilters): string {
  const parts: string[] = []
  if (filters.dateFrom) parts.push(`De: ${filters.dateFrom}`)
  if (filters.dateTo) parts.push(`Até: ${filters.dateTo}`)
  if (filters.empresaId) parts.push(`Empresa: ${filters.empresaId}`)
  if (filters.filialId) parts.push(`Filial: ${filters.filialId}`)
  if (filters.rcaId) parts.push(`RCA: ${filters.rcaId}`)
  if (filters.gerenteId) parts.push(`Gerente: ${filters.gerenteId}`)
  if (filters.equipeId) parts.push(`Equipe: ${filters.equipeId}`)
  if (filters.clienteId) parts.push(`Cliente: ${filters.clienteId}`)
  if (filters.produtoId) parts.push(`Produto: ${filters.produtoId}`)
  if (filters.pedido) parts.push(`Pedido: ${filters.pedido}`)
  if (filters.nf) parts.push(`NF: ${filters.nf}`)
  if (filters.type) parts.push(`Tipo: ${TYPE_LABEL[filters.type] || filters.type}`)
  if (filters.integrationStatus) parts.push(`Integração: ${filters.integrationStatus}`)
  return parts.length > 0 ? parts.join(' | ') : 'Todos'
}

export interface FlexExportResult {
  fileName: string
  rows: number
}

/** Excel — dois modelos em abas separadas do mesmo arquivo. */
export function exportFlexReportToExcel(
  movements: FlexMovement[],
  filters: FlexReportFilters,
  accounts: FlexAccountRow[],
): FlexExportResult {
  const wb = XLSX.utils.book_new()
  const wsSummary = XLSX.utils.json_to_sheet(buildFlexSummaryRows(movements, accounts, filters))
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumo por RCA')
  const wsDetail = XLSX.utils.json_to_sheet(buildFlexDetailRows(movements))
  XLSX.utils.book_append_sheet(wb, wsDetail, 'Extrato detalhado')
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet([
      { Filtros: filterParts(filters), 'Data de emissão': fmtDate(new Date().toISOString()) },
    ]),
    'Filtros',
  )
  const fileName = `saldo-flex-${new Date().toISOString().slice(0, 10)}.xlsx`
  XLSX.writeFile(wb, fileName)
  return { fileName, rows: movements.length }
}

/** CSV (modelo b — extrato detalhado). */
export function exportFlexReportToCsv(movements: FlexMovement[]): FlexExportResult {
  const rows = buildFlexDetailRows(movements)
  const headers = rows.length > 0 ? Object.keys(rows[0]) : ['Sem registros']
  const lines = [headers.join(';')]
  for (const r of rows) {
    lines.push(
      headers
        .map((h) =>
          String(r[h] ?? '')
            .replace(/;/g, ',')
            .replace(/\n/g, ' '),
        )
        .join(';'),
    )
  }
  const blob = new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8' })
  const fileName = `saldo-flex-${new Date().toISOString().slice(0, 10)}.csv`
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  URL.revokeObjectURL(url)
  return { fileName, rows: rows.length }
}

/** PDF (via janela de impressão) — modelo (a) resumo gerencial com abertura por RCA. */
export function printFlexSummaryPdf(
  movements: FlexMovement[],
  accounts: FlexAccountRow[],
  filters: FlexReportFilters,
): number {
  const rows = buildFlexSummaryRows(movements, accounts, filters)
  const totalRows = rows.length
  const html = `
<html>
<head>
<meta charset="utf-8" />
<title>Saldo FLEX — Resumo gerencial</title>
<style>
  body { font-family: Arial, sans-serif; font-size: 11px; margin: 24px; }
  h1 { font-size: 16px; margin: 0 0 4px; }
  .meta { color: #555; margin-bottom: 12px; font-size: 10px; }
  table { width: 100%; border-collapse: collapse; }
  th, td { border: 1px solid #ccc; padding: 4px 6px; text-align: right; }
  th { background: #f3f4f6; text-align: left; }
  td:first-child, th:first-child { text-align: left; }
</style>
</head>
<body>
<h1>Saldo FLEX — Resumo gerencial por RCA</h1>
<p class="meta">
  Empresa: ${filters.empresaId || 'Todas'} · Filial: ${filters.filialId || 'Todas'}<br/>
  Período: ${filters.dateFrom || 'início'} a ${filters.dateTo || 'hoje'}<br/>
  Filtros aplicados: ${filterParts(filters)}<br/>
  Data de emissão: ${fmtDate(new Date().toISOString())}
</p>
<table>
<thead>
<tr><th>RCA</th><th>Gerente</th><th>Equipe</th><th>Saldo inicial</th><th>Gerado</th><th>Liberado</th><th>Gasto</th><th>Reservas</th><th>Estornos</th><th>Ajustes</th><th>Saldo disponível</th></tr>
</thead>
<tbody>
${rows
  .map(
    (r) =>
      `<tr><td>${r['RCA']}</td><td>${r['Gerente']}</td><td>${r['Equipe']}</td><td>${r['Saldo inicial do período']}</td><td>${r['FLEX gerado']}</td><td>${r['FLEX liberado']}</td><td>${r['FLEX gasto']}</td><td>${r['Reservas em aberto']}</td><td>${r['Estornos']}</td><td>${r['Ajustes']}</td><td>${r['Saldo disponível']}</td></tr>`,
  )
  .join('')}
</tbody>
</table>
</body>
</html>`
  const w = window.open('', '_blank', 'width=1000,height=700')
  if (!w) return -1
  w.document.write(html)
  w.document.close()
  w.focus()
  w.print()
  return totalRows
}

/** PDF — modelo (b) extrato detalhado. */
export function printFlexDetailPdf(movements: FlexMovement[], filters: FlexReportFilters): number {
  const rows = buildFlexDetailRows(movements)
  const totalRows = rows.length
  const html = `
<html>
<head>
<meta charset="utf-8" />
<title>Saldo FLEX — Extrato detalhado</title>
<style>
  body { font-family: Arial, sans-serif; font-size: 10px; margin: 20px; }
  h1 { font-size: 15px; margin: 0 0 4px; }
  .meta { color: #555; margin-bottom: 10px; font-size: 9px; }
  table { width: 100%; border-collapse: collapse; }
  th, td { border: 1px solid #ccc; padding: 3px 5px; }
  th { background: #f3f4f6; text-align: left; }
</style>
</head>
<body>
<h1>Saldo FLEX — Extrato detalhado</h1>
<p class="meta">
  Empresa: ${filters.empresaId || 'Todas'} · Filial: ${filters.filialId || 'Todas'} ·
  Período: ${filters.dateFrom || 'início'} a ${filters.dateTo || 'hoje'}<br/>
  Filtros: ${filterParts(filters)} · Data de emissão: ${fmtDate(new Date().toISOString())} ·
  Total de movimentos: ${totalRows}
</p>
<table>
<thead>
<tr><th>Data/Hora</th><th>Tipo</th><th>RCA</th><th>Cliente</th><th>Produto</th><th>Valor FLEX</th><th>Pedido FV</th><th>Pedido Huram</th><th>NF</th><th>Integração</th><th>Motivo</th></tr>
</thead>
<tbody>
${rows
  .map(
    (r) =>
      `<tr><td>${r['Data/Hora']}</td><td>${r['Tipo de movimento']}</td><td>${r['RCA']}</td><td>${r['Cliente']}</td><td>${r['Produto']}</td><td>${r['Valor FLEX']}</td><td>${r['Pedido FV']}</td><td>${r['Pedido Huram']}</td><td>${r['NF']}</td><td>${r['Integração']}</td><td>${r['Motivo']}</td></tr>`,
  )
  .join('')}
</tbody>
</table>
</body>
</html>`
  const w = window.open('', '_blank', 'width=1100,height=750')
  if (!w) return -1
  w.document.write(html)
  w.document.close()
  w.focus()
  w.print()
  return totalRows
}
