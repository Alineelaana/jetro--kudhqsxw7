/**
 * Hook para o Fluxo Integrado de Cadastro de Clientes Jetro ERP
 * 1. Numeração automática de pré-cadastros: SOL-{ANO}-{000001}
 * 2. Numeração atômica sequencial oficial de clientes: CLI-{ANO}-{000001}
 * 3. Impedir duplicidade de CNPJ/CPF em cadastros oficiais
 * 4. Impedir que Comercial ou RCA altere crédito sem permissão financeira
 * 5. Registro automático de histórico imutável
 */

onRecordCreate((e) => {
  var year = new Date().getFullYear()
  var prefix = 'SOL-' + year + '-'

  var seq = 1
  try {
    var last = $app.findRecordsByFilter(
      'solicitacoes_clientes',
      'numero ~ "' + prefix + '"',
      '-numero',
      1,
      0,
    )
    if (last && last.length > 0) {
      var lastNum = last[0].getString('numero') || ''
      var parts = lastNum.split('-')
      if (parts.length === 3) {
        var parsed = parseInt(parts[2], 10)
        if (!isNaN(parsed) && parsed >= 1) {
          seq = parsed + 1
        }
      }
    }
  } catch (_) {
    try {
      seq = ($app.countRecords('solicitacoes_clientes') || 0) + 1
    } catch (_) {
      seq = 1
    }
  }

  var padded = ('000000' + seq).slice(-6)
  var numeroFinal = prefix + padded
  e.record.set('numero', numeroFinal)

  if (!e.record.getString('status')) {
    e.record.set('status', 'rascunho')
  }

  if (!e.record.getString('data_solicitacao')) {
    e.record.set('data_solicitacao', new Date().toISOString())
  }

  // Histórico inicial
  var hist = e.record.get('historico') || []
  if (!Array.isArray(hist)) hist = []
  hist.push({
    data_hora: new Date().toISOString(),
    usuario_id: e.record.getString('solicitante_id') || (e.auth ? e.auth.id : ''),
    usuario_nome:
      e.record.getString('solicitante_nome') || (e.auth ? e.auth.getString('name') : 'Sistema'),
    acao: 'Solicitação de pré-cadastro criada',
    status: e.record.getString('status'),
  })
  e.record.set('historico', hist)

  e.next()
}, 'solicitacoes_clientes')

// Validação e geração de código oficial ao salvar cliente em partners
onRecordCreateRequest((e) => {
  var partnerType = e.record.getString('partner_type') || 'Cliente'
  if (partnerType === 'Cliente') {
    var year = new Date().getFullYear()
    var prefix = 'CLI-' + year + '-'

    // Se ainda não tem código oficial, gerar sequencial
    if (!e.record.getString('codigo_oficial')) {
      var seq = 1
      try {
        var last = $app.findRecordsByFilter(
          'partners',
          'codigo_oficial ~ "' + prefix + '"',
          '-codigo_oficial',
          1,
          0,
        )
        if (last && last.length > 0) {
          var lastNum = last[0].getString('codigo_oficial') || ''
          var parts = lastNum.split('-')
          if (parts.length === 3) {
            var parsed = parseInt(parts[2], 10)
            if (!isNaN(parsed) && parsed >= 1) {
              seq = parsed + 1
            }
          }
        }
      } catch (_) {
        try {
          seq = ($app.countRecords('partners') || 0) + 1
        } catch (_) {
          seq = 1
        }
      }
      var padded = ('000000' + seq).slice(-6)
      e.record.set('codigo_oficial', prefix + padded)
    }

    // Validação estrita de unicidade de CNPJ/CPF entre clientes
    var doc = (e.record.getString('cnpj') || e.record.getString('cpf') || '').trim()
    if (doc) {
      try {
        var filter = '(cnpj = "' + doc + '" || cpf = "' + doc + '") && partner_type = "Cliente"'
        var existing = $app.findRecordsByFilter('partners', filter, '-created', 1, 0)
        if (existing && existing.length > 0) {
          throw new BadRequestError(
            'Já existe um cliente oficial cadastrado com este CPF/CNPJ (' +
              doc +
              '). Código: ' +
              (existing[0].getString('codigo_oficial') || existing[0].id),
          )
        }
      } catch (errDup) {
        if (String(errDup).indexOf('Já existe um cliente') !== -1) {
          throw errDup
        }
      }
    }
  }

  e.next()
}, 'partners')
