// ============================================================================
// Cron Job Master para Agendamentos de Relatórios do Jetro ERP
// Executado a cada 10 minutos para verificar e disparar relatórios programados
// ============================================================================

cronAdd('report_schedules_master', '*/10 * * * *', () => {
  function parseJSON(str, fallback) {
    if (!str) return fallback
    if (typeof str === 'object') return str
    try {
      return JSON.parse(str)
    } catch (_) {
      return fallback
    }
  }

  function xmlEscape(s) {
    if (!s) return ''
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
  }

  function columnLetter(n) {
    var s = ''
    while (n >= 0) {
      s = String.fromCharCode((n % 26) + 65) + s
      n = Math.floor(n / 26) - 1
    }
    return s
  }

  function crc32Table() {
    var table = []
    for (var n = 0; n < 256; n++) {
      var c = n
      for (var k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
      table[n] = c
    }
    return table
  }
  var CRC_TABLE = crc32Table()

  function crc32(bytes) {
    var crc = 0 ^ -1
    for (var i = 0; i < bytes.length; i++) {
      crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ bytes[i]) & 0xff]
    }
    return (crc ^ -1) >>> 0
  }

  function stringToBytes(str) {
    var bytes = []
    for (var i = 0; i < str.length; i++) {
      var code = str.charCodeAt(i)
      if (code < 0x80) {
        bytes.push(code)
      } else if (code < 0x800) {
        bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f))
      } else if (code < 0xd800 || code >= 0xe000) {
        bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f))
      } else {
        i++
        var code2 = 0x10000 + (((code & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff))
        bytes.push(
          0xf0 | (code2 >> 18),
          0x80 | ((code2 >> 12) & 0x3f),
          0x80 | ((code2 >> 6) & 0x3f),
          0x80 | (code2 & 0x3f),
        )
      }
    }
    return bytes
  }

  function buildZip(entries) {
    var chunks = []
    var central = []
    var offset = 0

    for (var eIdx = 0; eIdx < entries.length; eIdx++) {
      var entry = entries[eIdx]
      var nameBytes = stringToBytes(entry.name)
      var dataBytes = entry.data
      var crc = crc32(dataBytes)
      var size = dataBytes.length

      var localHeader = [
        0x50,
        0x4b,
        0x03,
        0x04,
        20,
        0,
        0,
        8,
        0,
        0,
        0,
        0,
        crc & 0xff,
        (crc >> 8) & 0xff,
        (crc >> 16) & 0xff,
        (crc >>> 24) & 0xff,
        size & 0xff,
        (size >> 8) & 0xff,
        (size >> 16) & 0xff,
        (size >>> 24) & 0xff,
        size & 0xff,
        (size >> 8) & 0xff,
        (size >> 16) & 0xff,
        (size >>> 24) & 0xff,
        nameBytes.length & 0xff,
        (nameBytes.length >> 8) & 0xff,
        0,
        0,
      ]
      for (var ni = 0; ni < nameBytes.length; ni++) localHeader.push(nameBytes[ni])
      for (var di = 0; di < dataBytes.length; di++) localHeader.push(dataBytes[di])
      chunks.push(localHeader)

      var centralRecord = [
        0x50,
        0x4b,
        0x01,
        0x02,
        20,
        0,
        20,
        0,
        0,
        8,
        0,
        0,
        0,
        0,
        crc & 0xff,
        (crc >> 8) & 0xff,
        (crc >> 16) & 0xff,
        (crc >>> 24) & 0xff,
        size & 0xff,
        (size >> 8) & 0xff,
        (size >> 16) & 0xff,
        (size >>> 24) & 0xff,
        size & 0xff,
        (size >> 8) & 0xff,
        (size >> 16) & 0xff,
        (size >>> 24) & 0xff,
        nameBytes.length & 0xff,
        (nameBytes.length >> 8) & 0xff,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        offset & 0xff,
        (offset >> 8) & 0xff,
        (offset >> 16) & 0xff,
        (offset >>> 24) & 0xff,
      ]
      for (var nci = 0; nci < nameBytes.length; nci++) centralRecord.push(nameBytes[nci])
      central.push(centralRecord)
      offset += localHeader.length
    }

    var centralLength = 0
    for (var c = 0; c < central.length; c++) centralLength += central[c].length

    var endRecord = [
      0x50,
      0x4b,
      0x05,
      0x06,
      0,
      0,
      0,
      0,
      entries.length & 0xff,
      (entries.length >> 8) & 0xff,
      entries.length & 0xff,
      (entries.length >> 8) & 0xff,
      centralLength & 0xff,
      (centralLength >> 8) & 0xff,
      (centralLength >> 16) & 0xff,
      (centralLength >>> 24) & 0xff,
      offset & 0xff,
      (offset >> 8) & 0xff,
      (offset >> 16) & 0xff,
      (offset >>> 24) & 0xff,
      0,
      0,
    ]

    var out = []
    for (var ch = 0; ch < chunks.length; ch++) {
      for (var k = 0; k < chunks[ch].length; k++) out.push(chunks[ch][k])
    }
    for (var ce = 0; ce < central.length; ce++) {
      for (var m = 0; m < central[ce].length; m++) out.push(central[ce][m])
    }
    for (var ed = 0; ed < endRecord.length; ed++) out.push(endRecord[ed])

    return out
  }

  var XLSX_STYLES =
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
    '<fonts count="3">' +
    '<font><sz val="10"/><name val="Calibri"/></font>' +
    '<font><b/><color rgb="FFFFFFFF"/><sz val="11"/><name val="Calibri"/></font>' +
    '<font><b/><sz val="10"/><name val="Calibri"/></font>' +
    '</fonts>' +
    '<fills count="3">' +
    '<fill><patternFill patternType="none"/></fill>' +
    '<fill><patternFill patternType="gray125"/></fill>' +
    '<fill><patternFill patternType="solid"><fgColor rgb="FF005B2E"/><bgColor indexed="64"/></patternFill></fill>' +
    '</fills>' +
    '<borders count="2">' +
    '<border><left/><right/><top/><bottom/><diagonal/></border>' +
    '<border>' +
    '<left style="thin"><color rgb="FFD0D0D0"/></left><right style="thin"><color rgb="FFD0D0D0"/></right>' +
    '<top style="thin"><color rgb="FFD0D0D0"/></top><bottom style="thin"><color rgb="FFD0D0D0"/></bottom><diagonal/>' +
    '</border>' +
    '</borders>' +
    '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
    '<cellXfs count="4">' +
    '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>' +
    '<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/>' +
    '<xf numFmtId="0" fontId="2" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1"/>' +
    '<xf numFmtId="3" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1"/>' +
    '</cellXfs>' +
    '</styleSheet>'

  function formatCurrencyBR(num) {
    if (num === null || num === undefined || isNaN(num)) return 'R$ 0,00'
    var fixed = num.toFixed(2).split('.')
    var intPart = fixed[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    var decPart = fixed[1]
    return 'R$ ' + intPart + ',' + decPart
  }

  function formatDateBR(isoStr) {
    if (!isoStr) return ''
    return String(isoStr).substring(0, 19).replace('T', ' ')
  }

  function parseRecipientEmails(recipientsStr) {
    if (!recipientsStr) return []
    return recipientsStr
      .split(',')
      .map(function (s) {
        return s.trim()
      })
      .filter(function (s) {
        return s.indexOf('@') > 0
      })
  }

  function resolveDynamicDateRangeServer(range, dateFromFixed, dateToFixed, nowDate) {
    var spOffsetMs = -3 * 60 * 60 * 1000
    var spDate = new Date(nowDate.getTime() + spOffsetMs)
    var year = spDate.getUTCFullYear()
    var month = spDate.getUTCMonth()
    var day = spDate.getUTCDate()

    var pad = function (n) {
      return n < 10 ? '0' + n : String(n)
    }
    var formatYMD = function (d) {
      return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate())
    }

    if (range === 'today') {
      var todayStr = year + '-' + pad(month + 1) + '-' + pad(day)
      return {
        dateFrom: todayStr + ' 00:00:00',
        dateTo: todayStr + ' 23:59:59',
        label: 'Hoje',
      }
    }
    if (range === 'yesterday') {
      var yDate = new Date(spDate.getTime() - 24 * 60 * 60 * 1000)
      var yStr = formatYMD(yDate)
      return {
        dateFrom: yStr + ' 00:00:00',
        dateTo: yStr + ' 23:59:59',
        label: 'Ontem',
      }
    }
    if (range === 'last_7_days') {
      var from7 = new Date(spDate.getTime() - 7 * 24 * 60 * 60 * 1000)
      return {
        dateFrom: formatYMD(from7) + ' 00:00:00',
        dateTo: formatYMD(spDate) + ' 23:59:59',
        label: 'Últimos 7 dias',
      }
    }
    if (range === 'last_week') {
      var currentDayOfWeek = spDate.getUTCDay()
      var daysSinceLastSunday = currentDayOfWeek === 0 ? 7 : currentDayOfWeek
      var lastSunday = new Date(spDate.getTime() - daysSinceLastSunday * 24 * 60 * 60 * 1000)
      var lastMonday = new Date(lastSunday.getTime() - 6 * 24 * 60 * 60 * 1000)
      return {
        dateFrom: formatYMD(lastMonday) + ' 00:00:00',
        dateTo: formatYMD(lastSunday) + ' 23:59:59',
        label: 'Semana anterior',
      }
    }
    if (range === 'last_fortnight') {
      if (day > 15) {
        return {
          dateFrom: year + '-' + pad(month + 1) + '-01 00:00:00',
          dateTo: year + '-' + pad(month + 1) + '-15 23:59:59',
          label: '1ª Quinzena deste mês',
        }
      } else {
        var prevM = month === 0 ? 12 : month
        var prevY = month === 0 ? year - 1 : year
        var lastDayPrev = new Date(Date.UTC(prevY, prevM, 0)).getUTCDate()
        return {
          dateFrom: prevY + '-' + pad(prevM) + '-16 00:00:00',
          dateTo: prevY + '-' + pad(prevM) + '-' + pad(lastDayPrev) + ' 23:59:59',
          label: '2ª Quinzena do mês anterior',
        }
      }
    }
    if (range === 'last_month') {
      var pmYear = month === 0 ? year - 1 : year
      var pmMonth = month === 0 ? 12 : month
      var lastDayOfMonth = new Date(Date.UTC(pmYear, pmMonth, 0)).getUTCDate()
      return {
        dateFrom: pmYear + '-' + pad(pmMonth) + '-01 00:00:00',
        dateTo: pmYear + '-' + pad(pmMonth) + '-' + pad(lastDayOfMonth) + ' 23:59:59',
        label: 'Mês anterior',
      }
    }
    if (range === 'current_month') {
      return {
        dateFrom: year + '-' + pad(month + 1) + '-01 00:00:00',
        dateTo: formatYMD(spDate) + ' 23:59:59',
        label: 'Mês atual',
      }
    }
    return {
      dateFrom: dateFromFixed || '',
      dateTo: dateToFixed || '',
      label: 'Período Fixo',
    }
  }

  // Construtor genérico de planilha Excel
  function buildGenericXlsxBytes(sheetName, columns, records) {
    var colsXml = columns
      .map(function (c, i) {
        var w = c.width || 18
        return (
          '<col min="' + (i + 1) + '" max="' + (i + 1) + '" width="' + w + '" customWidth="1"/>'
        )
      })
      .join('')

    var headerCells = columns
      .map(function (c, cIdx) {
        var ref = columnLetter(cIdx) + '1'
        return (
          '<c r="' +
          ref +
          '" t="inlineStr" s="1"><is><t xml:space="preserve">' +
          xmlEscape(c.label) +
          '</t></is></c>'
        )
      })
      .join('')

    var rowsXml = ['<row r="1">' + headerCells + '</row>']

    for (var rIdx = 0; rIdx < records.length; rIdx++) {
      var rec = records[rIdx]
      var rowNum = rIdx + 2
      var cellsXml = columns
        .map(function (c, cIdx) {
          var ref = columnLetter(cIdx) + rowNum
          var rawVal = rec.getString(c.key)
          if (c.type === 'currency' || c.type === 'number') {
            var numVal = parseFloat(rawVal || '0') || 0
            return '<c r="' + ref + '" t="n" s="3"><v>' + numVal + '</v></c>'
          }
          if (c.type === 'boolean') {
            var boolVal = rec.getBool(c.key) ? 'Sim' : 'Não'
            return (
              '<c r="' +
              ref +
              '" t="inlineStr" s="2"><is><t xml:space="preserve">' +
              boolVal +
              '</t></is></c>'
            )
          }
          if (c.type === 'date') {
            return (
              '<c r="' +
              ref +
              '" t="inlineStr" s="2"><is><t xml:space="preserve">' +
              xmlEscape(formatDateBR(rawVal)) +
              '</t></is></c>'
            )
          }
          return (
            '<c r="' +
            ref +
            '" t="inlineStr" s="2"><is><t xml:space="preserve">' +
            xmlEscape(rawVal || '—') +
            '</t></is></c>'
          )
        })
        .join('')
      rowsXml.push('<row r="' + rowNum + '">' + cellsXml + '</row>')
    }

    var cleanSheetName = (sheetName || 'Relatorio').substring(0, 31).replace(/[:\\\/\?\*\[\]]/g, '')
    var sheetXml =
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
      '<cols>' +
      colsXml +
      '</cols>' +
      '<sheetData>' +
      rowsXml.join('') +
      '</sheetData>' +
      '</worksheet>'

    var workbookXml =
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="' +
      xmlEscape(cleanSheetName) +
      '" sheetId="1" r:id="rId1"/></sheets></workbook>'

    var rels =
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>'

    var contentTypes =
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>'

    var rootRels =
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'

    return buildZip([
      { name: '[Content_Types].xml', data: stringToBytes(contentTypes) },
      { name: '_rels/.rels', data: stringToBytes(rootRels) },
      { name: 'xl/workbook.xml', data: stringToBytes(workbookXml) },
      { name: 'xl/_rels/workbook.xml.rels', data: stringToBytes(rels) },
      { name: 'xl/styles.xml', data: stringToBytes(XLSX_STYLES) },
      { name: 'xl/worksheets/sheet1.xml', data: stringToBytes(sheetXml) },
    ])
  }

  function getReportMeta(reportId) {
    if (reportId === 'comercial-relatorio-vendas') {
      return {
        collection: 'sales_orders',
        dateField: 'created',
        amountField: 'total_value',
        title: 'Relatório de Vendas',
        columns: [
          { key: 'order_number', label: 'Nº Pedido', width: 14, type: 'text' },
          { key: 'client_name', label: 'Cliente', width: 32, type: 'text' },
          { key: 'team', label: 'Equipe', width: 14, type: 'text' },
          { key: 'rca_name', label: 'RCA / Vendedor', width: 18, type: 'text' },
          { key: 'created', label: 'Data', width: 18, type: 'date' },
          { key: 'sales_channel', label: 'Canal', width: 14, type: 'text' },
          { key: 'total_value', label: 'Valor da Venda', width: 16, type: 'currency' },
          { key: 'status', label: 'Status', width: 16, type: 'text' },
        ],
      }
    }
    if (reportId === 'comercial-desempenho-rcas') {
      return {
        collection: 'sales_orders',
        dateField: 'created',
        amountField: 'total_value',
        title: 'Desempenho Comercial',
        columns: [
          { key: 'rca_name', label: 'RCA / Vendedor', width: 22, type: 'text' },
          { key: 'team', label: 'Equipe', width: 16, type: 'text' },
          { key: 'order_number', label: 'Nº Pedido', width: 14, type: 'text' },
          { key: 'client_name', label: 'Cliente', width: 30, type: 'text' },
          { key: 'created', label: 'Data', width: 18, type: 'date' },
          { key: 'total_value', label: 'Valor Faturado', width: 16, type: 'currency' },
          { key: 'status', label: 'Status', width: 16, type: 'text' },
        ],
      }
    }
    if (reportId === 'financeiro-contas-receber') {
      return {
        collection: 'financial_receivables',
        dateField: 'data_vencimento',
        amountField: 'valor_atualizado',
        title: 'Contas a Receber',
        columns: [
          { key: 'numero_titulo', label: 'Nº Título', width: 14, type: 'text' },
          { key: 'cliente', label: 'Cliente', width: 32, type: 'text' },
          { key: 'data_emissao', label: 'Emissão', width: 14, type: 'date' },
          { key: 'data_vencimento', label: 'Vencimento', width: 14, type: 'date' },
          { key: 'valor_original', label: 'Valor Original', width: 14, type: 'currency' },
          { key: 'valor_atualizado', label: 'Valor Atualizado', width: 14, type: 'currency' },
          { key: 'forma_recebimento', label: 'Forma', width: 14, type: 'text' },
          { key: 'status', label: 'Status', width: 14, type: 'text' },
        ],
      }
    }
    if (reportId === 'financeiro-contas-pagar') {
      return {
        collection: 'financial_payables',
        dateField: 'data_vencimento',
        amountField: 'valor_atualizado',
        title: 'Contas a Pagar',
        columns: [
          { key: 'numero_titulo', label: 'Nº Título', width: 14, type: 'text' },
          { key: 'fornecedor', label: 'Fornecedor', width: 32, type: 'text' },
          { key: 'data_vencimento', label: 'Vencimento', width: 14, type: 'date' },
          { key: 'valor_original', label: 'Valor Original', width: 14, type: 'currency' },
          { key: 'valor_atualizado', label: 'Valor Atualizado', width: 14, type: 'currency' },
          { key: 'forma_pagamento', label: 'Forma Pgto', width: 14, type: 'text' },
          { key: 'status', label: 'Status', width: 14, type: 'text' },
        ],
      }
    }
    if (reportId === 'logistica-entregas') {
      return {
        collection: 'logistics_deliveries',
        dateField: 'created',
        amountField: 'valor_mercadoria',
        title: 'Relatório de Entregas',
        columns: [
          { key: 'numero_entrega', label: 'Nº Entrega', width: 14, type: 'text' },
          { key: 'pedido', label: 'Pedido', width: 14, type: 'text' },
          { key: 'cliente', label: 'Cliente', width: 30, type: 'text' },
          { key: 'cidade', label: 'Cidade', width: 18, type: 'text' },
          { key: 'rota', label: 'Rota', width: 16, type: 'text' },
          { key: 'transportadora', label: 'Transportadora', width: 18, type: 'text' },
          { key: 'data_prevista', label: 'Previsão', width: 16, type: 'date' },
          { key: 'status', label: 'Status', width: 14, type: 'text' },
        ],
      }
    }
    if (reportId === 'estoque-movimentacoes') {
      return {
        collection: 'stock_movements',
        dateField: 'created',
        amountField: 'quantidade',
        title: 'Movimentações de Estoque',
        columns: [
          { key: 'created', label: 'Data/Hora', width: 18, type: 'date' },
          { key: 'tipo_movimentacao', label: 'Tipo Mov.', width: 18, type: 'text' },
          { key: 'documento_origem', label: 'Documento', width: 16, type: 'text' },
          { key: 'produto_nome', label: 'Produto', width: 30, type: 'text' },
          { key: 'produto_codigo', label: 'Código', width: 14, type: 'text' },
          { key: 'lote', label: 'Lote', width: 14, type: 'text' },
          { key: 'quantidade', label: 'Quantidade', width: 14, type: 'number' },
          { key: 'saldo_anterior', label: 'Saldo Ant.', width: 14, type: 'number' },
          { key: 'saldo_atual', label: 'Saldo Atual', width: 14, type: 'number' },
          { key: 'responsavel', label: 'Responsável', width: 18, type: 'text' },
        ],
      }
    }
    if (reportId === 'estoque-produtos-saldo') {
      return {
        collection: 'products',
        dateField: 'created',
        amountField: 'stock',
        title: 'Saldo e Posição de Produtos',
        columns: [
          { key: 'code', label: 'Código', width: 14, type: 'text' },
          { key: 'name', label: 'Produto', width: 34, type: 'text' },
          { key: 'brand', label: 'Marca', width: 16, type: 'text' },
          { key: 'category', label: 'Categoria', width: 16, type: 'text' },
          { key: 'unit', label: 'Unidade', width: 10, type: 'text' },
          { key: 'stock', label: 'Estoque Atual', width: 14, type: 'number' },
          { key: 'min_stock', label: 'Estoque Mín.', width: 14, type: 'number' },
          { key: 'cost_price', label: 'Custo', width: 14, type: 'currency' },
          { key: 'price', label: 'Preço Venda', width: 14, type: 'currency' },
          { key: 'active', label: 'Ativo', width: 10, type: 'boolean' },
        ],
      }
    }
    if (reportId === 'estoque-recebimento-wms') {
      return {
        collection: 'wms_receipts',
        dateField: 'created',
        title: 'Recebimento de Mercadorias (WMS)',
        columns: [
          { key: 'numero_recebimento', label: 'Nº Recebimento', width: 16, type: 'text' },
          { key: 'fornecedor', label: 'Fornecedor', width: 30, type: 'text' },
          { key: 'nota_fiscal', label: 'NF', width: 14, type: 'text' },
          { key: 'data_prevista', label: 'Data Prevista', width: 14, type: 'date' },
          { key: 'data_recebida', label: 'Data Recebida', width: 14, type: 'date' },
          { key: 'status', label: 'Status', width: 16, type: 'text' },
          { key: 'responsavel', label: 'Responsável', width: 18, type: 'text' },
          { key: 'created', label: 'Registro', width: 16, type: 'date' },
        ],
      }
    }
    if (reportId === 'fiscal-nfe') {
      return {
        collection: 'nfe_records',
        dateField: 'created',
        amountField: 'total_value',
        title: 'Notas Fiscais Eletrônicas (NF-e)',
        columns: [
          { key: 'nfe_number', label: 'Nº NF-e', width: 14, type: 'text' },
          { key: 'client_name', label: 'Destinatário', width: 32, type: 'text' },
          { key: 'client_cnpj', label: 'CNPJ/CPF', width: 18, type: 'text' },
          { key: 'total_value', label: 'Valor Total', width: 16, type: 'currency' },
          { key: 'status', label: 'Status SEFAZ', width: 16, type: 'text' },
          { key: 'chave_acesso', label: 'Chave de Acesso', width: 44, type: 'text' },
          { key: 'created', label: 'Data Emissão', width: 18, type: 'date' },
        ],
      }
    }
    if (reportId === 'fiscal-cte') {
      return {
        collection: 'cte_records',
        dateField: 'created',
        amountField: 'valor_prestacao',
        title: 'Conhecimentos de Transporte (CT-e)',
        columns: [
          { key: 'cte_number', label: 'Nº CT-e', width: 14, type: 'text' },
          { key: 'remetente', label: 'Remetente', width: 28, type: 'text' },
          { key: 'destinatario', label: 'Destinatário', width: 28, type: 'text' },
          { key: 'valor_prestacao', label: 'Valor Frete', width: 16, type: 'currency' },
          { key: 'status', label: 'Status', width: 16, type: 'text' },
          { key: 'created', label: 'Emissão', width: 18, type: 'date' },
        ],
      }
    }
    if (reportId === 'fiscal-nfse') {
      return {
        collection: 'nfse_records',
        dateField: 'created',
        amountField: 'valor',
        title: 'Notas Fiscais de Serviço (NFS-e)',
        columns: [
          { key: 'nfse_number', label: 'Nº NFS-e', width: 14, type: 'text' },
          { key: 'tomador', label: 'Tomador', width: 34, type: 'text' },
          { key: 'valor', label: 'Valor dos Serviços', width: 18, type: 'currency' },
          { key: 'status', label: 'Status', width: 16, type: 'text' },
          { key: 'created', label: 'Emissão', width: 18, type: 'date' },
        ],
      }
    }
    if (reportId === 'rh-colaboradores') {
      return {
        collection: 'rh_employees',
        dateField: 'data_admissao',
        title: 'Quadro de Colaboradores (RH)',
        columns: [
          { key: 'matricula', label: 'Matrícula', width: 14, type: 'text' },
          { key: 'nome_completo', label: 'Nome do Colaborador', width: 34, type: 'text' },
          { key: 'cargo', label: 'Cargo', width: 22, type: 'text' },
          { key: 'departamento', label: 'Departamento', width: 20, type: 'text' },
          { key: 'situacao', label: 'Situação', width: 14, type: 'text' },
          { key: 'data_admissao', label: 'Admissão', width: 14, type: 'text' },
          { key: 'tipo_contrato', label: 'Vínculo', width: 14, type: 'text' },
          { key: 'empresa', label: 'Empresa', width: 18, type: 'text' },
        ],
      }
    }
    if (reportId === 'rh-ponto-frequencia') {
      return {
        collection: 'rh_time_records',
        dateField: 'data',
        title: 'Espelho de Ponto e Frequência',
        columns: [
          { key: 'data', label: 'Data', width: 14, type: 'date' },
          { key: 'employee_name', label: 'Colaborador', width: 32, type: 'text' },
          { key: 'entrada', label: 'Entrada', width: 12, type: 'text' },
          { key: 'saida_intervalo', label: 'Almoço Saída', width: 14, type: 'text' },
          { key: 'retorno_intervalo', label: 'Almoço Retorno', width: 14, type: 'text' },
          { key: 'saida', label: 'Saída', width: 12, type: 'text' },
          { key: 'horas_trabalhadas', label: 'Horas Trab.', width: 14, type: 'text' },
          { key: 'horas_extras', label: 'Extras', width: 12, type: 'text' },
          { key: 'banco_horas', label: 'B. Horas', width: 12, type: 'text' },
          { key: 'situacao', label: 'Status', width: 14, type: 'text' },
        ],
      }
    }
    if (reportId === 'rh-folha-pagamento') {
      return {
        collection: 'rh_payroll',
        dateField: 'created',
        amountField: 'valor_liquido',
        title: 'Folha de Pagamento Consolidada',
        columns: [
          { key: 'competencia', label: 'Competência', width: 14, type: 'text' },
          { key: 'tipo_folha', label: 'Tipo Folha', width: 16, type: 'text' },
          { key: 'departamento', label: 'Departamento', width: 20, type: 'text' },
          { key: 'quantidade_colaboradores', label: 'Colaboradores', width: 14, type: 'number' },
          { key: 'valor_bruto', label: 'Total Bruto', width: 16, type: 'currency' },
          { key: 'total_descontos', label: 'Descontos', width: 14, type: 'currency' },
          { key: 'valor_liquido', label: 'Total Líquido', width: 16, type: 'currency' },
          { key: 'situacao', label: 'Status', width: 14, type: 'text' },
        ],
      }
    }
    if (reportId === 'dp-afastamentos') {
      return {
        collection: 'dp_leaves',
        dateField: 'created',
        title: 'Afastamentos e Licenças Médicas',
        columns: [
          { key: 'employee_name', label: 'Colaborador', width: 32, type: 'text' },
          { key: 'tipo_afastamento', label: 'Tipo', width: 20, type: 'text' },
          { key: 'data_inicio', label: 'Início', width: 14, type: 'date' },
          { key: 'data_fim', label: 'Fim', width: 14, type: 'date' },
          { key: 'cid', label: 'CID', width: 12, type: 'text' },
          { key: 'medico', label: 'Médico', width: 22, type: 'text' },
          { key: 'situacao', label: 'Status', width: 14, type: 'text' },
        ],
      }
    }
    if (reportId === 'compras-pedidos') {
      return {
        collection: 'purchase_orders',
        dateField: 'created',
        amountField: 'total_value',
        title: 'Pedidos de Compra (Suprimentos)',
        columns: [
          { key: 'order_number', label: 'Nº Pedido', width: 14, type: 'text' },
          { key: 'supplier_name', label: 'Fornecedor', width: 32, type: 'text' },
          { key: 'buyer', label: 'Comprador', width: 18, type: 'text' },
          { key: 'total_value', label: 'Valor Total', width: 16, type: 'currency' },
          { key: 'status', label: 'Status', width: 16, type: 'text' },
          { key: 'delivery_forecast', label: 'Previsão Entrega', width: 16, type: 'date' },
          { key: 'created', label: 'Data Emissão', width: 18, type: 'date' },
        ],
      }
    }
    // Controladoria
    if (reportId === 'controladoria-kpis') {
      return {
        collection: 'controladoria_kpis',
        dateField: 'created',
        amountField: 'realized',
        title: 'Cockpit & Indicadores (KPIs)',
        columns: [
          { key: 'code', label: 'Código', width: 14, type: 'text' },
          { key: 'name', label: 'Indicador (KPI)', width: 32, type: 'text' },
          { key: 'category', label: 'Categoria', width: 16, type: 'text' },
          { key: 'unit', label: 'Unidade', width: 10, type: 'text' },
          { key: 'target', label: 'Meta', width: 14, type: 'number' },
          { key: 'realized', label: 'Realizado', width: 14, type: 'number' },
          { key: 'variance', label: 'Desvio', width: 14, type: 'number' },
          { key: 'status', label: 'Status', width: 12, type: 'text' },
        ],
      }
    }
    if (reportId === 'controladoria-dre') {
      return {
        collection: 'controladoria_dre_structure',
        dateField: 'created',
        title: 'Demonstração do Resultado (DRE)',
        columns: [
          { key: 'order', label: 'Ordem', width: 10, type: 'number' },
          { key: 'code', label: 'Código', width: 14, type: 'text' },
          { key: 'name', label: 'Linha DRE', width: 36, type: 'text' },
          { key: 'level', label: 'Nível', width: 10, type: 'number' },
          { key: 'calc_rule', label: 'Regra de Cálculo', width: 22, type: 'text' },
          { key: 'is_total', label: 'Totalizador', width: 12, type: 'boolean' },
        ],
      }
    }
    if (reportId === 'controladoria-budgets') {
      return {
        collection: 'controladoria_budgets',
        dateField: 'created',
        amountField: 'budget_value',
        title: 'Orçamento Corporativo (Budget)',
        columns: [
          { key: 'period', label: 'Período', width: 14, type: 'text' },
          { key: 'account_code', label: 'Conta Contábil', width: 18, type: 'text' },
          { key: 'budget_value', label: 'Valor Orçado', width: 16, type: 'currency' },
          { key: 'actual_value', label: 'Valor Realizado', width: 16, type: 'currency' },
          { key: 'variance_value', label: 'Desvio (R$)', width: 16, type: 'currency' },
          { key: 'status', label: 'Status', width: 14, type: 'text' },
          { key: 'version', label: 'Versão', width: 10, type: 'text' },
        ],
      }
    }
    if (reportId === 'controladoria-forecasts') {
      return {
        collection: 'controladoria_forecasts',
        dateField: 'created',
        amountField: 'forecast_value',
        title: 'Projeções Financeiras (Forecast)',
        columns: [
          { key: 'period', label: 'Período', width: 14, type: 'text' },
          { key: 'account_code', label: 'Conta Contábil', width: 18, type: 'text' },
          { key: 'forecast_value', label: 'Valor Projetado', width: 18, type: 'currency' },
          { key: 'version', label: 'Versão', width: 14, type: 'text' },
          { key: 'created', label: 'Data Registro', width: 18, type: 'date' },
        ],
      }
    }
    if (reportId === 'controladoria-closing') {
      return {
        collection: 'controladoria_closing',
        dateField: 'created',
        title: 'Fechamento Contábil & Períodos',
        columns: [
          { key: 'period', label: 'Competência', width: 14, type: 'text' },
          { key: 'status', label: 'Status', width: 14, type: 'text' },
          { key: 'closed_by', label: 'Fechado Por', width: 22, type: 'text' },
          { key: 'closed_at', label: 'Data Fechamento', width: 18, type: 'date' },
          { key: 'notes', label: 'Observações', width: 34, type: 'text' },
        ],
      }
    }
    if (reportId === 'controladoria-drivers') {
      return {
        collection: 'controladoria_drivers',
        dateField: 'created',
        title: 'Direcionadores de Rateio (Drivers)',
        columns: [
          { key: 'name', label: 'Direcionador', width: 28, type: 'text' },
          { key: 'type', label: 'Tipo', width: 18, type: 'text' },
          { key: 'unit', label: 'Unidade de Medida', width: 16, type: 'text' },
          { key: 'description', label: 'Descrição / Critério', width: 36, type: 'text' },
        ],
      }
    }

    // BI & Analytics
    if (reportId === 'bi-comercial-consolidado') {
      return {
        collection: 'sales_orders',
        dateField: 'created',
        amountField: 'total_value',
        title: 'BI Comercial & Faturamento',
        columns: [
          { key: 'order_number', label: 'Nº Pedido', width: 14, type: 'text' },
          { key: 'client_name', label: 'Cliente', width: 32, type: 'text' },
          { key: 'team', label: 'Equipe', width: 16, type: 'text' },
          { key: 'sales_channel', label: 'Canal', width: 16, type: 'text' },
          { key: 'rca_name', label: 'Vendedor/RCA', width: 18, type: 'text' },
          { key: 'total_value', label: 'Valor Faturado', width: 16, type: 'currency' },
          { key: 'status', label: 'Status', width: 14, type: 'text' },
          { key: 'created', label: 'Data', width: 18, type: 'date' },
        ],
      }
    }
    if (reportId === 'bi-executivo-projecoes') {
      return {
        collection: 'sales_orders',
        dateField: 'created',
        amountField: 'total_value',
        title: 'BI Executivo & Painel Estratégico',
        columns: [
          { key: 'order_number', label: 'Nº Pedido', width: 14, type: 'text' },
          { key: 'client_name', label: 'Cliente', width: 34, type: 'text' },
          { key: 'team', label: 'Equipe', width: 16, type: 'text' },
          { key: 'sales_channel', label: 'Canal', width: 14, type: 'text' },
          { key: 'total_value', label: 'Volume (R$)', width: 18, type: 'currency' },
          { key: 'status', label: 'Status', width: 16, type: 'text' },
          { key: 'created', label: 'Data', width: 18, type: 'date' },
        ],
      }
    }

    // Indústria (PCP)
    if (reportId === 'industria-ordens-producao') {
      return {
        collection: 'production_orders',
        dateField: 'created',
        amountField: 'quantity',
        title: 'Ordens de Produção (OPs)',
        columns: [
          { key: 'order_number', label: 'Nº da OP', width: 14, type: 'text' },
          { key: 'product_id', label: 'Produto', width: 28, type: 'text' },
          { key: 'quantity', label: 'Qtd Planejada', width: 14, type: 'number' },
          { key: 'unit', label: 'Unidade', width: 10, type: 'text' },
          { key: 'start_date', label: 'Início', width: 14, type: 'date' },
          { key: 'end_date', label: 'Término', width: 14, type: 'date' },
          { key: 'responsible', label: 'Responsável', width: 18, type: 'text' },
          { key: 'status', label: 'Status', width: 14, type: 'text' },
        ],
      }
    }
    if (reportId === 'industria-capacidade-turnos') {
      return {
        collection: 'industrial_shifts',
        dateField: 'created',
        title: 'Capacidade & Turnos Industriais',
        columns: [
          { key: 'name', label: 'Turno', width: 22, type: 'text' },
          { key: 'start_time', label: 'Hora Início', width: 14, type: 'text' },
          { key: 'end_time', label: 'Hora Término', width: 14, type: 'text' },
          { key: 'net_working_minutes', label: 'Minutos Líquidos', width: 18, type: 'number' },
          { key: 'efficiency_pct', label: 'Eficiência %', width: 14, type: 'number' },
        ],
      }
    }
    if (reportId === 'industria-manutencao') {
      return {
        collection: 'maintenance_schedules',
        dateField: 'next_maintenance',
        title: 'Manutenção de Recursos & Máquinas',
        columns: [
          { key: 'title', label: 'Título / Descrição', width: 30, type: 'text' },
          { key: 'resource_id', label: 'Recurso / Máquina', width: 22, type: 'text' },
          { key: 'type', label: 'Tipo', width: 14, type: 'text' },
          { key: 'next_maintenance', label: 'Data Prevista', width: 16, type: 'date' },
          { key: 'technician', label: 'Técnico', width: 18, type: 'text' },
          { key: 'status', label: 'Status', width: 14, type: 'text' },
        ],
      }
    }
    if (reportId === 'industria-fases') {
      return {
        collection: 'industrial_phases',
        dateField: 'created',
        title: 'Fases & Operações Produtivas',
        columns: [
          { key: 'sequence', label: 'Seq.', width: 8, type: 'number' },
          { key: 'operation_name', label: 'Operação / Fase', width: 28, type: 'text' },
          { key: 'work_center', label: 'Centro de Trabalho', width: 20, type: 'text' },
          {
            key: 'expected_time_minutes',
            label: 'Tempo Previsto (min)',
            width: 18,
            type: 'number',
          },
          { key: 'status', label: 'Status', width: 14, type: 'text' },
        ],
      }
    }
    if (reportId === 'industria-rastreabilidade') {
      return {
        collection: 'industrial_traceability',
        dateField: 'created',
        amountField: 'quantity',
        title: 'Rastreabilidade de Lotes Industriais',
        columns: [
          { key: 'lot_number', label: 'Lote', width: 16, type: 'text' },
          { key: 'product_id', label: 'Produto', width: 26, type: 'text' },
          { key: 'stage', label: 'Estágio', width: 18, type: 'text' },
          { key: 'quantity', label: 'Quantidade', width: 14, type: 'number' },
          { key: 'created', label: 'Data Registro', width: 18, type: 'date' },
        ],
      }
    }

    // Logística
    if (reportId === 'logistica-ocorrencias') {
      return {
        collection: 'logistics_occurrences',
        dateField: 'created',
        title: 'Ocorrências de Transporte',
        columns: [
          { key: 'entrega', label: 'Nº Entrega', width: 14, type: 'text' },
          { key: 'cliente', label: 'Cliente', width: 30, type: 'text' },
          { key: 'tipo_ocorrencia', label: 'Tipo', width: 18, type: 'text' },
          { key: 'descricao', label: 'Descrição da Ocorrência', width: 34, type: 'text' },
          { key: 'situacao', label: 'Situação', width: 14, type: 'text' },
          { key: 'created', label: 'Data Registro', width: 18, type: 'date' },
        ],
      }
    }
    if (reportId === 'logistica-custos') {
      return {
        collection: 'logistics_costs',
        dateField: 'created',
        amountField: 'valor',
        title: 'Custos de Frete & Operação Logística',
        columns: [
          { key: 'descricao', label: 'Descrição', width: 30, type: 'text' },
          { key: 'tipo_custo', label: 'Tipo Custo', width: 18, type: 'text' },
          { key: 'transportadora', label: 'Transportadora', width: 22, type: 'text' },
          { key: 'rota', label: 'Rota', width: 16, type: 'text' },
          { key: 'valor', label: 'Valor Custo', width: 16, type: 'currency' },
          { key: 'created', label: 'Data', width: 18, type: 'date' },
        ],
      }
    }
    if (reportId === 'logistica-rotas') {
      return {
        collection: 'logistics_routes',
        dateField: 'created',
        title: 'Cadastro de Rotas de Entrega',
        columns: [
          { key: 'codigo_rota', label: 'Código', width: 14, type: 'text' },
          { key: 'nome_rota', label: 'Nome da Rota', width: 28, type: 'text' },
          { key: 'cidade_origem', label: 'Origem', width: 18, type: 'text' },
          { key: 'cidade_destino', label: 'Destino Principal', width: 18, type: 'text' },
          { key: 'distancia_km', label: 'Distância (km)', width: 16, type: 'number' },
          { key: 'situacao', label: 'Situação', width: 14, type: 'text' },
        ],
      }
    }
    if (reportId === 'logistica-veiculos') {
      return {
        collection: 'logistics_vehicles',
        dateField: 'created',
        title: 'Frota & Veículos',
        columns: [
          { key: 'placa', label: 'Placa', width: 14, type: 'text' },
          { key: 'modelo', label: 'Modelo', width: 24, type: 'text' },
          { key: 'tipo_veiculo', label: 'Tipo', width: 18, type: 'text' },
          { key: 'capacidade_peso', label: 'Capacidade (kg)', width: 18, type: 'number' },
          { key: 'situacao', label: 'Situação', width: 16, type: 'text' },
        ],
      }
    }

    // Chamados
    if (reportId === 'chamados-painel') {
      return {
        collection: 'chamados',
        dateField: 'created',
        title: 'Painel Central de Chamados',
        columns: [
          { key: 'numero', label: 'Nº Chamado', width: 14, type: 'text' },
          { key: 'assunto', label: 'Assunto', width: 32, type: 'text' },
          { key: 'solicitante', label: 'Solicitante', width: 22, type: 'text' },
          { key: 'setor_responsavel', label: 'Setor', width: 18, type: 'text' },
          { key: 'profissional_responsavel', label: 'Responsável', width: 20, type: 'text' },
          { key: 'prioridade', label: 'Prioridade', width: 14, type: 'text' },
          { key: 'status', label: 'Status', width: 14, type: 'text' },
          { key: 'prazo_atendimento', label: 'Prazo Resp.', width: 16, type: 'date' },
          { key: 'prazo_resolucao', label: 'Prazo Resol.', width: 16, type: 'date' },
        ],
      }
    }
    if (reportId === 'chamados-historico') {
      return {
        collection: 'chamados_historico',
        dateField: 'created',
        title: 'Linha do Tempo / Histórico de Interações',
        columns: [
          { key: 'chamado', label: 'ID Chamado', width: 18, type: 'text' },
          { key: 'acao', label: 'Ação', width: 22, type: 'text' },
          { key: 'usuario', label: 'Usuário', width: 20, type: 'text' },
          { key: 'descricao', label: 'Detalhes da Ação', width: 38, type: 'text' },
          { key: 'created', label: 'Data/Hora', width: 18, type: 'date' },
        ],
      }
    }

    // CRM
    if (reportId === 'crm-leads') {
      return {
        collection: 'crm_leads',
        dateField: 'created',
        title: 'Leads & Prospecção',
        columns: [
          { key: 'lead_number', label: 'Nº Lead', width: 14, type: 'text' },
          { key: 'name', label: 'Nome / Razão', width: 30, type: 'text' },
          { key: 'person_type', label: 'Tipo', width: 10, type: 'text' },
          { key: 'cpf_cnpj', label: 'CPF / CNPJ', width: 18, type: 'text' },
          { key: 'segment', label: 'Segmento', width: 16, type: 'text' },
          { key: 'temperature', label: 'Temperatura', width: 14, type: 'text' },
          { key: 'qualification_score', label: 'Score', width: 10, type: 'number' },
          { key: 'city', label: 'Cidade', width: 16, type: 'text' },
          { key: 'state', label: 'UF', width: 8, type: 'text' },
          { key: 'status', label: 'Status', width: 14, type: 'text' },
        ],
      }
    }
    if (reportId === 'crm-oportunidades') {
      return {
        collection: 'crm_opportunities',
        dateField: 'open_date',
        amountField: 'estimated_value',
        title: 'Oportunidades de Negócio (Pipeline)',
        columns: [
          { key: 'opportunity_number', label: 'Nº Oportunidade', width: 16, type: 'text' },
          { key: 'title', label: 'Título da Negociação', width: 28, type: 'text' },
          { key: 'client_name', label: 'Cliente', width: 28, type: 'text' },
          { key: 'estimated_value', label: 'Valor Estimado', width: 16, type: 'currency' },
          { key: 'probability', label: 'Prob. (%)', width: 12, type: 'number' },
          { key: 'open_date', label: 'Abertura', width: 14, type: 'date' },
          { key: 'expected_close_date', label: 'Previsão Fech.', width: 14, type: 'date' },
          { key: 'status', label: 'Status', width: 14, type: 'text' },
        ],
      }
    }
    if (reportId === 'crm-propostas') {
      return {
        collection: 'crm_proposals',
        dateField: 'created',
        amountField: 'total',
        title: 'Propostas Comerciais (Cotações)',
        columns: [
          { key: 'proposal_number', label: 'Nº Proposta', width: 16, type: 'text' },
          { key: 'title', label: 'Título', width: 28, type: 'text' },
          { key: 'client_name', label: 'Cliente', width: 28, type: 'text' },
          { key: 'subtotal', label: 'Subtotal', width: 14, type: 'currency' },
          { key: 'total', label: 'Total Proposta', width: 16, type: 'currency' },
          { key: 'validity_date', label: 'Validade', width: 14, type: 'date' },
          { key: 'status', label: 'Status', width: 14, type: 'text' },
        ],
      }
    }
    if (reportId === 'crm-atividades') {
      return {
        collection: 'crm_activities',
        dateField: 'scheduled_date',
        title: 'Atividades Comerciais (Agenda)',
        columns: [
          { key: 'type', label: 'Tipo', width: 14, type: 'text' },
          { key: 'title', label: 'Título da Atividade', width: 34, type: 'text' },
          { key: 'scheduled_date', label: 'Data Agendada', width: 14, type: 'date' },
          { key: 'scheduled_time', label: 'Horário', width: 10, type: 'text' },
          { key: 'priority', label: 'Prioridade', width: 12, type: 'text' },
          { key: 'status', label: 'Status', width: 14, type: 'text' },
        ],
      }
    }

    // Governança & Auditoria
    if (reportId === 'governanca-auditoria') {
      return {
        collection: 'audit_logs',
        dateField: 'created',
        title: 'Trilha de Auditoria do Sistema (Audit Logs)',
        columns: [
          { key: 'created', label: 'Data/Hora', width: 18, type: 'date' },
          { key: 'action', label: 'Ação', width: 14, type: 'text' },
          { key: 'user_name', label: 'Usuário', width: 22, type: 'text' },
          { key: 'user_role', label: 'Perfil', width: 14, type: 'text' },
          { key: 'target_collection', label: 'Entidade Afetada', width: 20, type: 'text' },
          { key: 'details', label: 'Detalhes da Operação', width: 40, type: 'text' },
        ],
      }
    }

    // Cadastros Oficiais
    if (reportId === 'cadastros-clientes') {
      return {
        collection: 'partners',
        dateField: 'created',
        title: 'Cadastro Oficial de Clientes',
        columns: [
          { key: 'company_name', label: 'Razão Social', width: 34, type: 'text' },
          { key: 'trade_name', label: 'Nome Fantasia', width: 26, type: 'text' },
          { key: 'cnpj', label: 'CNPJ', width: 18, type: 'text' },
          { key: 'cpf', label: 'CPF', width: 16, type: 'text' },
          { key: 'email', label: 'E-mail', width: 24, type: 'text' },
          { key: 'phone', label: 'Telefone', width: 16, type: 'text' },
          { key: 'active', label: 'Ativo', width: 10, type: 'boolean' },
        ],
      }
    }
    if (reportId === 'cadastros-fornecedores') {
      return {
        collection: 'partners',
        dateField: 'created',
        title: 'Cadastro de Fornecedores',
        columns: [
          { key: 'company_name', label: 'Razão Social', width: 34, type: 'text' },
          { key: 'trade_name', label: 'Nome Fantasia', width: 26, type: 'text' },
          { key: 'cnpj', label: 'CNPJ', width: 18, type: 'text' },
          { key: 'email', label: 'E-mail', width: 24, type: 'text' },
          { key: 'phone', label: 'Telefone', width: 16, type: 'text' },
          { key: 'active', label: 'Ativo', width: 10, type: 'boolean' },
        ],
      }
    }
    if (reportId === 'cadastros-produtos') {
      return {
        collection: 'products',
        dateField: 'created',
        amountField: 'stock',
        title: 'Catálogo de Produtos & Preços',
        columns: [
          { key: 'code', label: 'Código', width: 14, type: 'text' },
          { key: 'name', label: 'Produto', width: 34, type: 'text' },
          { key: 'category', label: 'Categoria', width: 18, type: 'text' },
          { key: 'brand', label: 'Marca', width: 16, type: 'text' },
          { key: 'stock', label: 'Estoque Atual', width: 14, type: 'number' },
          { key: 'cost_price', label: 'Preço de Custo', width: 16, type: 'currency' },
          { key: 'price', label: 'Preço de Venda', width: 16, type: 'currency' },
          { key: 'active', label: 'Ativo', width: 10, type: 'boolean' },
        ],
      }
    }

    // Default: Consulta de Pedidos
    return {
      collection: 'sales_orders',
      dateField: 'created',
      amountField: 'total_value',
      title: 'Consulta de Pedidos',
      columns: [
        { key: 'order_number', label: 'Nº Pedido', width: 14, type: 'text' },
        { key: 'integration_order_number', label: 'Nº Integração', width: 16, type: 'text' },
        { key: 'client_name', label: 'Cliente', width: 34, type: 'text' },
        { key: 'customer_cnpj', label: 'CNPJ', width: 18, type: 'text' },
        { key: 'team', label: 'Equipe', width: 14, type: 'text' },
        { key: 'rca_name', label: 'RCA', width: 16, type: 'text' },
        { key: 'created', label: 'Data', width: 18, type: 'date' },
        { key: 'operation_type', label: 'Operação', width: 16, type: 'text' },
        { key: 'sales_channel', label: 'Canal', width: 14, type: 'text' },
        { key: 'total_value', label: 'Valor', width: 14, type: 'currency' },
        { key: 'status', label: 'Status', width: 16, type: 'text' },
        { key: 'is_balance', label: 'É Saldo', width: 10, type: 'boolean' },
        { key: 'is_invoiced', label: 'Faturado', width: 10, type: 'boolean' },
      ],
    }
  }

  function buildFilterQueryForSchedule(reportId, f, userRecord, dateRange) {
    var parts = []

    // Regra 3, 4 e 5: Se o usuário não for SUP, restringe obrigatoriamente a empresa dele na consulta
    if (userRecord && userRecord.getString('role') !== 'SUP') {
      var userEmpresa = userRecord.getString('empresa_id') || userRecord.getString('empresa')
      if (userEmpresa) {
        parts.push('(empresa = "' + userEmpresa + '" || empresa_id = "' + userEmpresa + '")')
      }
    }

    if (reportId === 'financeiro-contas-receber') {
      if (f.status && f.status !== 'all') parts.push('status = "' + f.status + '"')
      if (f.cliente && f.cliente !== 'all') parts.push('cliente ~ "' + f.cliente + '"')
      if (dateRange.dateFrom)
        parts.push('data_vencimento >= "' + dateRange.dateFrom.substring(0, 10) + '"')
      if (dateRange.dateTo)
        parts.push('data_vencimento <= "' + dateRange.dateTo.substring(0, 10) + '"')
      return parts.join(' && ')
    }

    if (reportId === 'financeiro-contas-pagar') {
      if (f.status && f.status !== 'all') parts.push('status = "' + f.status + '"')
      if (f.fornecedor && f.fornecedor !== 'all') parts.push('fornecedor ~ "' + f.fornecedor + '"')
      if (dateRange.dateFrom)
        parts.push('data_vencimento >= "' + dateRange.dateFrom.substring(0, 10) + '"')
      if (dateRange.dateTo)
        parts.push('data_vencimento <= "' + dateRange.dateTo.substring(0, 10) + '"')
      return parts.join(' && ')
    }

    if (reportId === 'logistica-entregas') {
      if (f.status && f.status !== 'all') parts.push('status = "' + f.status + '"')
      if (f.rota && f.rota !== 'all') parts.push('rota ~ "' + f.rota + '"')
      if (f.transportadora && f.transportadora !== 'all')
        parts.push('transportadora ~ "' + f.transportadora + '"')
      if (dateRange.dateFrom) parts.push('created >= "' + dateRange.dateFrom + '"')
      if (dateRange.dateTo) parts.push('created <= "' + dateRange.dateTo + '"')
      return parts.join(' && ')
    }

    if (reportId === 'estoque-movimentacoes') {
      if (f.tipo_movimentacao && f.tipo_movimentacao !== 'all') {
        parts.push('tipo_movimentacao = "' + f.tipo_movimentacao + '"')
      }
      if (f.search && f.search !== 'all') {
        parts.push(
          '(produto_nome ~ "' +
            f.search +
            '" || produto_codigo ~ "' +
            f.search +
            '" || documento_origem ~ "' +
            f.search +
            '" || lote ~ "' +
            f.search +
            '")',
        )
      }
      if (dateRange.dateFrom) parts.push('created >= "' + dateRange.dateFrom + '"')
      if (dateRange.dateTo) parts.push('created <= "' + dateRange.dateTo + '"')
      return parts.join(' && ')
    }

    if (reportId === 'estoque-produtos-saldo') {
      if (f.status === 'active') parts.push('active = true')
      if (f.status === 'inactive') parts.push('active = false')
      if (f.category && f.category !== 'all') parts.push('category ~ "' + f.category + '"')
      if (f.brand && f.brand !== 'all') parts.push('brand ~ "' + f.brand + '"')
      if (f.search && f.search !== 'all') {
        parts.push(
          '(name ~ "' + f.search + '" || code ~ "' + f.search + '" || ean ~ "' + f.search + '")',
        )
      }
      return parts.join(' && ')
    }

    if (reportId === 'estoque-recebimento-wms') {
      if (f.status && f.status !== 'all') parts.push('status = "' + f.status + '"')
      if (f.fornecedor && f.fornecedor !== 'all') parts.push('fornecedor ~ "' + f.fornecedor + '"')
      if (f.nota_fiscal && f.nota_fiscal !== 'all')
        parts.push('nota_fiscal ~ "' + f.nota_fiscal + '"')
      if (dateRange.dateFrom) parts.push('created >= "' + dateRange.dateFrom + '"')
      if (dateRange.dateTo) parts.push('created <= "' + dateRange.dateTo + '"')
      return parts.join(' && ')
    }

    if (reportId === 'fiscal-nfe') {
      if (f.status && f.status !== 'all') parts.push('status = "' + f.status + '"')
      if (f.client && f.client !== 'all') {
        parts.push('(client_name ~ "' + f.client + '" || client_cnpj ~ "' + f.client + '")')
      }
      if (dateRange.dateFrom) parts.push('created >= "' + dateRange.dateFrom + '"')
      if (dateRange.dateTo) parts.push('created <= "' + dateRange.dateTo + '"')
      return parts.join(' && ')
    }

    if (reportId === 'fiscal-cte') {
      if (f.status && f.status !== 'all') parts.push('status = "' + f.status + '"')
      if (f.remetente && f.remetente !== 'all') parts.push('remetente ~ "' + f.remetente + '"')
      if (f.destinatario && f.destinatario !== 'all')
        parts.push('destinatario ~ "' + f.destinatario + '"')
      if (dateRange.dateFrom) parts.push('created >= "' + dateRange.dateFrom + '"')
      if (dateRange.dateTo) parts.push('created <= "' + dateRange.dateTo + '"')
      return parts.join(' && ')
    }

    if (reportId === 'fiscal-nfse') {
      if (f.status && f.status !== 'all') parts.push('status = "' + f.status + '"')
      if (f.tomador && f.tomador !== 'all') parts.push('tomador ~ "' + f.tomador + '"')
      if (dateRange.dateFrom) parts.push('created >= "' + dateRange.dateFrom + '"')
      if (dateRange.dateTo) parts.push('created <= "' + dateRange.dateTo + '"')
      return parts.join(' && ')
    }

    if (reportId === 'rh-colaboradores') {
      if (f.situacao && f.situacao !== 'all') parts.push('situacao = "' + f.situacao + '"')
      if (f.departamento && f.departamento !== 'all')
        parts.push('departamento ~ "' + f.departamento + '"')
      if (f.cargo && f.cargo !== 'all') parts.push('cargo ~ "' + f.cargo + '"')
      if (f.tipo_contrato && f.tipo_contrato !== 'all')
        parts.push('tipo_contrato = "' + f.tipo_contrato + '"')
      return parts.join(' && ')
    }

    if (reportId === 'rh-ponto-frequencia') {
      if (f.situacao && f.situacao !== 'all') parts.push('situacao = "' + f.situacao + '"')
      if (f.employee_name && f.employee_name !== 'all')
        parts.push('employee_name ~ "' + f.employee_name + '"')
      if (dateRange.dateFrom) parts.push('data >= "' + dateRange.dateFrom.substring(0, 10) + '"')
      if (dateRange.dateTo) parts.push('data <= "' + dateRange.dateTo.substring(0, 10) + '"')
      return parts.join(' && ')
    }

    if (reportId === 'rh-folha-pagamento') {
      if (f.competencia && f.competencia !== 'all')
        parts.push('competencia ~ "' + f.competencia + '"')
      if (f.tipo_folha && f.tipo_folha !== 'all') parts.push('tipo_folha = "' + f.tipo_folha + '"')
      if (f.situacao && f.situacao !== 'all') parts.push('situacao = "' + f.situacao + '"')
      if (f.departamento && f.departamento !== 'all')
        parts.push('departamento ~ "' + f.departamento + '"')
      return parts.join(' && ')
    }

    if (reportId === 'dp-afastamentos') {
      if (f.tipo_afastamento && f.tipo_afastamento !== 'all')
        parts.push('tipo_afastamento = "' + f.tipo_afastamento + '"')
      if (f.employee_name && f.employee_name !== 'all')
        parts.push('employee_name ~ "' + f.employee_name + '"')
      if (f.situacao && f.situacao !== 'all') parts.push('situacao = "' + f.situacao + '"')
      if (dateRange.dateFrom) parts.push('created >= "' + dateRange.dateFrom + '"')
      if (dateRange.dateTo) parts.push('created <= "' + dateRange.dateTo + '"')
      return parts.join(' && ')
    }

    if (reportId === 'compras-pedidos') {
      if (f.status && f.status !== 'all') parts.push('status = "' + f.status + '"')
      if (f.supplier_name && f.supplier_name !== 'all')
        parts.push('supplier_name ~ "' + f.supplier_name + '"')
      if (f.buyer && f.buyer !== 'all') parts.push('buyer ~ "' + f.buyer + '"')
      if (dateRange.dateFrom) parts.push('created >= "' + dateRange.dateFrom + '"')
      if (dateRange.dateTo) parts.push('created <= "' + dateRange.dateTo + '"')
      return parts.join(' && ')
    }

    // Default / comercial-consulta-pedidos / comercial-relatorio-vendas / comercial-desempenho-rcas
    if (f.operation_type && f.operation_type !== 'all')
      parts.push('operation_type = "' + f.operation_type + '"')
    if (f.client && f.client !== 'all') parts.push('client_name ~ "' + f.client + '"')
    if (f.team && f.team !== 'all') parts.push('team = "' + f.team + '"')
    if (f.rca && f.rca !== 'all') parts.push('rca_name ~ "' + f.rca + '"')
    if (f.channel && f.channel !== 'all') parts.push('sales_channel = "' + f.channel + '"')
    if (f.is_balance && f.is_balance !== 'all')
      parts.push('is_balance = ' + (f.is_balance === 'yes'))
    if (f.only_invoiced) parts.push('is_invoiced = true')
    if (f.statuses && Array.isArray(f.statuses) && f.statuses.length > 0) {
      var sParts = f.statuses.map(function (s) {
        return 'status = "' + s + '"'
      })
      parts.push('(' + sParts.join(' || ') + ')')
    }
    if (dateRange.dateFrom) parts.push('created >= "' + dateRange.dateFrom + '"')
    if (dateRange.dateTo) parts.push('created <= "' + dateRange.dateTo + '"')

    if (
      userRecord &&
      (userRecord.getString('role') === 'RCA' || userRecord.getString('role') === 'Vendedor')
    ) {
      parts.push('rca_id = "' + userRecord.id + '"')
    }

    return parts.join(' && ')
  }

  function introspectAndSanitizeCollection(collectionName, meta) {
    var collectionObj = null
    try {
      collectionObj = $app.findCollectionByNameOrId(collectionName)
    } catch (_) {
      collectionObj = null
    }

    var validFieldsMap = { id: true, created: true, updated: true }
    if (collectionObj && collectionObj.fields) {
      try {
        var fieldsList = collectionObj.fields.slice ? collectionObj.fields.slice() : []
        for (var fIdx = 0; fIdx < fieldsList.length; fIdx++) {
          var fld = fieldsList[fIdx]
          if (fld && fld.name) {
            validFieldsMap[fld.name] = true
          }
        }
      } catch (_) {}
    }

    var sanitizedColumns = []
    if (meta && meta.columns && meta.columns.length > 0) {
      for (var cIdx = 0; cIdx < meta.columns.length; cIdx++) {
        var col = meta.columns[cIdx]
        if (col && col.key) {
          sanitizedColumns.push({
            key: col.key,
            label: col.label || col.key,
            width: col.width || 20,
            type: col.type || 'text',
            existsInSchema: !collectionObj || !!validFieldsMap[col.key],
          })
        }
      }
    }

    return {
      collectionObj: collectionObj,
      validFieldsMap: validFieldsMap,
      columns: sanitizedColumns,
    }
  }

  function fetchRecords(collectionName, filter, validFieldsMap) {
    var all = []
    var pageSize = 200
    var maxLimit = 10000
    var page = 1

    var sortExpr = ''
    if (!validFieldsMap || validFieldsMap['created']) {
      sortExpr = '-created'
    } else if (validFieldsMap && validFieldsMap['id']) {
      sortExpr = '-id'
    }

    while (all.length < maxLimit) {
      var list = []
      try {
        list = $app.findRecordsByFilter(
          collectionName,
          filter,
          sortExpr,
          pageSize,
          (page - 1) * pageSize,
        )
      } catch (err) {
        try {
          if (page === 1) {
            list = $app.findRecordsByFilter(collectionName, '', sortExpr, pageSize, 0) || []
          } else {
            break
          }
        } catch (_) {
          break
        }
      }
      if (!list || list.length === 0) break
      for (var i = 0; i < list.length; i++) {
        all.push(list[i])
        if (all.length >= maxLimit) break
      }
      if (list.length < pageSize) break
      page++
    }
    return all
  }

  function buildMasterEmailHtml(
    schedule,
    meta,
    records,
    filterLabels,
    hasPdf,
    hasAttachment,
    isTooLarge,
    dateRangeLabel,
  ) {
    var schedName = schedule.getString('name')
    var moduleName = schedule.getString('module')
    var customMessage = schedule.getString('email_message')
    var totalCount = records.length
    var totalSum = 0

    if (meta.amountField) {
      for (var i = 0; i < records.length; i++) {
        totalSum += parseFloat(records[i].getString(meta.amountField) || '0') || 0
      }
    }

    var filterEntries = Object.entries(filterLabels || {}).filter(function (pair) {
      return pair[1] && pair[1] !== ''
    })
    var filterListHtml =
      filterEntries.length > 0
        ? filterEntries
            .map(function (p) {
              return (
                '<li style="margin-bottom: 4px;"><strong>' +
                xmlEscape(p[0]) +
                ':</strong> ' +
                xmlEscape(p[1]) +
                '</li>'
              )
            })
            .join('')
        : '<li style="color: #6b7280;">Nenhum filtro específico aplicado (todos os registros visíveis).</li>'

    var tablePreviewHtml = ''
    if (totalCount > 0) {
      var previewRows = records.slice(0, 15)
      var colsToPreview = meta.columns.slice(0, 5)

      var ths = colsToPreview
        .map(function (c) {
          var align = c.align === 'right' ? 'right' : 'left'
          return (
            '<th style="padding: 8px 10px; text-align: ' +
            align +
            ';">' +
            xmlEscape(c.label) +
            '</th>'
          )
        })
        .join('')

      var trs = previewRows
        .map(function (rec, idx) {
          var bg = idx % 2 === 0 ? '#ffffff' : '#f9fafb'
          var tds = colsToPreview
            .map(function (c) {
              var align = c.align === 'right' ? 'right' : 'left'
              var val = rec.getString(c.key)
              if (c.type === 'currency') {
                val = formatCurrencyBR(parseFloat(val || '0') || 0)
              } else if (c.type === 'date') {
                val = formatDateBR(val)
              } else if (c.type === 'boolean') {
                val = rec.getBool(c.key) ? 'Sim' : 'Não'
              }
              return (
                '<td style="padding: 6px 10px; text-align: ' +
                align +
                '; color: #374151;">' +
                xmlEscape(val || '—') +
                '</td>'
              )
            })
            .join('')
          return (
            '<tr style="background: ' + bg + '; border-bottom: 1px solid #e5e7eb;">' + tds + '</tr>'
          )
        })
        .join('')

      tablePreviewHtml =
        '<div style="margin-top: 20px;">' +
        '<h3 style="font-size: 13px; color: #063D30; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px;">Prévia dos dados atualizados (' +
        previewRows.length +
        ' de ' +
        totalCount +
        '):</h3>' +
        '<table style="width: 100%; border-collapse: collapse; font-size: 12px; border: 1px solid #E4EAE6;">' +
        '<thead><tr style="background: #063D30; color: #ffffff;">' +
        ths +
        '</tr></thead>' +
        '<tbody>' +
        trs +
        '</tbody></table>' +
        (totalCount > 15
          ? '<p style="font-size: 11px; color: #6b7280; margin-top: 6px;">Consulte o arquivo completo em anexo para conferir todos os ' +
            totalCount +
            ' registros.</p>'
          : '') +
        '</div>'
    }

    var warningBox = ''
    if (hasPdf) {
      warningBox +=
        '<div style="margin-top: 14px; padding: 10px 14px; background: #fffbeb; border-left: 4px solid #C69B45; font-size: 12px; color: #92400e;">' +
        '<strong>Nota sobre formato PDF:</strong> A tabela executiva com os dados consolidados foi incluída no corpo deste e-mail. Para dados tabulares e análises detalhadas, utilize o anexo Excel (.xlsx).' +
        '</div>'
    }
    if (isTooLarge) {
      warningBox +=
        '<div style="margin-top: 14px; padding: 10px 14px; background: #fef2f2; border-left: 4px solid #dc2626; font-size: 12px; color: #991b1b;">' +
        '<strong>Aviso de tamanho:</strong> O arquivo ultrapassou o limite seguro de envio por e-mail (10 MB). Acesse o painel do HURAM para exportação direta.' +
        '</div>'
    }

    var customMsgHtml = customMessage
      ? '<div style="margin-bottom: 16px; padding: 12px 14px; background: #f0fdf4; border-left: 4px solid #063D30; font-size: 13px; color: #166534;">' +
        xmlEscape(customMessage).replace(/\n/g, '<br/>') +
        '</div>'
      : ''

    var emptyNotice =
      totalCount === 0
        ? '<div style="margin-top: 14px; padding: 12px 16px; background: #f3f4f6; border-left: 4px solid #6b7280; font-size: 13px; color: #374151;">Nenhum registro encontrado no período com os filtros aplicados.</div>'
        : ''

    return (
      '<!DOCTYPE html>' +
      '<html lang="pt-BR"><head><meta charset="utf-8" /></head>' +
      '<body style="font-family: Arial, Helvetica, sans-serif; background-color: #f9fafb; margin: 0; padding: 24px; color: #1f2937;">' +
      '<div style="max-width: 700px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e5e7eb; overflow: hidden;">' +
      '<div style="background: #063D30; padding: 20px 24px; border-bottom: 3px solid #C69B45;">' +
      '<div style="font-size: 22px; font-weight: bold; color: #ffffff; letter-spacing: 1px;">HURAM<span style="color: #C69B45;">.</span></div>' +
      '<div style="font-size: 12px; color: #d1fae5; margin-top: 2px;">Sistema Inteligente de Gestão — ' +
      xmlEscape(moduleName) +
      ' / ' +
      xmlEscape(meta.title) +
      '</div>' +
      '</div>' +
      '<div style="padding: 24px;">' +
      customMsgHtml +
      '<h2 style="font-size: 18px; color: #063D30; margin: 0 0 6px 0;">' +
      xmlEscape(schedName) +
      '</h2>' +
      '<p style="font-size: 12px; color: #66736D; margin: 0 0 16px 0;">Gerado automaticamente em ' +
      formatDateBR(new Date().toISOString()) +
      ' (Período: ' +
      xmlEscape(dateRangeLabel) +
      ').</p>' +
      '<div style="display: table; width: 100%; margin: 16px 0; background: #F8FAF9; border-radius: 6px; border: 1px solid #E4EAE6;">' +
      '<div style="display: table-cell; padding: 14px 18px; width: 50%; border-right: 1px solid #E4EAE6;">' +
      '<div style="font-size: 11px; text-transform: uppercase; color: #063D30; font-weight: 600;">Total de Registros</div>' +
      '<div style="font-size: 24px; font-weight: bold; color: #063D30; margin-top: 4px;">' +
      totalCount +
      '</div>' +
      '</div>' +
      (meta.amountField
        ? '<div style="display: table-cell; padding: 14px 18px; width: 50%;">' +
          '<div style="font-size: 11px; text-transform: uppercase; color: #063D30; font-weight: 600;">Valor Total</div>' +
          '<div style="font-size: 24px; font-weight: bold; color: #063D30; margin-top: 4px;">' +
          formatCurrencyBR(totalSum) +
          '</div>' +
          '</div>'
        : '') +
      '</div>' +
      emptyNotice +
      '<div style="margin-top: 18px; background: #ffffff; border: 1px solid #E4EAE6; border-radius: 6px; padding: 14px 18px;">' +
      '<h4 style="font-size: 12px; text-transform: uppercase; color: #063D30; margin: 0 0 8px 0;">Filtros Configurados:</h4>' +
      '<ul style="margin: 0; padding-left: 18px; font-size: 12px; color: #374151; line-height: 1.5;">' +
      filterListHtml +
      '</ul></div>' +
      tablePreviewHtml +
      warningBox +
      '<div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af; text-align: center;">' +
      'E-mail automático enviado pelo Sistema HURAM.<br/>Gerencie seus agendamentos no menu <strong>Administração &gt; Agendamento de Relatórios</strong>.' +
      '</div></div></div></body></html>'
    )
  }

  function logExecution(
    scheduleId,
    schedName,
    reportId,
    triggeredBy,
    userEmail,
    status,
    count,
    totalVal,
    recipients,
    recipientsCc,
    errMsg,
    durationMs,
  ) {
    try {
      var execCol = $app.findCollectionByNameOrId('report_schedule_executions')
      var rec = new Record(execCol, {
        schedule_id: scheduleId,
        schedule_name: schedName,
        report_id: reportId,
        triggered_by: triggeredBy,
        user_email: userEmail,
        executed_at: new Date().toISOString(),
        status: status,
        record_count: count,
        total_value: totalVal,
        recipients: recipients,
        recipients_cc: recipientsCc,
        error_message: errMsg || '',
        execution_duration_ms: durationMs || 0,
      })
      $app.save(rec)
    } catch (eLog) {
      $app
        .logger()
        .error('Falha ao registrar log de execução de agendamento', 'error', String(eLog))
    }
  }

  function executeMasterSchedule(schedRecord, triggeredBy) {
    var startTime = Date.now()
    var schedId = schedRecord.id
    var schedName = schedRecord.getString('name')
    var reportId = schedRecord.getString('report_id') || 'comercial-consulta-pedidos'
    var userId = schedRecord.getString('user_id')
    var recipients = parseRecipientEmails(schedRecord.getString('recipients'))
    var recipientsCc = parseRecipientEmails(schedRecord.getString('recipients_cc'))
    var customSubject = schedRecord.getString('email_subject')
    var formats = parseJSON(schedRecord.getString('formats'), ['xlsx'])
    var filters = parseJSON(schedRecord.getString('filters'), {})
    var filterLabels = parseJSON(schedRecord.getString('filter_labels'), {})
    var dynamicRange = schedRecord.getString('dynamic_date_range') || 'today'
    var skipIfEmpty = schedRecord.getBool('skip_if_empty')
    var retryCount = schedRecord.getInt('retry_count') || 0

    if (recipients.length === 0) {
      schedRecord.set('last_run_at', new Date().toISOString())
      schedRecord.set('last_run_status', 'error')
      schedRecord.set('last_run_error', 'Nenhum destinatário de e-mail válido configurado')
      schedRecord.set('status', 'error')
      $app.save(schedRecord)
      logExecution(
        schedId,
        schedName,
        reportId,
        triggeredBy,
        schedRecord.getString('user_email'),
        'error',
        0,
        'R$ 0,00',
        '',
        '',
        'Nenhum destinatário válido',
        0,
      )
      return
    }

    var userRecord = null
    if (userId) {
      try {
        userRecord = $app.findRecordById('users', userId)
      } catch (_) {}
    }

    // Regra de segurança obrigatória 5:
    // O envio automático dos relatórios deverá validar as permissões e o vínculo com a empresa
    // no momento da execução, inclusive quando houver alterações ou revogações de acesso.
    if (userRecord) {
      if (userRecord.getBool('active') === false) {
        schedRecord.set('last_run_at', new Date().toISOString())
        schedRecord.set('last_run_status', 'error')
        schedRecord.set(
          'last_run_error',
          'Usuário criador do agendamento está inativo no momento da execução',
        )
        schedRecord.set('status', 'needs_review')
        $app.save(schedRecord)
        logExecution(
          schedId,
          schedName,
          reportId,
          triggeredBy,
          schedRecord.getString('user_email'),
          'error',
          0,
          'R$ 0,00',
          recipients.join(', '),
          '',
          'Usuário inativo na execução',
          0,
        )
        return
      }

      var currentRole = userRecord.getString('role')
      var currentEmpresa = userRecord.getString('empresa_id') || userRecord.getString('empresa')

      // Se o usuário não for SUP, valida permissão sobre o módulo no momento da execução
      if (currentRole !== 'SUP') {
        var isGestaoOrAllowed = ['PADRAO', 'GESTAO', 'DIRETORIA'].indexOf(currentRole) !== -1
        if (!isGestaoOrAllowed && currentRole !== 'COMERCIAL' && currentRole !== 'FINANCEIRO') {
          schedRecord.set('last_run_at', new Date().toISOString())
          schedRecord.set('last_run_status', 'error')
          schedRecord.set(
            'last_run_error',
            'Acesso revogado: perfil "' +
              currentRole +
              '" sem permissão para executar agendamentos de relatórios',
          )
          schedRecord.set('status', 'needs_review')
          $app.save(schedRecord)
          logExecution(
            schedId,
            schedName,
            reportId,
            triggeredBy,
            schedRecord.getString('user_email'),
            'error',
            0,
            'R$ 0,00',
            recipients.join(', '),
            '',
            'Perfil sem permissão para agendamentos',
            0,
          )
          return
        }

        // Validação de vínculo com empresa: se o usuário perdeu vínculo com a empresa do agendamento
        var schedEmpresa = schedRecord.getString('empresa')
        if (schedEmpresa && currentEmpresa && schedEmpresa !== currentEmpresa) {
          schedRecord.set('last_run_at', new Date().toISOString())
          schedRecord.set('last_run_status', 'error')
          schedRecord.set(
            'last_run_error',
            'Vínculo com a empresa alterado/revogado. Usuário atualmente pertence a outra empresa',
          )
          schedRecord.set('status', 'needs_review')
          $app.save(schedRecord)
          logExecution(
            schedId,
            schedName,
            reportId,
            triggeredBy,
            schedRecord.getString('user_email'),
            'error',
            0,
            'R$ 0,00',
            recipients.join(', '),
            '',
            'Vínculo com empresa revogado',
            0,
          )
          return
        }
      }
    }

    var meta = getReportMeta(reportId)
    var schemaMeta = introspectAndSanitizeCollection(meta.collection, meta)
    meta.columns = schemaMeta.columns

    // Escopo de empresa do agendamento (multitenancy)
    var schedEmpresa = schedRecord.getString('empresa') || ''
    if (!schedEmpresa && userRecord && userRecord.getString('role') !== 'SUP') {
      schedEmpresa = userRecord.getString('empresa_id') || userRecord.getString('empresa') || ''
    }

    var dateRange = resolveDynamicDateRangeServer(
      dynamicRange,
      filters.date_from,
      filters.date_to,
      new Date(),
    )
    var queryFilter = buildFilterQueryForSchedule(reportId, filters, userRecord, dateRange)

    if (schedEmpresa && schemaMeta.validFieldsMap['empresa']) {
      var empPart = 'empresa = "' + schedEmpresa + '"'
      queryFilter = queryFilter ? queryFilter + ' && ' + empPart : empPart
    }

    var records = []
    try {
      records = fetchRecords(meta.collection, queryFilter, schemaMeta.validFieldsMap)
    } catch (eQuery) {
      schedRecord.set('last_run_at', new Date().toISOString())
      schedRecord.set('last_run_status', 'error')
      schedRecord.set('last_run_error', 'Erro na consulta: ' + String(eQuery))
      schedRecord.set('status', 'needs_review')
      $app.save(schedRecord)
      logExecution(
        schedId,
        schedName,
        reportId,
        triggeredBy,
        schedRecord.getString('user_email'),
        'error',
        0,
        'R$ 0,00',
        recipients.join(', '),
        '',
        String(eQuery),
        Date.now() - startTime,
      )
      return
    }

    var totalSum = 0
    if (meta.amountField) {
      for (var k = 0; k < records.length; k++) {
        totalSum += parseFloat(records[k].getString(meta.amountField) || '0') || 0
      }
    }

    if (records.length === 0 && skipIfEmpty) {
      schedRecord.set('last_run_at', new Date().toISOString())
      schedRecord.set('last_run_status', 'skipped_empty')
      schedRecord.set('last_run_error', '')
      schedRecord.set('last_run_count', 0)
      schedRecord.set('last_run_total', 'R$ 0,00')
      schedRecord.set('execution_count', (schedRecord.getInt('execution_count') || 0) + 1)
      schedRecord.set('retry_count', 0)
      schedRecord.set('status', 'active')
      $app.save(schedRecord)
      logExecution(
        schedId,
        schedName,
        reportId,
        triggeredBy,
        schedRecord.getString('user_email'),
        'skipped_empty',
        0,
        'R$ 0,00',
        recipients.join(', '),
        '',
        'Consulta vazia; skip_if_empty ativo',
        Date.now() - startTime,
      )
      return
    }

    var hasXlsx = formats.indexOf('xlsx') !== -1
    var hasPdf = formats.indexOf('pdf') !== -1

    var xlsxFile = null
    var isTooLarge = false
    var filename =
      'jetro_' +
      reportId.replace(/[^a-z0-9]/g, '_') +
      '_' +
      new Date().toISOString().substring(0, 10) +
      '.xlsx'

    if (hasXlsx && records.length > 0) {
      try {
        var bytes = buildGenericXlsxBytes(meta.title, meta.columns, records)
        if (bytes.length > 10485760) {
          isTooLarge = true
        } else {
          xlsxFile = $filesystem.fileFromBytes(bytes, filename)
        }
      } catch (eZip) {
        $app.logger().error('Falha ao gerar planilha Excel master', 'error', String(eZip))
      }
    }

    var htmlBody = buildMasterEmailHtml(
      schedRecord,
      meta,
      records,
      filterLabels,
      hasPdf,
      !!xlsxFile,
      isTooLarge,
      dateRange.label,
    )

    var defaultSubject =
      'HURAM — ' + meta.title + ': ' + schedName + ' (' + records.length + ' registros)'
    var finalSubject =
      customSubject && customSubject.trim().length > 0 ? customSubject : defaultSubject

    // (b) Busca usuários SUP ativos ("role = 'SUP' && active = true"), monta a lista de e-mails em minúsculas,
    // mescla com recipients_bcc, elimina duplicidade com recipients e aplica no BCC do MailerMessage
    var recipientsBccStr = ''
    try {
      recipientsBccStr = schedRecord.getString('recipients_bcc') || ''
    } catch (_) {}
    var recipientsBcc = parseRecipientEmails(recipientsBccStr)

    var supEmails = []
    try {
      var supUsers =
        $app.findRecordsByFilter('users', 'role = "SUP" && active = true', '', 100, 0) || []
      for (var suIdx = 0; suIdx < supUsers.length; suIdx++) {
        var sEmail = (supUsers[suIdx].getString('email') || '').trim().toLowerCase()
        if (sEmail && sEmail.indexOf('@') !== -1) {
          supEmails.push(sEmail)
        }
      }
    } catch (supErr) {
      $app.logger().warn('Aviso ao buscar usuários SUP para BCC cron', 'error', String(supErr))
    }

    var toAndCcMap = {}
    for (var rToIdx = 0; rToIdx < recipients.length; rToIdx++) {
      toAndCcMap[recipients[rToIdx].toLowerCase()] = true
    }
    for (var rCcIdx = 0; rCcIdx < recipientsCc.length; rCcIdx++) {
      toAndCcMap[recipientsCc[rCcIdx].toLowerCase()] = true
    }

    var finalBccList = []
    var bccUniqueMap = {}
    var combinedBcc = recipientsBcc.concat(supEmails)
    for (var bIdx = 0; bIdx < combinedBcc.length; bIdx++) {
      var bMail = combinedBcc[bIdx].toLowerCase().trim()
      if (bMail && bMail.indexOf('@') !== -1 && !toAndCcMap[bMail] && !bccUniqueMap[bMail]) {
        bccUniqueMap[bMail] = true
        finalBccList.push(bMail)
      }
    }

    var reader = null
    try {
      var toList = recipients.map(function (email) {
        return { address: email }
      })
      var ccList = recipientsCc.map(function (email) {
        return { address: email }
      })
      var bccList = finalBccList.map(function (email) {
        return { address: email }
      })

      var mailOptions = {
        from: {
          address: $app.settings().meta.senderAddress || 'no-reply@jetro.com.br',
          name: $app.settings().meta.senderName || 'Sistema HURAM',
        },
        to: toList,
        cc: ccList,
        bcc: bccList,
        subject: finalSubject,
        html: htmlBody,
      }

      if (xlsxFile && !isTooLarge) {
        reader = xlsxFile.reader.open()
        var attachMap = {}
        attachMap[filename] = reader
        mailOptions.attachments = attachMap
      }

      var message = new MailerMessage(mailOptions)
      $app.newMailClient().send(message)

      schedRecord.set('last_run_at', new Date().toISOString())
      schedRecord.set('last_run_status', 'success')
      schedRecord.set('last_run_error', '')
      schedRecord.set('last_run_count', records.length)
      schedRecord.set('last_run_total', formatCurrencyBR(totalSum))
      schedRecord.set('execution_count', (schedRecord.getInt('execution_count') || 0) + 1)
      schedRecord.set('retry_count', 0)
      schedRecord.set('status', 'active')
      $app.save(schedRecord)

      logExecution(
        schedId,
        schedName,
        reportId,
        triggeredBy,
        schedRecord.getString('user_email'),
        'success',
        records.length,
        formatCurrencyBR(totalSum),
        recipients.join(', '),
        recipientsCc.join(', '),
        '',
        Date.now() - startTime,
      )

      try {
        var lastExecs = $app.findRecordsByFilter(
          'report_schedule_executions',
          'schedule_id = "' + schedId + '"',
          '-executed_at',
          1,
          0,
        )
        if (lastExecs && lastExecs.length > 0) {
          lastExecs[0].set('recipients_bcc', finalBccList.join(', '))
          $app.save(lastExecs[0])
        }
      } catch (_) {}
    } catch (err) {
      $app
        .logger()
        .error(
          'Falha ao enviar e-mail agendamento master',
          'schedule_id',
          schedId,
          'error',
          String(err),
        )

      var nextRetry = retryCount + 1
      schedRecord.set('last_run_at', new Date().toISOString())
      schedRecord.set('last_run_status', 'error')
      schedRecord.set('last_run_error', String(err))
      schedRecord.set('last_run_count', records.length)
      schedRecord.set('last_run_total', formatCurrencyBR(totalSum))
      schedRecord.set('retry_count', nextRetry)
      if (nextRetry >= 3) {
        schedRecord.set('status', 'error')
      }
      $app.save(schedRecord)

      logExecution(
        schedId,
        schedName,
        reportId,
        triggeredBy,
        schedRecord.getString('user_email'),
        'error',
        records.length,
        formatCurrencyBR(totalSum),
        recipients.join(', '),
        recipientsCc.join(', '),
        String(err),
        Date.now() - startTime,
      )
    } finally {
      if (reader && typeof reader.close === 'function') {
        try {
          reader.close()
        } catch (_) {}
      }
    }
  }

  // Busca agendamentos ativos na coleção `report_schedules`
  var activeList = []
  try {
    activeList = $app.findRecordsByFilter(
      'report_schedules',
      'active = true && status != "paused"',
      '',
      150,
      0,
    )
  } catch (_) {
    return
  }
  if (!activeList || activeList.length === 0) return

  var now = new Date()
  var spOffsetMs = -3 * 60 * 60 * 1000
  var spDate = new Date(now.getTime() + spOffsetMs)
  var currentHour = spDate.getUTCHours()
  var currentMinute = spDate.getUTCMinutes()
  var currentDayOfWeek = spDate.getUTCDay() // 0=dom, 1=seg
  var currentDayOfMonth = spDate.getUTCDate() // 1-31
  var todayYMD = spDate.toISOString().substring(0, 10)

  for (var idx = 0; idx < activeList.length; idx++) {
    var s = activeList[idx]
    var freq = s.getString('frequency')
    var timeOfDay = s.getString('time_of_day') || '08:00'
    var daysOfWeek = parseJSON(s.getString('days_of_week'), [])
    var dayOfMonth = s.getInt('day_of_month') || 1
    var startDate = s.getString('start_date')
    var endDate = s.getString('end_date')
    var lastRunAt = s.getString('last_run_at')

    // Verificação de vigência (start_date / end_date)
    if (startDate && todayYMD < startDate) continue
    if (endDate && todayYMD > endDate) continue

    // Evita duplicidade no mesmo dia se já executou com sucesso hoje
    if (
      lastRunAt &&
      lastRunAt.indexOf(todayYMD) === 0 &&
      s.getString('last_run_status') === 'success'
    ) {
      continue
    }

    var parts = timeOfDay.split(':')
    var schedHour = parseInt(parts[0], 10) || 0
    var schedMinute = parseInt(parts[1], 10) || 0

    var currentSlot = currentHour * 60 + currentMinute
    var schedSlot = schedHour * 60 + schedMinute

    var isDayMatch = false

    if (freq === 'daily') {
      if (Array.isArray(daysOfWeek) && daysOfWeek.length > 0) {
        isDayMatch = daysOfWeek.indexOf(currentDayOfWeek) !== -1
      } else {
        isDayMatch = true
      }
    } else if (freq === 'weekly') {
      if (Array.isArray(daysOfWeek) && daysOfWeek.length > 0) {
        isDayMatch = daysOfWeek.indexOf(currentDayOfWeek) !== -1
      } else {
        isDayMatch = currentDayOfWeek === 1 // Padrão segunda
      }
    } else if (freq === 'biweekly') {
      // Quinzenal: dias 1 e 16 ou a cada 15 dias a partir de start_date
      if (startDate) {
        var startD = new Date(startDate + 'T00:00:00Z')
        var diffDays = Math.floor((spDate.getTime() - startD.getTime()) / (24 * 60 * 60 * 1000))
        isDayMatch = diffDays >= 0 && diffDays % 15 === 0
      } else {
        isDayMatch = currentDayOfMonth === 1 || currentDayOfMonth === 16
      }
    } else if (freq === 'monthly') {
      isDayMatch = currentDayOfMonth === dayOfMonth
    }

    if (!isDayMatch) continue

    // Janela de execução de até 20 minutos
    if (currentSlot >= schedSlot && currentSlot - schedSlot <= 20) {
      try {
        executeMasterSchedule(s, 'cron')
      } catch (err) {
        $app
          .logger()
          .error('Erro no cron master de agendamento', 'schedule_id', s.id, 'error', String(err))
      }
    }
  }
})
