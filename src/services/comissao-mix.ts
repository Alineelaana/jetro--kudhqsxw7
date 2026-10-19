/**
 * Service: Comissões MIX - Jetro ERP
 *
 * Gerencia percentuais de comissão por produto/item (coleção `commission_mix`),
 * edição individual, edição em massa por atributos com auditoria,
 * histórico detalhado de vigência por item, importação/exportação Excel e geração de modelo.
 */

import pb from '@/lib/pocketbase/client'
import { exportToExcel } from '@/components/jetro-table/table-export'
import { parseNumberBRL } from '@/lib/margens-gr-parser'

export interface CommissionMixHistoryEntry {
  data: string
  usuario_id?: string
  usuario_nome: string
  usuario_role?: string
  percentual_anterior: number
  novo_percentual: number
  vigencia_inicio: string
  vigencia_fim?: string
  motivo?: string
  tipo_alteracao?: 'INDIVIDUAL' | 'EM_MASSA' | 'IMPORTACAO_EXCEL' | 'CARGA_INICIAL'
}

export interface CommissionMixItem {
  id: string
  product_id: string
  product_code: string
  product_ean?: string
  product_name: string
  brand?: string
  supplier?: string
  category?: string
  product_line?: string
  price: number
  commission_percentage: number
  status: 'Ativo' | 'Inativo'
  vigencia_inicio?: string
  vigencia_fim?: string
  history?: CommissionMixHistoryEntry[]
  updated_by_user_id?: string
  updated_by_user_name?: string
  created?: string
  updated?: string
}

export interface CommissionMixFilter {
  search?: string // busca em código, ean ou nome
  code?: string
  ean?: string
  description?: string
  brand?: string
  supplier?: string
  category?: string
  product_line?: string
  commission_type?: 'all' | 'with' | 'without' // com / sem comissão
  percentage_min?: number
  percentage_max?: number
  status?: 'all' | 'Ativo' | 'Inativo'
}

export interface BulkUpdateParams {
  filter_type: 'ids' | 'brand' | 'supplier' | 'category' | 'product_line' | 'all'
  filter_value?: string
  ids?: string[]
  new_percentage: number
  vigencia_inicio: string
  motivo: string
}

export interface BulkUpdateResult {
  success: boolean
  total_afetados: number
  itens_atualizados: Array<{
    id: string
    code: string
    name: string
    old: number
    new: number
  }>
  message?: string
}

export interface ImportPreviewItem {
  linha: number
  product_code: string
  product_ean?: string
  product_name?: string
  record_id?: string
  percentual_atual: number
  novo_percentual: number
  vigencia_inicio: string
  motivo: string
  status_import: 'valido' | 'nao_encontrado' | 'invalido'
  motivo_erro?: string
}

export interface ImportValidationResult {
  totalLidos: number
  validos: ImportPreviewItem[]
  naoEncontrados: ImportPreviewItem[]
  invalidos: ImportPreviewItem[]
}

const COLLECTION = 'commission_mix'

/**
 * Lista todos os itens de comissão MIX com filtro flexível
 */
export async function listCommissionMix(
  filter?: CommissionMixFilter,
): Promise<CommissionMixItem[]> {
  try {
    const filterParts: string[] = []

    if (filter?.status && filter.status !== 'all') {
      filterParts.push(`status = "${filter.status}"`)
    }
    if (filter?.brand) {
      filterParts.push(`brand ~ "${filter.brand}"`)
    }
    if (filter?.supplier) {
      filterParts.push(`supplier ~ "${filter.supplier}"`)
    }
    if (filter?.category) {
      filterParts.push(`category ~ "${filter.category}"`)
    }
    if (filter?.product_line) {
      filterParts.push(`product_line ~ "${filter.product_line}"`)
    }

    const filterString = filterParts.join(' && ')

    const records = await pb.collection(COLLECTION).getFullList<CommissionMixItem>({
      filter: filterString || undefined,
      sort: 'product_name',
      requestKey: null,
    })

    // Filtros em memória (para tolerância de normalização textual e limites numéricos)
    let filtered = records
    if (filter?.search) {
      const q = filter.search.toLowerCase().trim()
      filtered = filtered.filter(
        (it) =>
          it.product_name?.toLowerCase().includes(q) ||
          it.product_code?.toLowerCase().includes(q) ||
          it.product_ean?.toLowerCase().includes(q) ||
          it.brand?.toLowerCase().includes(q) ||
          it.supplier?.toLowerCase().includes(q),
      )
    }
    if (filter?.code) {
      const c = filter.code.toLowerCase().trim()
      filtered = filtered.filter((it) => it.product_code?.toLowerCase().includes(c))
    }
    if (filter?.ean) {
      const e = filter.ean.toLowerCase().trim()
      filtered = filtered.filter((it) => it.product_ean?.toLowerCase().includes(e))
    }
    if (filter?.description) {
      const d = filter.description.toLowerCase().trim()
      filtered = filtered.filter((it) => it.product_name?.toLowerCase().includes(d))
    }
    if (filter?.commission_type === 'with') {
      filtered = filtered.filter((it) => (it.commission_percentage || 0) > 0)
    } else if (filter?.commission_type === 'without') {
      filtered = filtered.filter((it) => (it.commission_percentage || 0) === 0)
    }
    if (filter?.percentage_min !== undefined && !isNaN(filter.percentage_min)) {
      filtered = filtered.filter((it) => (it.commission_percentage || 0) >= filter.percentage_min!)
    }
    if (filter?.percentage_max !== undefined && !isNaN(filter.percentage_max)) {
      filtered = filtered.filter((it) => (it.commission_percentage || 0) <= filter.percentage_max!)
    }

    return filtered
  } catch (err) {
    console.error('Erro ao listar comissões MIX:', err)
    throw err
  }
}

/**
 * Atualiza um único item de comissão MIX gravando trilha de histórico
 */
export async function updateCommissionMixItem(params: {
  id: string
  commission_percentage: number
  vigencia_inicio: string
  vigencia_fim?: string
  status?: 'Ativo' | 'Inativo'
  motivo?: string
  tipo_alteracao?: 'INDIVIDUAL' | 'IMPORTACAO_EXCEL'
}): Promise<CommissionMixItem> {
  const currentRecord = await pb.collection(COLLECTION).getOne<CommissionMixItem>(params.id)
  const user = pb.authStore.model
  const userName = user?.name || user?.email || 'Usuário'
  const userId = user?.id || 'sistema'
  const userRole = user?.role || 'PADRAO'

  const history = Array.isArray(currentRecord.history) ? [...currentRecord.history] : []
  const now = new Date().toISOString()

  history.push({
    data: now,
    usuario_id: userId,
    usuario_nome: userName,
    usuario_role: userRole,
    percentual_anterior: currentRecord.commission_percentage || 0,
    novo_percentual: params.commission_percentage,
    vigencia_inicio: params.vigencia_inicio,
    vigencia_fim: params.vigencia_fim,
    motivo: params.motivo || 'Atualização individual de comissão MIX',
    tipo_alteracao: params.tipo_alteracao || 'INDIVIDUAL',
  })

  const payload: Partial<CommissionMixItem> = {
    commission_percentage: params.commission_percentage,
    vigencia_inicio: params.vigencia_inicio,
    vigencia_fim: params.vigencia_fim || '',
    history,
    updated_by_user_id: userId,
    updated_by_user_name: userName,
  }

  if (params.status) {
    payload.status = params.status
  }

  const updated = await pb.collection(COLLECTION).update<CommissionMixItem>(params.id, payload)
  return updated
}

/**
 * Executa edição em massa chamando o endpoint seguro do backend
 * com registro de auditoria e histórico em lote
 */
export async function executeBulkUpdate(params: BulkUpdateParams): Promise<BulkUpdateResult> {
  const token = pb.authStore.token
  const baseUrl = import.meta.env.VITE_POCKETBASE_URL || ''

  const response = await fetch(`${baseUrl}/backend/v1/comissao/mix/bulk-update`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify(params),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }))
    throw new Error(errorData.message || `Erro HTTP ${response.status} na edição em massa`)
  }

  return response.json()
}

/**
 * Obtém as listas de marcas, fornecedores e categorias distintas para filtros
 */
export async function getDistinctAttributes(): Promise<{
  brands: string[]
  suppliers: string[]
  categories: string[]
  productLines: string[]
}> {
  const all = await pb.collection(COLLECTION).getFullList<CommissionMixItem>({
    fields: 'brand,supplier,category,product_line',
    requestKey: null,
  })

  const brands = new Set<string>()
  const suppliers = new Set<string>()
  const categories = new Set<string>()
  const productLines = new Set<string>()

  for (const item of all) {
    if (item.brand) brands.add(item.brand.trim())
    if (item.supplier) suppliers.add(item.supplier.trim())
    if (item.category) categories.add(item.category.trim())
    if (item.product_line) productLines.add(item.product_line.trim())
  }

  return {
    brands: Array.from(brands).sort(),
    suppliers: Array.from(suppliers).sort(),
    categories: Array.from(categories).sort(),
    productLines: Array.from(productLines).sort(),
  }
}

// ---------------------------------------------------------------------------
// Geração e Download de Modelo Excel (.xlsx) Nativo (zero libs externas)
// ---------------------------------------------------------------------------

function xmlEscape(s: string): string {
  return (s || '')
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

function crc32(bytes: Uint8Array): number {
  const table: number[] = []
  for (let n = 0; n < 256; n++) {
    let c = n
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
      ...u16(0), // store
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

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

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
    <fill><patternFill patternType="solid"><fgColor rgb="FF002817"/><bgColor indexed="64"/></patternFill></fill>
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
    <xf numFmtId="2" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1"/>
  </cellXfs>
</styleSheet>`

/**
 * Gera e dispara o download do arquivo modelo de importação de Comissões MIX (.xlsx)
 */
export function downloadModeloComissaoMix(filename = 'modelo_importacao_comissoes_mix.xlsx') {
  const encoder = new TextEncoder()
  const headers = [
    'Código do Produto',
    'EAN',
    'Descrição do Produto',
    'Percentual de Comissão (%)',
    'Início da Vigência (AAAA-MM-DD)',
    'Motivo da Alteração',
  ]
  const colWidths = [20, 18, 40, 24, 26, 35]

  const headerCells = headers
    .map(
      (h, idx) =>
        `<c r="${columnLetter(idx)}1" t="inlineStr" s="1"><is><t xml:space="preserve">${xmlEscape(h)}</t></is></c>`,
    )
    .join('')

  const exampleRows = [
    [
      'IND-PA-0001',
      '7890001000080',
      'Azeitona Verde Gran Romano 200ml',
      '4.5',
      '2026-04-01',
      'Ajuste campanha de abril',
    ],
    [
      'IND-EMB-0001',
      '7890001000042',
      'Pote de Vidro 200ml',
      '3.0',
      '2026-04-01',
      'Manutenção de margem',
    ],
    [
      'IND-MP-0003',
      '7890001000035',
      'Açúcar Cristal',
      '2.5',
      '2026-04-01',
      'Revisão semestral de mix',
    ],
  ]

  const bodyRows = exampleRows
    .map((row, rIdx) => {
      const rowNum = rIdx + 2
      const cells = row
        .map((val, cIdx) => {
          const ref = `${columnLetter(cIdx)}${rowNum}`
          const isNum = cIdx === 3
          if (isNum) {
            return `<c r="${ref}" t="n" s="3"><v>${val}</v></c>`
          }
          return `<c r="${ref}" t="inlineStr" s="2"><is><t xml:space="preserve">${xmlEscape(val)}</t></is></c>`
        })
        .join('')
      return `<row r="${rowNum}">${cells}</row>`
    })
    .join('')

  const colsXml = colWidths
    .map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`)
    .join('')

  const sheetXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <cols>${colsXml}</cols>
  <sheetData>
    <row r="1">${headerCells}</row>
    ${bodyRows}
  </sheetData>
</worksheet>`

  const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets><sheet name="Comissoes MIX" sheetId="1" r:id="rId1"/></sheets>
</workbook>`

  const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>`

  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`

  const rootRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`

  const zip = buildZip([
    { name: '[Content_Types].xml', data: encoder.encode(contentTypes) },
    { name: '_rels/.rels', data: encoder.encode(rootRels) },
    { name: 'xl/workbook.xml', data: encoder.encode(workbookXml) },
    { name: 'xl/_rels/workbook.xml.rels', data: encoder.encode(rels) },
    { name: 'xl/styles.xml', data: encoder.encode(XLSX_STYLES) },
    { name: 'xl/worksheets/sheet1.xml', data: encoder.encode(sheetXml) },
  ])

  triggerDownload(
    new Blob([zip as unknown as BlobPart], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }),
    filename,
  )
}

/**
 * Valida os dados de uma planilha importada contra o catálogo real de Comissões MIX.
 * NUNCA cria produtos novos e NUNCA altera dados cadastrais — apenas percentual e vigência.
 */
export async function validateImportRows(
  rows: string[][],
  existingCatalog: CommissionMixItem[],
): Promise<ImportValidationResult> {
  if (rows.length === 0) {
    return { totalLidos: 0, validos: [], naoEncontrados: [], invalidos: [] }
  }

  // Detecta colunas pelo cabeçalho (primeira linha ou primeiras linhas)
  let headerIndex = 0
  let colCode = -1
  let colEan = -1
  let colName = -1
  let colPerc = -1
  let colVigencia = -1
  let colMotivo = -1

  for (let r = 0; r < Math.min(rows.length, 5); r++) {
    const rCells = rows[r].map((c) => (c || '').toLowerCase().trim())
    for (let c = 0; c < rCells.length; c++) {
      const cell = rCells[c]
      if (cell.includes('código') || cell.includes('codigo') || cell === 'cod' || cell === 'code') {
        colCode = c
      } else if (cell.includes('ean') || cell.includes('barras')) {
        colEan = c
      } else if (cell.includes('descri') || cell.includes('produto') || cell.includes('nome')) {
        colName = c
      } else if (cell.includes('comiss') || cell.includes('percentual') || cell.includes('%')) {
        colPerc = c
      } else if (cell.includes('vig') || cell.includes('inicio') || cell.includes('data')) {
        colVigencia = c
      } else if (cell.includes('motivo') || cell.includes('justificativa')) {
        colMotivo = c
      }
    }
    if (colPerc !== -1 && (colCode !== -1 || colEan !== -1)) {
      headerIndex = r
      break
    }
  }

  // Fallback para índices padrão caso cabeçalho não tenha sido encontrado explicitamente
  if (colPerc === -1) {
    colCode = 0
    colEan = 1
    colName = 2
    colPerc = 3
    colVigencia = 4
    colMotivo = 5
    headerIndex = 0
  }

  // Mapas para busca rápida por código ou EAN
  const mapByCode = new Map<string, CommissionMixItem>()
  const mapByEan = new Map<string, CommissionMixItem>()

  for (const item of existingCatalog) {
    if (item.product_code) mapByCode.set(item.product_code.trim().toUpperCase(), item)
    if (item.product_ean) mapByEan.set(item.product_ean.trim(), item)
  }

  const validos: ImportPreviewItem[] = []
  const naoEncontrados: ImportPreviewItem[] = []
  const invalidos: ImportPreviewItem[] = []
  const defaultDate = new Date().toISOString().slice(0, 10)

  for (let i = headerIndex + 1; i < rows.length; i++) {
    const row = rows[i]
    if (!row || row.every((c) => !c || c.trim() === '')) continue

    const rawCode = (colCode >= 0 && row[colCode] ? row[colCode].trim() : '').toUpperCase()
    const rawEan = colEan >= 0 && row[colEan] ? row[colEan].trim() : ''
    const rawName = colName >= 0 && row[colName] ? row[colName].trim() : ''
    const rawPerc = colPerc >= 0 ? row[colPerc] : ''
    const rawVigencia = colVigencia >= 0 && row[colVigencia] ? row[colVigencia].trim() : ''
    const rawMotivo = colMotivo >= 0 && row[colMotivo] ? row[colMotivo].trim() : ''

    // Converte percentual
    const perc = parseNumberBRL(rawPerc)

    // Normaliza vigência (aceita AAAA-MM-DD ou DD/MM/AAAA)
    let vigencia = defaultDate
    if (rawVigencia) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(rawVigencia)) {
        vigencia = rawVigencia
      } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(rawVigencia)) {
        const [d, m, y] = rawVigencia.split('/')
        vigencia = `${y}-${m}-${d}`
      }
    }

    if (isNaN(perc) || perc < 0 || perc > 100) {
      invalidos.push({
        linha: i + 1,
        product_code: rawCode || '(Sem código)',
        product_ean: rawEan,
        product_name: rawName,
        percentual_atual: 0,
        novo_percentual: perc,
        vigencia_inicio: vigencia,
        motivo: rawMotivo || 'Importação Excel',
        status_import: 'invalido',
        motivo_erro: 'Percentual inválido (deve ser entre 0% e 100%)',
      })
      continue
    }

    // Busca no catálogo por Código interno ou por EAN
    const match =
      (rawCode ? mapByCode.get(rawCode) : undefined) || (rawEan ? mapByEan.get(rawEan) : undefined)

    if (!match) {
      naoEncontrados.push({
        linha: i + 1,
        product_code: rawCode || '(Sem código)',
        product_ean: rawEan,
        product_name: rawName || '(Produto desconhecido)',
        percentual_atual: 0,
        novo_percentual: perc,
        vigencia_inicio: vigencia,
        motivo: rawMotivo || 'Importação Excel',
        status_import: 'nao_encontrado',
        motivo_erro: 'Produto não cadastrado no catálogo do ERP Jetro',
      })
      continue
    }

    validos.push({
      linha: i + 1,
      product_code: match.product_code,
      product_ean: match.product_ean,
      product_name: match.product_name,
      record_id: match.id,
      percentual_atual: match.commission_percentage || 0,
      novo_percentual: perc,
      vigencia_inicio: vigencia,
      motivo: rawMotivo || 'Importação de planilha Excel',
      status_import: 'valido',
    })
  }

  return {
    totalLidos: validos.length + naoEncontrados.length + invalidos.length,
    validos,
    naoEncontrados,
    invalidos,
  }
}

/**
 * Aplica as alterações validadas no banco de dados com histórico completo
 */
export async function applyImportBatch(
  items: ImportPreviewItem[],
  onProgress?: (current: number, total: number) => void,
): Promise<{ successCount: number; errorCount: number }> {
  let successCount = 0
  let errorCount = 0
  const total = items.length

  for (let idx = 0; idx < total; idx++) {
    const item = items[idx]
    if (!item.record_id) {
      errorCount++
      continue
    }

    try {
      await updateCommissionMixItem({
        id: item.record_id,
        commission_percentage: item.novo_percentual,
        vigencia_inicio: item.vigencia_inicio,
        motivo: item.motivo || 'Importação via planilha Excel',
        tipo_alteracao: 'IMPORTACAO_EXCEL',
      })
      successCount++
    } catch (err) {
      console.error(`Erro ao atualizar item ${item.product_code}:`, err)
      errorCount++
    }

    if (onProgress) {
      onProgress(idx + 1, total)
    }
  }

  return { successCount, errorCount }
}

/**
 * Exporta a lista filtrada de Comissões MIX para Excel compatível com reimportação
 */
export function exportCommissionMixExcel(
  data: CommissionMixItem[],
  filename = 'comissoes_mix_jetro.xlsx',
) {
  const mappedData: Record<string, unknown>[] = data.map((d) => ({
    'Código do Produto': d.product_code || '',
    'EAN': d.product_ean || '',
    'Descrição do Produto': d.product_name || '',
    'Marca': d.brand || '',
    'Fornecedor': d.supplier || '',
    'Categoria': d.category || '',
    'Linha de Produto': d.product_line || '',
    'Preço (R$)': d.price ? Number(d.price.toFixed(2)) : 0,
    '% Comissão': d.commission_percentage || 0,
    'Situação': d.status || 'Ativo',
    'Início da Vigência': d.vigencia_inicio || '',
    'Última Alteração Por': d.updated_by_user_name || '',
    'Data da Alteração': d.updated ? new Date(d.updated).toLocaleString('pt-BR') : '',
  }))

  exportToExcel(mappedData, filename, 'Comissões MIX — Jetro ERP')
}
