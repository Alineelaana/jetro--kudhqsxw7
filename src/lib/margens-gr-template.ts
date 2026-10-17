/**
 * Gerador de arquivo .xlsx de modelo para importação de Comparativo de Margens GR.
 *
 * Utiliza o gerador OpenXML nativo (zero dependências) idêntico ao já validado no projeto Jetro,
 * formatado com cabeçalho corporativo verde Jetro (#005B2E) e linhas de exemplo realistas.
 */

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
      ...u16(0), // store (uncompressed)
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
    <xf numFmtId="2" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1"/>
  </cellXfs>
</styleSheet>`

/**
 * Gera e dispara o download do arquivo modelo .xlsx
 */
export function downloadModeloExcel(filename = 'modelo_comparativo_margens_gr.xlsx') {
  const encoder = new TextEncoder()

  // Cabeçalhos esperados
  const headers = ['Ordem', 'Produto', 'CMV', 'Preço Rivoli']
  const headerCells: Cell[] = headers.map((h) => ({ v: h, t: 'inlineStr', s: 1 }))

  // Linhas de exemplo
  const exampleRows: Array<[number, string, number, number]> = [
    [1, 'Azeitona Verde Fatiada 160g', 3.5, 5.9],
    [2, 'Azeitona Preta Inteira 200g', 4.1, 7.2],
    [3, 'Palmito Pupunha Rodela 300g', 8.2, 14.5],
    [4, 'Cogumelo Champignon Inteiro 200g', 5.6, 9.8],
    [5, 'Azeite de Oliva Extra Virgem 500ml', 18.9, 32.0],
  ]

  const bodyRows: Cell[][] = exampleRows.map(([ordem, prod, cmv, preco]) => [
    { v: String(ordem), t: 'n', s: 0 },
    { v: prod, t: 'inlineStr', s: 0 },
    { v: cmv.toFixed(2), t: 'n', s: 3 },
    { v: preco.toFixed(2), t: 'n', s: 3 },
  ])

  const sheet = buildSheetXml([headerCells, ...bodyRows], [10, 45, 16, 18])

  const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Comparativo Margens GR" sheetId="1" r:id="rId1"/></sheets></workbook>`

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
}
