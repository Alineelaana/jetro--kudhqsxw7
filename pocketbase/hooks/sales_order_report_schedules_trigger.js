// ============================================================================
// Endpoint seguro para execução manual/imediata de agendamento de relatório
// POST /backend/v1/sales-order-schedules/trigger
// ============================================================================
routerAdd(
  'POST',
  '/backend/v1/sales-order-schedules/trigger',
  (e) => {
    var auth = e.auth
    if (!auth) {
      return e.forbiddenError('Não autorizado')
    }

    var body = e.requestInfo().body || {}
    var scheduleId = body.schedule_id

    if (!scheduleId) {
      return e.badRequestError('schedule_id é obrigatório')
    }

    var scheduleRecord = null
    try {
      scheduleRecord = $app.findRecordById('sales_order_report_schedules', scheduleId)
    } catch (_) {
      return e.notFoundError('Agendamento não encontrado')
    }

    var role = auth.getString('role')
    var ownerId = scheduleRecord.getString('user_id')
    if (ownerId !== auth.id && role !== 'SUP') {
      return e.forbiddenError('Sem permissão para executar este agendamento')
    }

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

    var EXPORT_COLUMNS = [
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
    ]

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

    function buildOrdersXlsxBytes(records) {
      var colWidths = [12, 16, 34, 18, 14, 14, 18, 18, 16, 14, 16, 8, 12, 10]
      var colsXml = colWidths
        .map(function (w, i) {
          return (
            '<col min="' + (i + 1) + '" max="' + (i + 1) + '" width="' + w + '" customWidth="1"/>'
          )
        })
        .join('')

      var totalSum = 0
      var rowsXml = []

      var headerCells = EXPORT_COLUMNS.map(function (colName, cIdx) {
        var ref = columnLetter(cIdx) + '1'
        return (
          '<c r="' +
          ref +
          '" t="inlineStr" s="1"><is><t xml:space="preserve">' +
          xmlEscape(colName) +
          '</t></is></c>'
        )
      }).join('')
      rowsXml.push('<row r="1">' + headerCells + '</row>')

      for (var rIdx = 0; rIdx < records.length; rIdx++) {
        var rec = records[rIdx]
        var rowNum = rIdx + 2
        var totalValNum = parseFloat(rec.getString('total_value') || '0') || 0
        totalSum += totalValNum

        var rowValues = [
          { v: rec.getString('order_number'), t: 'inlineStr', s: 2 },
          { v: rec.getString('integration_order_number'), t: 'inlineStr', s: 2 },
          { v: rec.getString('client_name'), t: 'inlineStr', s: 2 },
          { v: rec.getString('customer_cnpj'), t: 'inlineStr', s: 2 },
          { v: rec.getString('team'), t: 'inlineStr', s: 2 },
          { v: rec.getString('rca_name'), t: 'inlineStr', s: 2 },
          { v: formatDateBR(rec.getString('created')), t: 'inlineStr', s: 2 },
          { v: rec.getString('operation_type'), t: 'inlineStr', s: 2 },
          { v: rec.getString('sales_channel'), t: 'inlineStr', s: 2 },
          { v: String(totalValNum), t: 'n', s: 3 },
          { v: rec.getString('status'), t: 'inlineStr', s: 2 },
          { v: rec.getBool('is_balance') ? 'Sim' : 'Não', t: 'inlineStr', s: 2 },
          { v: rec.getBool('generated_balance') ? 'Sim' : 'Não', t: 'inlineStr', s: 2 },
          { v: rec.getBool('is_invoiced') ? 'Sim' : 'Não', t: 'inlineStr', s: 2 },
        ]

        var cellsXml = rowValues
          .map(function (cell, cIdx) {
            var ref = columnLetter(cIdx) + rowNum
            if (cell.t === 'n') {
              return '<c r="' + ref + '" t="n" s="' + cell.s + '"><v>' + cell.v + '</v></c>'
            }
            return (
              '<c r="' +
              ref +
              '" t="inlineStr" s="' +
              cell.s +
              '"><is><t xml:space="preserve">' +
              xmlEscape(cell.v) +
              '</t></is></c>'
            )
          })
          .join('')
        rowsXml.push('<row r="' + rowNum + '">' + cellsXml + '</row>')
      }

      var totalRowNum = records.length + 2
      var totalRowCells = EXPORT_COLUMNS.map(function (_, cIdx) {
        var ref = columnLetter(cIdx) + totalRowNum
        if (cIdx === 8) {
          return (
            '<c r="' + ref + '" t="inlineStr" s="2"><is><t xml:space="preserve">Total</t></is></c>'
          )
        }
        if (cIdx === 9) {
          return '<c r="' + ref + '" t="n" s="3"><v>' + totalSum + '</v></c>'
        }
        return '<c r="' + ref + '" t="inlineStr" s="2"><is><t xml:space="preserve"></t></is></c>'
      }).join('')
      rowsXml.push('<row r="' + totalRowNum + '">' + totalRowCells + '</row>')

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
        '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Consulta Pedidos" sheetId="1" r:id="rId1"/></sheets></workbook>'

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

    function buildScheduleFilter(f, userRec) {
      var parts = []
      if (f.operation_type && f.operation_type !== 'all')
        parts.push('operation_type = "' + f.operation_type + '"')
      if (f.client && f.client !== 'all') parts.push('client_name = "' + f.client + '"')
      if (f.team && f.team !== 'all') parts.push('team = "' + f.team + '"')
      if (f.rca && f.rca !== 'all') parts.push('rca_name = "' + f.rca + '"')
      if (f.customer_group && f.customer_group !== 'all')
        parts.push('customer_group = "' + f.customer_group + '"')
      if (f.city && f.city !== 'all') parts.push('customer_city = "' + f.city + '"')
      if (f.district) parts.push('customer_district ~ "' + f.district + '"')
      if (f.address) parts.push('customer_address ~ "' + f.address + '"')
      if (f.price_table && f.price_table !== 'all')
        parts.push('price_table_id = "' + f.price_table + '"')
      if (f.order_number) parts.push('order_number ~ "' + f.order_number + '"')
      if (f.integration_number)
        parts.push('integration_order_number ~ "' + f.integration_number + '"')
      if (f.date_from) parts.push('created >= "' + f.date_from + '"')
      if (f.date_to) parts.push('created <= "' + f.date_to + '"')
      if (f.statuses && Array.isArray(f.statuses) && f.statuses.length > 0) {
        var sParts = f.statuses.map(function (s) {
          return 'status = "' + s + '"'
        })
        parts.push('(' + sParts.join(' || ') + ')')
      }
      if (f.is_balance && f.is_balance !== 'all')
        parts.push('is_balance = ' + (f.is_balance === 'yes'))
      if (f.generated_balance && f.generated_balance !== 'all')
        parts.push('generated_balance = ' + (f.generated_balance === 'yes'))
      if (f.channel && f.channel !== 'all') parts.push('sales_channel = "' + f.channel + '"')
      if (f.only_invoiced) parts.push('is_invoiced = true')

      if (userRec && userRec.getString('role') === 'RCA') {
        parts.push('rca_id = "' + userRec.id + '"')
      }

      return parts.join(' && ')
    }

    function fetchAllOrders(filter) {
      var all = []
      var pageSize = 200
      var maxLimit = 10000
      var page = 1

      while (all.length < maxLimit) {
        var list = []
        try {
          list = $app.findRecordsByFilter(
            'sales_orders',
            filter,
            '-created',
            pageSize,
            (page - 1) * pageSize,
          )
        } catch (_) {
          break
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

    function buildHtmlEmailBody(
      schedule,
      orders,
      filterLabels,
      hasPdfMarked,
      hasAttachment,
      isTooLarge,
    ) {
      var schedName = schedule.getString('name')
      var totalCount = orders.length
      var totalValue = 0
      for (var i = 0; i < orders.length; i++) {
        totalValue += parseFloat(orders[i].getString('total_value') || '0') || 0
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
          : '<li style="color: #6b7280;">Nenhum filtro específico aplicado (todos os pedidos visíveis).</li>'

      var tablePreviewHtml = ''
      if (totalCount > 0) {
        var previewOrders = orders.slice(0, 15)
        var rows = previewOrders
          .map(function (r, idx) {
            var bg = idx % 2 === 0 ? '#ffffff' : '#f9fafb'
            var val = parseFloat(r.getString('total_value') || '0') || 0
            return (
              '<tr style="background: ' +
              bg +
              '; border-bottom: 1px solid #e5e7eb;">' +
              '<td style="padding: 6px 10px; font-weight: 600; color: #005B2E;">' +
              xmlEscape(r.getString('order_number') || '—') +
              '</td>' +
              '<td style="padding: 6px 10px; color: #374151;">' +
              xmlEscape(r.getString('client_name') || '—') +
              '</td>' +
              '<td style="padding: 6px 10px; color: #6b7280;">' +
              xmlEscape(formatDateBR(r.getString('created'))) +
              '</td>' +
              '<td style="padding: 6px 10px; color: #374151;">' +
              xmlEscape(r.getString('status') || '—') +
              '</td>' +
              '<td style="padding: 6px 10px; text-align: right; font-weight: 600; color: #111827;">' +
              formatCurrencyBR(val) +
              '</td>' +
              '</tr>'
            )
          })
          .join('')

        tablePreviewHtml =
          '<div style="margin-top: 20px;">' +
          '<h3 style="font-size: 14px; color: #005B2E; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px;">Prévia dos pedidos mais recentes (' +
          previewOrders.length +
          ' de ' +
          totalCount +
          '):</h3>' +
          '<table style="width: 100%; border-collapse: collapse; font-size: 12px; border: 1px solid #e5e7eb;">' +
          '<thead>' +
          '<tr style="background: #005B2E; color: #ffffff;">' +
          '<th style="padding: 8px 10px; text-align: left;">Nº Pedido</th>' +
          '<th style="padding: 8px 10px; text-align: left;">Cliente</th>' +
          '<th style="padding: 8px 10px; text-align: left;">Data</th>' +
          '<th style="padding: 8px 10px; text-align: left;">Status</th>' +
          '<th style="padding: 8px 10px; text-align: right;">Valor</th>' +
          '</tr>' +
          '</thead>' +
          '<tbody>' +
          rows +
          '</tbody>' +
          '</table>' +
          (totalCount > 15
            ? '<p style="font-size: 11px; color: #6b7280; margin-top: 6px;">Consulte a planilha completa em anexo para ver todos os ' +
              totalCount +
              ' pedidos.</p>'
            : '') +
          '</div>'
      }

      var warningBox = ''
      if (hasPdfMarked) {
        warningBox +=
          '<div style="margin-top: 14px; padding: 10px 14px; background: #fffbeb; border-left: 4px solid #C9A227; font-size: 12px; color: #92400e;">' +
          '<strong>Nota sobre o formato PDF:</strong> O anexo Excel (.xlsx) nativo está incluído com todos os dados tabulares. Como a renderização fiel do layout de impressão do PDF ocorre via navegador, uma tabela-resumo executiva foi incluída diretamente no corpo deste e-mail.' +
          '</div>'
      }
      if (isTooLarge) {
        warningBox +=
          '<div style="margin-top: 14px; padding: 10px 14px; background: #fef2f2; border-left: 4px solid #dc2626; font-size: 12px; color: #991b1b;">' +
          '<strong>Aviso de tamanho:</strong> O arquivo ultrapassou o limite seguro de envio por e-mail (10 MB). Por segurança, o arquivo pesado não foi anexado; consulte o painel Web da Consulta de Pedidos do Jetro para download direto da base completa.' +
          '</div>'
      }

      var emptyNotice =
        totalCount === 0
          ? '<div style="margin-top: 14px; padding: 12px 16px; background: #f3f4f6; border-left: 4px solid #6b7280; font-size: 13px; color: #374151;">Nenhum pedido encontrado no período com os filtros configurados neste agendamento.</div>'
          : ''

      return (
        '<!DOCTYPE html>' +
        '<html lang="pt-BR"><head><meta charset="utf-8" /></head>' +
        '<body style="font-family: Arial, Helvetica, sans-serif; background-color: #f9fafb; margin: 0; padding: 24px; color: #1f2937;">' +
        '<div style="max-width: 680px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e5e7eb; overflow: hidden;">' +
        '<div style="background: #005B2E; padding: 20px 24px; border-bottom: 4px solid #C9A227;">' +
        '<div style="font-size: 22px; font-weight: bold; color: #ffffff; letter-spacing: 1px;">JETRO<span style="color: #C9A227;">.</span></div>' +
        '<div style="font-size: 12px; color: #d1fae5; margin-top: 2px;">Sistema Integrado ERP — Exportação Agendada (Envio Imediato)</div>' +
        '</div>' +
        '<div style="padding: 24px;">' +
        '<h2 style="font-size: 18px; color: #005B2E; margin: 0 0 6px 0;">Relatório: ' +
        xmlEscape(schedName) +
        '</h2>' +
        '<p style="font-size: 13px; color: #6b7280; margin: 0 0 16px 0;">Disparado manualmente em ' +
        formatDateBR(new Date().toISOString()) +
        '.</p>' +
        '<div style="display: table; width: 100%; margin: 16px 0; background: #f4faf6; border-radius: 6px; border: 1px solid #d1fae5;">' +
        '<div style="display: table-cell; padding: 14px 18px; width: 50%; border-right: 1px solid #d1fae5;">' +
        '<div style="font-size: 11px; text-transform: uppercase; color: #065f46; font-weight: 600;">Total de Pedidos</div>' +
        '<div style="font-size: 24px; font-weight: bold; color: #005B2E; margin-top: 4px;">' +
        totalCount +
        '</div>' +
        '</div>' +
        '<div style="display: table-cell; padding: 14px 18px; width: 50%;">' +
        '<div style="font-size: 11px; text-transform: uppercase; color: #065f46; font-weight: 600;">Valor Total</div>' +
        '<div style="font-size: 24px; font-weight: bold; color: #005B2E; margin-top: 4px;">' +
        formatCurrencyBR(totalValue) +
        '</div>' +
        '</div></div>' +
        emptyNotice +
        '<div style="margin-top: 18px; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 6px; padding: 14px 18px;">' +
        '<h4 style="font-size: 12px; text-transform: uppercase; color: #005B2E; margin: 0 0 8px 0;">Filtros Fixados da Consulta:</h4>' +
        '<ul style="margin: 0; padding-left: 18px; font-size: 12px; color: #374151; line-height: 1.5;">' +
        filterListHtml +
        '</ul>' +
        '</div>' +
        tablePreviewHtml +
        warningBox +
        '<div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af; text-align: center;">' +
        'Este é um e-mail do Jetro ERP.<br/>Gerencie em <strong>/admin/vendas/consulta-pedidos</strong>.' +
        '</div></div></div></body></html>'
      )
    }

    var schedName = scheduleRecord.getString('name')
    var userId = scheduleRecord.getString('user_id')
    var recipients = parseRecipientEmails(scheduleRecord.getString('recipients'))
    var filters = parseJSON(scheduleRecord.getString('filters'), {})
    var filterLabels = parseJSON(scheduleRecord.getString('filter_labels'), {})
    var formats = parseJSON(scheduleRecord.getString('formats'), ['xlsx'])
    var skipIfEmpty = scheduleRecord.getBool('skip_if_empty')

    if (recipients.length === 0) {
      scheduleRecord.set('last_run_at', new Date().toISOString())
      scheduleRecord.set('last_run_status', 'error')
      scheduleRecord.set('last_run_error', 'Nenhum destinatário válido informado')
      $app.save(scheduleRecord)
      return e.badRequestError('Nenhum destinatário de e-mail válido configurado')
    }

    var userRecord = null
    if (userId) {
      try {
        userRecord = $app.findRecordById('users', userId)
      } catch (_) {}
    }

    var queryFilter = buildScheduleFilter(filters, userRecord)
    var orders = fetchAllOrders(queryFilter)

    var totalValue = 0
    for (var oi = 0; oi < orders.length; oi++) {
      totalValue += parseFloat(orders[oi].getString('total_value') || '0') || 0
    }

    if (orders.length === 0 && skipIfEmpty) {
      scheduleRecord.set('last_run_at', new Date().toISOString())
      scheduleRecord.set('last_run_status', 'skipped_empty')
      scheduleRecord.set('last_run_error', '')
      scheduleRecord.set('last_run_count', 0)
      scheduleRecord.set('last_run_total', 'R$ 0,00')
      scheduleRecord.set('execution_count', (scheduleRecord.getInt('execution_count') || 0) + 1)
      $app.save(scheduleRecord)
      return e.json(200, {
        success: true,
        count: 0,
        status: 'skipped_empty',
        message: 'Consulta vazia. Envio ignorado conforme configuração (skip_if_empty).',
      })
    }

    var hasXlsx = formats.indexOf('xlsx') !== -1
    var hasPdf = formats.indexOf('pdf') !== -1

    var xlsxFile = null
    var isTooLarge = false
    var filename =
      'relatorio-pedidos_' +
      schedName.toLowerCase().replace(/[^a-z0-9]/g, '_') +
      '_' +
      new Date().toISOString().substring(0, 10) +
      '.xlsx'

    if (hasXlsx && orders.length > 0) {
      try {
        var bytes = buildOrdersXlsxBytes(orders)
        if (bytes.length > 10485760) {
          isTooLarge = true
        } else {
          xlsxFile = $filesystem.fileFromBytes(bytes, filename)
        }
      } catch (eZip) {
        $app.logger().error('Falha ao gerar planilha Excel trigger', 'error', String(eZip))
      }
    }

    var htmlBody = buildHtmlEmailBody(
      scheduleRecord,
      orders,
      filterLabels,
      hasPdf,
      !!xlsxFile,
      isTooLarge,
    )
    var subject = 'Jetro — Relatório de Pedidos: ' + schedName + ' (' + orders.length + ' pedidos)'

    var reader = null
    try {
      var toList = recipients.map(function (email) {
        return { address: email }
      })
      var mailOptions = {
        from: {
          address: $app.settings().meta.senderAddress || 'no-reply@jetro.com.br',
          name: $app.settings().meta.senderName || 'Jetro ERP',
        },
        to: toList,
        subject: subject,
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

      scheduleRecord.set('last_run_at', new Date().toISOString())
      scheduleRecord.set('last_run_status', 'success')
      scheduleRecord.set('last_run_error', '')
      scheduleRecord.set('last_run_count', orders.length)
      scheduleRecord.set('last_run_total', formatCurrencyBR(totalValue))
      scheduleRecord.set('execution_count', (scheduleRecord.getInt('execution_count') || 0) + 1)
      $app.save(scheduleRecord)

      return e.json(200, {
        success: true,
        count: orders.length,
        total: formatCurrencyBR(totalValue),
        recipients: recipients,
        hasAttachment: !!xlsxFile && !isTooLarge,
      })
    } catch (err) {
      $app
        .logger()
        .error(
          'Falha ao enviar e-mail de agendamento trigger',
          'schedule_id',
          scheduleId,
          'error',
          String(err),
        )
      scheduleRecord.set('last_run_at', new Date().toISOString())
      scheduleRecord.set('last_run_status', 'error')
      scheduleRecord.set('last_run_error', String(err))
      scheduleRecord.set('last_run_count', orders.length)
      scheduleRecord.set('last_run_total', formatCurrencyBR(totalValue))
      $app.save(scheduleRecord)
      return e.json(500, { success: false, error: String(err) })
    } finally {
      if (reader && typeof reader.close === 'function') {
        try {
          reader.close()
        } catch (_) {}
      }
    }
  },
  $apis.requireAuth(),
)
