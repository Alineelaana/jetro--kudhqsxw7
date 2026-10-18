import { type JetroColumnDef, type TableUserPreferences } from './types'

function xmlEscape(s: string): string {
  return String(s ?? '')
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

/**
 * Exporta a tabela para Excel respeitando estritamente a ordem e visibilidade das colunas customizadas
 */
export function exportTableToExcel<T>(
  data: T[],
  columns: JetroColumnDef<T>[],
  preferences: TableUserPreferences,
  filename = 'tabela-jetro.xlsx',
  sheetTitle = 'Jetro ERP',
) {
  const visibleColumns = preferences.columnOrder
    .map((id) => columns.find((c) => c.id === id))
    .filter((c): c is JetroColumnDef<T> => !!c && preferences.columnVisibility[c.id] !== false)

  if (visibleColumns.length === 0) return

  const headerCells = visibleColumns.map((col, idx) => {
    const ref = `${columnLetter(idx)}1`
    return `<c r="${ref}" t="inlineStr" s="1"><is><t xml:space="preserve">${xmlEscape(col.header)}</t></is></c>`
  })

  const bodyRowsXml: string[] = []
  data.forEach((row, rIdx) => {
    const rowNum = rIdx + 2
    const cellXmls = visibleColumns.map((col, cIdx) => {
      const ref = `${columnLetter(cIdx)}${rowNum}`
      let val: unknown = ''
      if (col.getSortValue) {
        val = col.getSortValue(row)
      } else if (col.accessorKey) {
        val = (row as any)[col.accessorKey]
      }

      if (val === null || val === undefined) {
        return `<c r="${ref}" t="inlineStr" s="0"><is><t></t></is></c>`
      }

      if (col.dataType === 'number' || col.dataType === 'currency' || col.dataType === 'percent') {
        const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/[^0-9.-]/g, ''))
        if (!isNaN(num)) {
          return `<c r="${ref}" t="n" s="3"><v>${num}</v></c>`
        }
      }

      const strVal = String(val)
      return `<c r="${ref}" t="inlineStr" s="0"><is><t xml:space="preserve">${xmlEscape(strVal)}</t></is></c>`
    })

    bodyRowsXml.push(`<row r="${rowNum}">${cellXmls.join('')}</row>`)
  })

  const colWidthsXml = visibleColumns
    .map((_, i) => `<col min="${i + 1}" max="${i + 1}" width="20" customWidth="1"/>`)
    .join('')

  const sheetXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <cols>${colWidthsXml}</cols>
  <sheetData>
    <row r="1">${headerCells.join('')}</row>
    ${bodyRowsXml.join('')}
  </sheetData>
</worksheet>`

  const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets><sheet name="${xmlEscape(sheetTitle.slice(0, 31))}" sheetId="1" r:id="rId1"/></sheets>
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

  const encoder = new TextEncoder()
  const zip = buildZip([
    { name: '[Content_Types].xml', data: encoder.encode(contentTypes) },
    { name: '_rels/.rels', data: encoder.encode(rootRels) },
    { name: 'xl/workbook.xml', data: encoder.encode(workbookXml) },
    { name: 'xl/_rels/workbook.xml.rels', data: encoder.encode(rels) },
    { name: 'xl/styles.xml', data: encoder.encode(XLSX_STYLES) },
    { name: 'xl/worksheets/sheet1.xml', data: encoder.encode(sheetXml) },
  ])

  downloadBlob(
    new Blob([zip as unknown as BlobPart], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }),
    filename,
  )
}

/**
 * Exporta a visualização atual da tabela em PDF estilizado Jetro via janela de impressão
 */
export function exportTableToPdf<T>(
  data: T[],
  columns: JetroColumnDef<T>[],
  preferences: TableUserPreferences,
  title = 'Relatório de Dados — Jetro ERP',
) {
  const visibleColumns = preferences.columnOrder
    .map((id) => columns.find((c) => c.id === id))
    .filter((c): c is JetroColumnDef<T> => !!c && preferences.columnVisibility[c.id] !== false)

  if (visibleColumns.length === 0) return

  const printWindow = window.open('', '_blank', 'width=1100,height=750')
  if (!printWindow) return

  const now = new Date().toLocaleString('pt-BR')

  const thHtml = visibleColumns
    .map(
      (col) =>
        `<th style="padding: 8px 10px; font-weight: bold; font-size: 11px; text-align: ${col.align || 'left'}; border-bottom: 2px solid #C9A227;">${xmlEscape(col.header)}</th>`,
    )
    .join('')

  const trsHtml = data
    .map((row, idx) => {
      const bg = idx % 2 === 0 ? '#ffffff' : '#f9fafb'
      const tds = visibleColumns
        .map((col) => {
          let val: unknown = ''
          if (col.getSortValue) {
            val = col.getSortValue(row)
          } else if (col.accessorKey) {
            val = (row as any)[col.accessorKey]
          }
          const strVal = val === null || val === undefined ? '—' : String(val)
          return `<td style="padding: 6px 10px; font-size: 11px; text-align: ${col.align || 'left'}; border-bottom: 1px solid #e5e7eb;">${xmlEscape(strVal)}</td>`
        })
        .join('')
      return `<tr style="background-color: ${bg};">${tds}</tr>`
    })
    .join('')

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${xmlEscape(title)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #111827; margin: 24px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #005B2E; padding-bottom: 14px; margin-bottom: 18px; }
    .brand { display: flex; align-items: center; gap: 10px; }
    .brand-logo { width: 36px; height: 36px; background-color: #005B2E; color: white; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 18px; }
    .brand-title { font-size: 20px; font-weight: 800; color: #005B2E; margin: 0; }
    .brand-subtitle { font-size: 12px; color: #6b7280; margin: 0; }
    .meta { text-align: right; font-size: 11px; color: #6b7280; }
    .table-container { width: 100%; overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; text-align: left; }
    thead { background-color: #005B2E; color: #ffffff; }
    .footer { margin-top: 20px; text-align: center; font-size: 10px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 10px; }
    @media print {
      body { margin: 10mm; }
      thead { display: table-header-group; }
      tr { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">
      <div class="brand-logo">J</div>
      <div>
        <h1 class="brand-title">JETRO ERP</h1>
        <p class="brand-subtitle">${xmlEscape(title)}</p>
      </div>
    </div>
    <div class="meta">
      <div><strong>Emissão:</strong> ${now}</div>
      <div><strong>Total de registros:</strong> ${data.length}</div>
    </div>
  </div>
  <div class="table-container">
    <table>
      <thead>
        <tr>${thHtml}</tr>
      </thead>
      <tbody>
        ${trsHtml}
      </tbody>
    </table>
  </div>
  <div class="footer">
    Documento gerado pelo ERP Jetro • Visualização personalizada de colunas aplicada
  </div>
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 300);
    };
  </script>
</body>
</html>`

  printWindow.document.open()
  printWindow.document.write(html)
  printWindow.document.close()
}
