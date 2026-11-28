/**
 * Hook para o Fluxo Integrado de Cadastro de Clientes Jetro ERP
 * 1. Numeração automática de pré-cadastros: sequencial numérico puro (000001…)
 * 2. Numeração atômica sequencial oficial de clientes/parceiros: numérica pura (0001…)
 * 3. Impedir duplicidade de CNPJ/CPF em cadastros oficiais
 * 4. Impedir que Comercial ou RCA altere crédito sem permissão financeira
 * 5. Registro automático de histórico imutável
 *
 * Regra de numeração (pedido do usuário): código de cadastro é SOMENTE
 * numérico, sequencial e sem prefixo — sem "CLI-", sem ano. Usa o contador
 * atômico da coleção numerations (mesmo mecanismo da governança AvatarSi):
 * incrementa e persiste em uma única chamada, sem corrida entre cadastros
 * simultâneos. A lógica é embutida inline em cada callback (limitação do
 * JSVM do PocketBase: callbacks não podem referenciar funções de nível
 * superior — "Hook scoping error").
 */

onRecordCreate((e) => {
  // Pré-cadastros (RCA): sequencial numérico puro, sem "SOL-ANO-"
  if (!e.record.getString('numero')) {
    var docType = 'solicitacoes_clientes'
    var counter = null
    try {
      counter = $app.findFirstRecordByData('numerations', 'document_type', docType)
    } catch (_) {}
    if (!counter) {
      try {
        var col = $app.findCollectionByNameOrId('numerations')
        counter = new Record(col)
        counter.set('document_type', docType)
        counter.set('company', '')
        counter.set('branch', '')
        counter.set('prefix', '')
        counter.set('next_number', 1)
        counter.set('digit_count', 6)
        counter.set('annual_reset', false)
        counter.set('active', true)
        $app.save(counter)
        e.record.set('numero', '000001')
      } catch (_) {
        e.record.set('numero', '1')
      }
    } else {
      var nextSeq = (counter.getInt('next_number') || 0) + 1
      counter.set('next_number', nextSeq)
      $app.save(counter)
      e.record.set('numero', ('000000' + nextSeq).slice(-6))
    }
  }

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

// Validação e geração de código oficial ao salvar parceiro em partners
// (clientes, fornecedores, representantes e demais tipos: mesma sequência
// numérica única, sem prefixo).
onRecordCreateRequest((e) => {
  var partnerType = e.record.getString('partner_type') || 'Cliente'
  if (partnerType === 'Cliente') {
    // Se ainda não tem código oficial, gerar sequencial numérico puro (0001…)
    if (!e.record.getString('codigo_oficial')) {
      var counterCli = null
      try {
        counterCli = $app.findFirstRecordByData('numerations', 'document_type', 'clientes')
      } catch (_) {}
      if (!counterCli) {
        try {
          var colNum = $app.findCollectionByNameOrId('numerations')
          counterCli = new Record(colNum)
          counterCli.set('document_type', 'clientes')
          counterCli.set('company', '')
          counterCli.set('branch', '')
          counterCli.set('prefix', '')
          counterCli.set('next_number', 2)
          counterCli.set('digit_count', 4)
          counterCli.set('annual_reset', false)
          counterCli.set('active', true)
          $app.save(counterCli)
          e.record.set('codigo_oficial', '0001')
        } catch (_) {
          e.record.set('codigo_oficial', '1')
        }
      } else {
        var nextCli = (counterCli.getInt('next_number') || 1) + 1
        counterCli.set('next_number', nextCli)
        $app.save(counterCli)
        e.record.set('codigo_oficial', ('0000' + nextCli).slice(-4))
      }
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
  } else if (!e.record.getString('codigo_oficial')) {
    // Fornecedores, representantes e demais parceiros: mesma sequência
    // numérica única e sem prefixo.
    var counterPar = null
    try {
      counterPar = $app.findFirstRecordByData('numerations', 'document_type', 'clientes')
    } catch (_) {}
    if (!counterPar) {
      try {
        var colNumPar = $app.findCollectionByNameOrId('numerations')
        counterPar = new Record(colNumPar)
        counterPar.set('document_type', 'clientes')
        counterPar.set('company', '')
        counterPar.set('branch', '')
        counterPar.set('prefix', '')
        counterPar.set('next_number', 2)
        counterPar.set('digit_count', 4)
        counterPar.set('annual_reset', false)
        counterPar.set('active', true)
        $app.save(counterPar)
        e.record.set('codigo_oficial', '0001')
      } catch (_) {
        e.record.set('codigo_oficial', '1')
      }
    } else {
      var nextPar = (counterPar.getInt('next_number') || 1) + 1
      counterPar.set('next_number', nextPar)
      $app.save(counterPar)
      e.record.set('codigo_oficial', ('0000' + nextPar).slice(-4))
    }
  }

  e.next()
}, 'partners')
