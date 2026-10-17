import pb from '@/lib/pocketbase/client'

// Exportação da Consulta de Pedidos (Excel nativo + PDF via janela de impressão).
// Verde institucional do Jetro: #005B2E — branco e dourado na identidade visual.

export const EXPORT_LIMIT = 10000

export interface SalesOrderExportRow {
  id: string
  order_number?: string
  integration_order_number?: string
  client_name?: string
  customer_cnpj?: string
  team?: string
  rca_name?: string
  created?: string
  operation_type?: string
  sales_channel?: string
  total_value?: string
  status?: string
  is_balance?: boolean
  generated_balance?: boolean
  is_invoiced?: boolean
}

export type QueryFilters = {
  operation_type: string
  client: string
  team: string
  rca: string
  customer_group: string
  city: string
  district: string
  address: string
  price_table: string
  order_number: string
  integration_number: string
  date_from: string
  date_to: string
  statuses: string[]
  is_balance: string
  generated_balance: string
  channel: string
  only_invoiced: boolean
}

const PAGE_SIZE = 200

/** Busca TODOS os registros correspondentes aos filtros aplicados (ignora a paginação da tela). */
export async function fetchAllForExport(
  filter: string,
  onProgress?: (loaded: number) => void,
): Promise<SalesOrderExportRow[]> {
  const all: SalesOrderExportRow[] = []
  let page = 1
  let fetched = 0

  while (fetched < EXPORT_LIMIT) {
    const result = (await pb.collection('sales_orders').getList(page, PAGE_SIZE, {
      filter,
      sort: '-created',
    })) as { items: SalesOrderExportRow[]; totalItems: number }

    const items = result.items || []
    all.push(...items)
    fetched += items.length
    onProgress?.(all.length)

    const totalPages = Math.ceil((result.totalItems || 0) / PAGE_SIZE)
    if (page >= totalPages || items.length === 0) break
    page += 1
  }

  if (fetched >= EXPORT_LIMIT) return all.slice(0, EXPORT_LIMIT)
  return all
}

const fmt = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

function formatCurrency(value?: string): string {
  if (!value) return ''
  const num = parseFloat(value)
  if (Number.isNaN(num)) return value
  return fmt.format(num)
}

function formatDate(value?: string): string {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value || ''
  return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

const yesNo = (v?: boolean) => (v ? 'Sim' : 'Não')

export const EXPORT_COLUMNS = [
  'Nº do pedido',
  'Nº integração',
  'Cliente',
  'CNPJ',
  'Equipe',
  'RCA',
  'Data',
  'Tipo de operação',
  'Canal',
  'Valor',
  'Status',
  'É saldo',
  'Gerou saldo',
  'Faturado',
] as const

export function rowToArray(row: SalesOrderExportRow): string[] {
  return [
    row.order_number || '',
    row.integration_order_number || '',
    row.client_name || '',
    row.customer_cnpj || '',
    row.team || '',
    row.rca_name || '',
    formatDate(row.created),
    row.operation_type || '',
    row.sales_channel || '',
    formatCurrency(row.total_value),
    row.status || '',
    yesNo(row.is_balance),
    yesNo(row.generated_balance),
    yesNo(row.is_invoiced),
  ]
}

// ---------------------------------------------------------------------------
// Excel (.xlsx gerado nativamente, sem dependências externas)
// ---------------------------------------------------------------------------

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function columnLetter(n: number): string {
  let s = ''
  while (n >= 0) {
    s = String.fromCharCode((n % 26) + 65) + s
    n = Math.floor(n / 26) - 1
  }
  return s
}

interface Cell {
  v: string
  t: 'inlineStr' | 'n'
  s?: number
  numFmt?: string
}

function buildSheetXml(rows: Cell[][], colWidths: number[]): string {
  const cols = colWidths
    .map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`)
    .join('')

  const sheetRows = rows
    .map((cells, rIdx) => {
      const tds = cells
        .map((c, cIdx) => {
          const ref = `${columnLetter(cIdx)}${rIdx + 1}`
          const styleAttr = c.s !== undefined ? ` s="${c.s}"` : ''
          if (c.t === 'n') {
            return `<c r="${ref}" t="n"${styleAttr}><v>${c.v}</v></c>`
          }
          return `<c r="${ref}" t="inlineStr"${styleAttr}><is><t xml:space="preserve">${xmlEscape(c.v)}</t></is></c>`
        })
        .join('')
      return `<row r="${rIdx + 1}">${tds}</row>`
    })
    .join('')

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${sheetRows}</sheetData></worksheet>`
}

function crc32(bytes: Uint8Array): number {
  let c: number
  const table: number[] = []
  for (let n = 0; n < 256; n++) {
    c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c
  }
  let crc = 0 ^ -1
  for (let i = 0; i < bytes.length; i++) crc = (crc >>> 8) ^ table[(crc ^ bytes[i]) & 0xff]
  return (crc ^ -1) >>> 0
}

interface ZipEntry {
  name: string
  data: Uint8Array
}

function buildZip(entries: ZipEntry[]): Uint8Array {
  const encoder = new TextEncoder()
  const chunks: Uint8Array[] = []
  const central: string[] = []
  let offset = 0

  const u16 = (v: number) => [v & 0xff, (v >> 8) & 0xff]
  const u32 = (v: number) => [v & 0xff, (v >> 8) & 0xff, (v >> 16) & 0xff, (v >>> 24) & 0xff]

  for (const entry of entries) {
    const nameBytes = encoder.encode(entry.name)
    const crc = crc32(entry.data)
    const size = entry.data.length

    const local = new Uint8Array([
      ...u32(0x04034b50),
      ...u16(20),
      ...u16(0x0800), // UTF-8
      ...u16(0),
      ...u16(0),
      ...u16(0),
      ...u32(crc),
      ...u32(size),
      ...u32(size),
      ...u16(nameBytes.length),
      ...u16(0),
      ...nameBytes,
      ...entry.data,
    ])
    chunks.push(local)

    central.push(
      String.fromCharCode(
        ...u32(0x02014b50),
        ...u16(20),
        ...u16(20),
        ...u16(0x0800),
        ...u16(0),
        ...u16(0),
        ...u16(0),
        ...u32(crc),
        ...u32(size),
        ...u32(size),
        ...u16(nameBytes.length),
        ...u16(0),
        ...u16(0),
        ...u16(0),
        ...u16(0),
        ...u32(0),
        ...u32(offset),
        ...Array.from(nameBytes),
      ),
    )
    offset += local.length
  }

  const centralBytes = encoder.encode(central.join(''))
  const endRecord = new Uint8Array([
    ...u32(0x06054b50),
    ...u16(0),
    ...u16(0),
    ...u16(entries.length),
    ...u16(entries.length),
    ...u32(centralBytes.length),
    ...u32(offset),
    ...u16(0),
  ])

  const total = offset + centralBytes.length + endRecord.length
  const out = new Uint8Array(total)
  let pos = 0
  for (const chunk of chunks) {
    out.set(chunk, pos)
    pos += chunk.length
  }
  out.set(centralBytes, pos)
  pos += centralBytes.length
  out.set(endRecord, pos)
  return out
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

// Estilos: 0 = cabeçalho (verde Jetro, negrito, branco), 1 = valor monetário, 2 = padrão
const XLSX_STYLES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="3">
    <font><sz val="10"/><name val="Calibri"/></font>
    <font><b/><color rgb="FFFFFFFF"/><sz val="11"/><name val="Calibri"/></font>
    <font><b/><sz val="10"/><name val="Calibri"/></font>
  </fonts>
  <fills count="3">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF005B2E"/><bgColor indexed="64"/></patternFill></fill>
  </fills>
  <borders count="2">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border>
      <left style="thin"><color rgb="FFD0D0D0"/></left><right style="thin"><color rgb="FFD0D0D0"/></right>
      <top style="thin"><color rgb="FFD0D0D0"/></top><bottom style="thin"><color rgb="FFD0D0D0"/></bottom><diagonal/>
    </border>
  </borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="4">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/>
    <xf numFmtId="0" fontId="2" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1"/>
    <xf numFmtId="3" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1"/>
  </cellXfs>
</styleSheet>`

export function exportOrdersToExcel(
  rows: SalesOrderExportRow[],
  applied: QueryFilters,
  filename: string,
) {
  const encoder = new TextEncoder()

  const headerCells: Cell[] = EXPORT_COLUMNS.map((h) => ({ v: h, t: 'inlineStr', s: 1 }))
  const bodyRows: Cell[][] = rows.map((row) => {
    const arr = rowToArray(row)
    return arr.map((v, i) => {
      if (i === 9) {
        const num = parseFloat(row.total_value || '')
        if (!Number.isNaN(num)) return { v: String(num), t: 'n', s: 3 }
        return { v, t: 'inlineStr', s: 2 }
      }
      return { v, t: 'inlineStr', s: 2 }
    })
  })
  const totalRow: Cell[] = EXPORT_COLUMNS.map((_, i) => {
    if (i === 8) return { v: 'Total', t: 'inlineStr', s: 2 }
    if (i === 9) return { v: String(totalValue(rows)), t: 'n', s: 3 }
    return { v: '', t: 'inlineStr', s: 2 }
  })

  const sheet = buildSheetXml(
    [[...headerCells], ...bodyRows, totalRow],
    [12, 16, 34, 18, 14, 14, 18, 18, 16, 14, 16, 8, 12, 10],
  )

  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const created = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}Z`

  const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Consulta Pedidos" sheetId="1" r:id="rId1"/></sheets></workbook>`

  const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>`

  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`

  const rootRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`

  const zip = buildZip([
    { name: '[Content_Types].xml', data: encoder.encode(contentTypes) },
    { name: '_rels/.rels', data: encoder.encode(rootRels) },
    { name: 'xl/workbook.xml', data: encoder.encode(workbookXml) },
    { name: 'xl/_rels/workbook.xml.rels', data: encoder.encode(rels) },
    { name: 'xl/styles.xml', data: encoder.encode(XLSX_STYLES) },
    { name: 'xl/worksheets/sheet1.xml', data: encoder.encode(sheet) },
  ])

  downloadBlob(
    new Blob([zip as unknown as BlobPart], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }),
    filename,
  )
  void applied
  void created
}

function totalValue(rows: SalesOrderExportRow[]): number {
  return rows.reduce((sum, r) => sum + (parseFloat(r.total_value || '') || 0), 0)
}

// ---------------------------------------------------------------------------
// PDF (janela de impressão do navegador — texto real, com cabeçalho Jetro)
// ---------------------------------------------------------------------------

export function exportOrdersToPdf(
  rows: SalesOrderExportRow[],
  applied: QueryFilters,
  filterLabels: Record<string, string>,
) {
  const win = window.open('', '_blank')
  if (!win) throw new Error('popup')

  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  const filterEntries = Object.entries(filterLabels).filter(([, v]) => v !== '')

  const head = `
    <tr class="head">
      ${EXPORT_COLUMNS.map((h) => `<th>${esc(h)}</th>`).join('')}
    </tr>`

  const body = rows
    .map((row) => {
      const arr = rowToArray(row)
      return `<tr>${arr
        .map((v, i) => `<td class="${i === 9 ? 'num' : ''}">${esc(v) || '&nbsp;'}</td>`)
        .join('')}</tr>`
    })
    .join('')

  const total = totalValue(rows)

  const filterLines = filterEntries
    .map(([label, value]) => `<li><strong>${esc(label)}:</strong> ${esc(value)}</li>`)
    .join('')

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<title>Consulta de Pedidos — Jetro</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; margin: 24px; color: #1f2937; }
  .header { display: flex; align-items: center; gap: 12px; border-bottom: 3px solid #005B2E; padding-bottom: 12px; margin-bottom: 16px; }
  .brand { background: #005B2E; color: #fff; font-size: 22px; font-weight: bold; padding: 8px 18px; letter-spacing: 1px; }
  .brand span { color: #C9A227; }
  h1 { font-size: 16px; margin: 0; color: #005B2E; }
  .meta { font-size: 11px; color: #6b7280; margin-top: 4px; }
  h2 { font-size: 13px; color: #005B2E; margin: 18px 0 6px; text-transform: uppercase; letter-spacing: .5px; }
  ul.filters { margin: 0 0 8px; padding-left: 18px; font-size: 11px; columns: 2; column-gap: 24px; }
  ul.filters li { margin-bottom: 2px; }
  table { width: 100%; border-collapse: collapse; font-size: 9.5px; margin-top: 8px; }
  th { background: #005B2E; color: #fff; text-align: left; padding: 5px 6px; border: 1px solid #00401f; }
  td { padding: 4px 6px; border: 1px solid #e5e7eb; }
  tr:nth-child(even) td { background: #f4faf6; }
  td.num { text-align: right; white-space: nowrap; }
  tfoot td { background: #FDF6E3; font-weight: bold; border-top: 2px solid #005B2E; }
  tfoot td.num { text-align: right; }
  .summary { margin-top: 14px; font-size: 11px; background: #f4faf6; border-left: 4px solid #005B2E; padding: 10px 14px; }
  .summary strong { color: #005B2E; }
  @media print {
    body { margin: 8mm; }
    @page { size: A4 landscape; margin: 8mm; }
    thead { display: table-header-group; }
    tfoot { display: table-footer-group; }
    tr { page-break-inside: avoid; }
  }
</style>
</head>
<body>
  <div class="header">
    <div class="brand">JETRO<span>.</span></div>
    <div>
      <h1>Consulta de Pedidos — Jetro</h1>
      <div class="meta">Emitido em ${formatDate(new Date().toISOString())} • ${rows.length} pedido(s)</div>
    </div>
  </div>

  <h2>Filtros aplicados</h2>
  ${filterEntries.length > 0 ? `<ul class="filters">${filterLines}</ul>` : '<p class="meta">Nenhum filtro aplicado (todos os pedidos visíveis para o usuário).</p>'}

  <table>
    <thead>${head}</thead>
    <tbody>${body}</tbody>
    <tfoot>
      <tr><td colspan="9">Total de ${rows.length} pedido(s)</td><td class="num">${formatCurrency(String(total))}</td><td colspan="4"></td></tr>
    </tfoot>
  </table>

  <div class="summary">
    <strong>Resumo:</strong> ${rows.length} pedido(s) • Valor total ${formatCurrency(String(total))}
  </div>

  <script>window.onload = function () { setTimeout(function () { window.print(); }, 300) }</script>
</body>
</html>`

  win.document.open()
  win.document.write(html)
  win.document.close()
}
