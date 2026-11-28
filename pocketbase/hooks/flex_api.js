// Hooks do módulo FLEX (Saldo FLEX do RCA) — /backend/v1/flex
//
// Regras de plataforma respeitadas:
// - routerAdd com caminho no padrão /backend/v1/...
// - NENHUMA referência a funções/constantes de nível superior dentro dos
//   callbacks (Hook scoping error do JSVM): toda a lógica é embutida inline.
// - onRecordCreate SEMPRE chama e.next().
//
// Coleções (migração 0370):
//   flex_accounts  — conta do representante (empresa+filial+rca única):
//                    balance = saldo efetivado disponível, reserved = reservado
//                    em pedidos não faturados.
//   flex_movements — ledger append-only: credito_gerado, credito_liberado,
//                    reserva, flex_gasto, liberacao_reserva, estorno, ajuste.
//
// Endpoints (todos autenticados; saldo oficial fica no Huram):
//   GET  /backend/v1/flex/balance?empresa_id=&filial_id=&rca_id=
//        Saldo atual da conta { balance, reserved, available }.
//   POST /backend/v1/flex/reserve
//        { external_id, empresa_id, filial_id, rca_id, cliente_id, cliente_name,
//          produto_id, produto_descricao, quantidade, preco_base, preco_negociado,
//          valor_flex, pedido_fv, pedido_huram, item_id }
//        Valida saldo disponível e cria movimento 'reserva'. Idempotente por
//        external_id. Atômico: revalida o saldo no momento da gravação.
//   POST /backend/v1/flex/convert
//        { external_id, movement_id? , nf?, charged_value? }
//        Converte reserva → débito no faturamento (proporcional ao faturado).
//        Idempotente por external_id.
//   POST /backend/v1/flex/release
//        { external_id, movement_id?, reason? }
//        Estorno/liberação de reserva em rejeição/cancelamento/devolução,
//        vinculado ao movimento original (link_type='estorno').
//        Idempotente por external_id.
//   POST /backend/v1/flex/credit
//        { external_id, empresa_id, ..., valor_flex, tipo: 'gerado'|'liberado' }
//        Crédito gerado (venda acima do preço-base) ou liberação do crédito
//        após faturamento. Idempotente por external_id.
//   POST /backend/v1/flex/adjust
//        { empresa_id, filial_id, rca_id, valor, motivo } — ajuste manual,
//        restrito a perfis autorizados (não-RCA), grava saldo antes/depois.
//   POST /backend/v1/flex/report-issue
//        { movement_id, issue } — registra falha de integração para
//        reprocessamento/conciliação (integration_status='falha').
//
// Contrato para o lado Avatar FV (documentação, não executado aqui):
//   - Se o Huram estiver indisponível, o FV salva o pedido como RASCUNHO com
//     FLEX pendente e reenvia ao voltar (o external_id garante que o reenvio
//     não duplique créditos/débitos).
//   - Se o pedido depender de liberação comercial (tela Liberações comerciais,
//     Rotinas), o Huram responde 409 com { pending_commercial_release: true }
//     ANTES de autorizar a reserva/débito.

routerAdd(
  'GET',
  '/backend/v1/flex/balance',
  (e) => {
    const auth = e.requestInfo().auth
    if (!auth) {
      return e.json(401, { error: 'Autenticação obrigatória' })
    }
    const q = e.requestInfo().query || {}
    const empresaId = String(q.empresa_id || '')
    const filialId = String(q.filial_id || '')
    const rcaId = String(q.rca_id || '')
    if (empresaId === '' || rcaId === '') {
      return e.json(400, { error: 'empresa_id e rca_id são obrigatórios' })
    }

    // RCA consulta só a própria conta; gerente/gestão passa pelo filtro de escopo
    const role = auth.getString('role')
    const isRca = role === 'rca'
    if (isRca && rcaId !== auth.id) {
      return e.json(403, { error: 'RCA só pode consultar a própria conta' })
    }

    let account = null
    try {
      account = e.app.findFirstRecordByFilter(
        'flex_accounts',
        "empresa_id = '" +
          empresaId +
          "' && filial_id = '" +
          filialId +
          "' && rca_id = '" +
          rcaId +
          "'",
      )
    } catch (err) {
      account = null
    }
    if (!account) {
      // Conta ainda não criada: saldo zero (sem dados de exemplo)
      return e.json(200, {
        ok: true,
        account_found: false,
        balance: 0,
        reserved: 0,
        available: 0,
      })
    }
    const balance = account.getFloat('balance')
    const reserved = account.getFloat('reserved')
    return e.json(200, {
      ok: true,
      account_found: true,
      account_id: account.id,
      balance: balance,
      reserved: reserved,
      available: balance - reserved,
    })
  },
  (e) => {
    e.next()
  },
)

routerAdd(
  'POST',
  '/backend/v1/flex/reserve',
  (e) => {
    const auth = e.requestInfo().auth
    if (!auth) {
      return e.json(401, { error: 'Autenticação obrigatória' })
    }
    const body = e.requestInfo().body || {}

    const externalId = String(body.external_id || '')
    const empresaId = String(body.empresa_id || '')
    const filialId = String(body.filial_id || '')
    const rcaId = String(body.rca_id || '')
    const valorFlex = Number(body.valor_flex || 0)
    const clienteId = String(body.cliente_id || '')
    const clienteName = String(body.cliente_name || '')
    const produtoId = String(body.produto_id || '')
    const produtoDesc = String(body.produto_descricao || '')
    const quantidade = Number(body.quantidade || 0)
    const precoBase = Number(body.preco_base || 0)
    const precoNegociado = Number(body.preco_negociado || 0)
    const pedidoFv = String(body.pedido_fv || '')
    const pedidoHuram = String(body.pedido_huram || '')

    if (externalId === '' || empresaId === '' || rcaId === '') {
      return e.json(400, { error: 'external_id, empresa_id e rca_id são obrigatórios' })
    }
    if (valorFlex <= 0) {
      return e.json(400, { error: 'valor_flex deve ser positivo' })
    }
    if (precoNegociado >= precoBase) {
      return e.json(400, {
        error: 'preço negociado deve ser menor que o preço-base para usar FLEX',
      })
    }

    // Idempotência: reenvio com mesmo external_id não duplica
    let dup = null
    try {
      dup = e.app.findFirstRecordByFilter('flex_movements', "external_id = '" + externalId + "'")
    } catch (err) {
      dup = null
    }
    if (dup) {
      return e.json(200, {
        ok: true,
        idempotent: true,
        movement_id: dup.id,
        status: dup.getString('status'),
        type: dup.getString('type'),
        balance: dup.getFloat('balance_after'),
        reserved: dup.getFloat('reserved_after'),
      })
    }

    // Pendência de liberação comercial: recusar ANTES de autorizar
    let pendingApproval = null
    try {
      pendingApproval = e.app.findFirstRecordByFilter(
        'commercial_release_requests',
        "pedido_huram = '" +
          pedidoHuram +
          "' && pedido_fv = '" +
          pedidoFv +
          "' && status = 'pendente'",
      )
    } catch (err) {
      pendingApproval = null
    }
    if (pendingApproval) {
      return e.json(409, {
        ok: false,
        pending_commercial_release: true,
        message: 'Pedido aguarda liberação comercial (Rotinas) antes de usar FLEX',
        request_id: pendingApproval.id,
      })
    }

    // Toda a leitura+escrita da conta acontece DENTRO de uma transação: dois
    // pedidos simultâneos NÃO gastam o mesmo saldo (o segundo espera o lock e
    // revalida o reserved já atualizado pelo primeiro).
    let response = null
    e.app.runInTransaction(function (tx) {
      let account = null
      try {
        account = tx.findFirstRecordByFilter(
          'flex_accounts',
          "empresa_id = '" +
            empresaId +
            "' && filial_id = '" +
            filialId +
            "' && rca_id = '" +
            rcaId +
            "'",
        )
      } catch (err) {
        account = null
      }
      if (!account) {
        account = new Record(tx.findCollectionByNameOrId('flex_accounts'))
        account.set('empresa_id', empresaId)
        account.set('filial_id', filialId)
        account.set('rca_id', rcaId)
        account.set('balance', 0)
        account.set('reserved', 0)
        tx.save(account)
      }

      const balanceBefore = account.getFloat('balance')
      const reservedBefore = account.getFloat('reserved')
      const available = balanceBefore - reservedBefore
      if (valorFlex > available) {
        response = e.json(409, {
          ok: false,
          error: 'Saldo FLEX insuficiente',
          available: available,
          requested: valorFlex,
        })
        return
      }

      account.set('reserved', reservedBefore + valorFlex)
      tx.save(account)

      const movement = new Record(tx.findCollectionByNameOrId('flex_movements'))
      movement.set('type', 'reserva')
      movement.set('status', 'reservado')
      movement.set('external_id', externalId)
      movement.set('empresa_id', empresaId)
      movement.set('filial_id', filialId)
      movement.set('rca_id', rcaId)
      movement.set('rca_name', String(body.rca_name || ''))
      movement.set('gerente_id', String(body.gerente_id || ''))
      movement.set('gerente_name', String(body.gerente_name || ''))
      movement.set('equipe_id', String(body.equipe_id || ''))
      movement.set('equipe_name', String(body.equipe_name || ''))
      movement.set('cliente_id', clienteId)
      movement.set('cliente_name', clienteName)
      movement.set('produto_id', produtoId)
      movement.set('produto_descricao', produtoDesc)
      movement.set('quantidade', quantidade)
      movement.set('preco_base', precoBase)
      movement.set('preco_negociado', precoNegociado)
      movement.set('valor_flex', valorFlex)
      movement.set('charged_value', 0)
      movement.set('pedido_fv', pedidoFv)
      movement.set('pedido_huram', pedidoHuram)
      movement.set('nf', '')
      movement.set('integration_status', 'concluida')
      movement.set('balance_before', balanceBefore)
      movement.set('balance_after', balanceBefore)
      movement.set('reserved_before', reservedBefore)
      movement.set('reserved_after', reservedBefore + valorFlex)
      movement.set('created_by', auth.id)
      try {
        tx.save(movement)
      } catch (err) {
        // external_id duplicado em condição de corrida: transação é revertida
        response = e.json(409, { error: 'Movimento já registrado (external_id duplicado)' })
        throw err
      }

      response = e.json(200, {
        ok: true,
        movement_id: movement.id,
        status: 'reservado',
        balance: balanceBefore,
        reserved: reservedBefore + valorFlex,
        available: balanceBefore - (reservedBefore + valorFlex),
      })
    })
    return response
  },
  (e) => {
    e.next()
  },
)

routerAdd(
  'POST',
  '/backend/v1/flex/convert',
  (e) => {
    const auth = e.requestInfo().auth
    if (!auth) {
      return e.json(401, { error: 'Autenticação obrigatória' })
    }
    const body = e.requestInfo().body || {}
    const externalId = String(body.external_id || '')
    const movementId = String(body.movement_id || '')
    const nf = String(body.nf || '')
    const chargedValue = Number(body.charged_value || 0)

    if (externalId === '' && movementId === '') {
      return e.json(400, { error: 'external_id ou movement_id é obrigatório' })
    }

    // Localiza a RESERVA original
    let original = null
    if (movementId !== '') {
      try {
        original = e.app.findRecordById('flex_movements', movementId)
      } catch (err) {
        original = null
      }
    } else {
      try {
        original = e.app.findFirstRecordByFilter(
          'flex_movements',
          "external_id = '" + externalId + "'",
        )
      } catch (err) {
        original = null
      }
    }
    if (!original || original.getString('type') !== 'reserva') {
      return e.json(404, { error: 'Reserva original não encontrada' })
    }
    if (original.getString('status') !== 'reservado') {
      return e.json(409, {
        error: 'Reserva não está mais em aberto',
        status: original.getString('status'),
      })
    }

    const convExternalId = externalId !== '' ? externalId : 'conv-' + movementId + '-' + Date.now()

    // Idempotência da conversão (reenvio não debita duas vezes)
    let dup = null
    try {
      dup = e.app.findFirstRecordByFilter(
        'flex_movements',
        "external_id = '" + convExternalId + "' && type = 'flex_gasto'",
      )
    } catch (err) {
      dup = null
    }
    if (dup) {
      return e.json(200, { ok: true, idempotent: true, movement_id: dup.id })
    }

    // Proporcional ao faturado
    const reservedTotal = original.getFloat('valor_flex')
    const proporcao = chargedValue > 0 ? Math.min(1, chargedValue / reservedTotal) : 1
    const debit = Math.round(reservedTotal * proporcao * 100) / 100
    const liberado = Math.round((reservedTotal - debit) * 100) / 100

    let account = null
    try {
      account = e.app.findFirstRecordByFilter(
        'flex_accounts',
        "empresa_id = '" +
          original.getString('empresa_id') +
          "' && filial_id = '" +
          original.getString('filial_id') +
          "' && rca_id = '" +
          original.getString('rca_id') +
          "'",
      )
    } catch (err) {
      account = null
    }
    if (!account) {
      return e.json(404, { error: 'Conta do representante não encontrada' })
    }

    const balanceBefore = account.getFloat('balance')
    const reservedBefore = account.getFloat('reserved')

    account.set('reserved', Math.max(0, reservedBefore - reservedTotal))
    account.set('balance', Math.max(0, balanceBefore - debit))
    e.app.save(account)

    // 1. Movimento de débito (flex_gasto)
    const debitMov = new Record(e.app.findCollectionByNameOrId('flex_movements'))
    debitMov.set('type', 'flex_gasto')
    debitMov.set('status', 'efetivado')
    debitMov.set('external_id', convExternalId)
    debitMov.set('empresa_id', original.getString('empresa_id'))
    debitMov.set('filial_id', original.getString('filial_id'))
    debitMov.set('rca_id', original.getString('rca_id'))
    debitMov.set('rca_name', original.getString('rca_name'))
    debitMov.set('gerente_id', original.getString('gerente_id'))
    debitMov.set('gerente_name', original.getString('gerente_name'))
    debitMov.set('equipe_id', original.getString('equipe_id'))
    debitMov.set('equipe_name', original.getString('equipe_name'))
    debitMov.set('cliente_id', original.getString('cliente_id'))
    debitMov.set('cliente_name', original.getString('cliente_name'))
    debitMov.set('produto_id', original.getString('produto_id'))
    debitMov.set('produto_descricao', original.getString('produto_descricao'))
    debitMov.set('quantidade', original.getFloat('quantidade'))
    debitMov.set('preco_base', original.getFloat('preco_base'))
    debitMov.set('preco_negociado', original.getFloat('preco_negociado'))
    debitMov.set('valor_flex', debit)
    debitMov.set('charged_value', chargedValue)
    debitMov.set('pedido_fv', original.getString('pedido_fv'))
    debitMov.set('pedido_huram', original.getString('pedido_huram'))
    debitMov.set('nf', nf)
    debitMov.set('integration_status', 'concluida')
    debitMov.set('link_type', 'reserva_debito')
    debitMov.set('link_id', original.id)
    debitMov.set('balance_before', balanceBefore)
    debitMov.set('balance_after', account.getFloat('balance'))
    debitMov.set('reserved_before', reservedBefore)
    debitMov.set('reserved_after', account.getFloat('reserved'))
    debitMov.set('created_by', auth.id)
    e.app.save(debitMov)

    // 2. Liberação do restante não faturado (se proporcional < 100%)
    if (liberado > 0) {
      const relMov = new Record(e.app.findCollectionByNameOrId('flex_movements'))
      relMov.set('type', 'liberacao_reserva')
      relMov.set('status', 'efetivado')
      relMov.set('external_id', convExternalId + '-rel')
      relMov.set('empresa_id', original.getString('empresa_id'))
      relMov.set('filial_id', original.getString('filial_id'))
      relMov.set('rca_id', original.getString('rca_id'))
      relMov.set('rca_name', original.getString('rca_name'))
      relMov.set('gerente_id', original.getString('gerente_id'))
      relMov.set('gerente_name', original.getString('gerente_name'))
      relMov.set('equipe_id', original.getString('equipe_id'))
      relMov.set('equipe_name', original.getString('equipe_name'))
      relMov.set('cliente_id', original.getString('cliente_id'))
      relMov.set('cliente_name', original.getString('cliente_name'))
      relMov.set('produto_id', original.getString('produto_id'))
      relMov.set('produto_descricao', original.getString('produto_descricao'))
      relMov.set('valor_flex', liberado)
      relMov.set('charged_value', chargedValue)
      relMov.set('pedido_fv', original.getString('pedido_fv'))
      relMov.set('pedido_huram', original.getString('pedido_huram'))
      relMov.set('nf', nf)
      relMov.set('integration_status', 'concluida')
      relMov.set('link_type', 'reserva_debito')
      relMov.set('link_id', original.id)
      relMov.set('reason', 'faturamento parcial: parcela não faturada liberada')
      relMov.set('balance_before', account.getFloat('balance'))
      relMov.set('balance_after', account.getFloat('balance'))
      relMov.set('reserved_before', reservedBefore)
      relMov.set('reserved_after', account.getFloat('reserved'))
      relMov.set('created_by', auth.id)
      e.app.save(relMov)
    }

    // Marca a reserva original como efetivada (parcial ou total)
    original.set('status', 'efetivado')
    if (nf !== '') {
      original.set('nf', nf)
    }
    e.app.save(original)

    return e.json(200, {
      ok: true,
      movement_id: debitMov.id,
      debit: debit,
      released: liberado,
      balance: account.getFloat('balance'),
      reserved: account.getFloat('reserved'),
      available: account.getFloat('balance') - account.getFloat('reserved'),
    })
  },
  (e) => {
    e.next()
  },
)

routerAdd(
  'POST',
  '/backend/v1/flex/release',
  (e) => {
    const auth = e.requestInfo().auth
    if (!auth) {
      return e.json(401, { error: 'Autenticação obrigatória' })
    }
    const body = e.requestInfo().body || {}
    const externalId = String(body.external_id || '')
    const movementId = String(body.movement_id || '')
    const reason = String(body.reason || '')

    if (externalId === '' && movementId === '') {
      return e.json(400, { error: 'external_id ou movement_id é obrigatório' })
    }

    // Localiza o movimento ORIGINAL (reserva ou crédito)
    let original = null
    if (movementId !== '') {
      try {
        original = e.app.findRecordById('flex_movements', movementId)
      } catch (err) {
        original = null
      }
    } else {
      try {
        original = e.app.findFirstRecordByFilter(
          'flex_movements',
          "external_id = '" + externalId + "'",
        )
      } catch (err) {
        original = null
      }
    }
    if (!original) {
      return e.json(404, { error: 'Movimento original não encontrado' })
    }

    const origType = original.getString('type')
    if (
      origType !== 'reserva' &&
      origType !== 'credito_gerado' &&
      origType !== 'credito_liberado'
    ) {
      return e.json(400, { error: 'Tipo de movimento não permite estorno/liberação' })
    }
    if (
      original.getString('status') === 'estornado' ||
      original.getString('status') === 'cancelado'
    ) {
      return e.json(409, { error: 'Movimento já estornado/cancelado' })
    }

    const relExternalId =
      externalId !== '' && externalId !== original.getString('external_id')
        ? externalId
        : 'rel-' + original.id + '-' + Date.now()

    // Idempotência do estorno/liberação
    let dup = null
    try {
      dup = e.app.findFirstRecordByFilter(
        'flex_movements',
        "link_id = '" + original.id + "' && type = 'estorno'",
      )
    } catch (err) {
      dup = null
    }
    if (dup) {
      return e.json(200, { ok: true, idempotent: true, movement_id: dup.id })
    }

    let account = null
    try {
      account = e.app.findFirstRecordByFilter(
        'flex_accounts',
        "empresa_id = '" +
          original.getString('empresa_id') +
          "' && filial_id = '" +
          original.getString('filial_id') +
          "' && rca_id = '" +
          original.getString('rca_id') +
          "'",
      )
    } catch (err) {
      account = null
    }
    if (!account) {
      return e.json(404, { error: 'Conta do representante não encontrada' })
    }

    const balanceBefore = account.getFloat('balance')
    const reservedBefore = account.getFloat('reserved')
    const valor = original.getFloat('valor_flex')

    account.set('reserved', Math.max(0, reservedBefore - (origType === 'reserva' ? valor : 0)))
    account.set('balance', Math.max(0, balanceBefore - (origType === 'reserva' ? 0 : valor)))
    e.app.save(account)

    const relMov = new Record(e.app.findCollectionByNameOrId('flex_movements'))
    relMov.set('type', 'estorno')
    relMov.set('status', 'efetivado')
    relMov.set('external_id', relExternalId)
    relMov.set('empresa_id', original.getString('empresa_id'))
    relMov.set('filial_id', original.getString('filial_id'))
    relMov.set('rca_id', original.getString('rca_id'))
    relMov.set('rca_name', original.getString('rca_name'))
    relMov.set('gerente_id', original.getString('gerente_id'))
    relMov.set('gerente_name', original.getString('gerente_name'))
    relMov.set('equipe_id', original.getString('equipe_id'))
    relMov.set('equipe_name', original.getString('equipe_name'))
    relMov.set('cliente_id', original.getString('cliente_id'))
    relMov.set('cliente_name', original.getString('cliente_name'))
    relMov.set('produto_id', original.getString('produto_id'))
    relMov.set('produto_descricao', original.getString('produto_descricao'))
    relMov.set('valor_flex', valor)
    relMov.set('pedido_fv', original.getString('pedido_fv'))
    relMov.set('pedido_huram', original.getString('pedido_huram'))
    relMov.set('nf', original.getString('nf'))
    relMov.set('integration_status', 'concluida')
    relMov.set('link_type', 'estorno_original')
    relMov.set('link_id', original.id)
    relMov.set(
      'reason',
      reason !== '' ? reason : 'estorno/liberação de ' + origType.replace('_', ' '),
    )
    relMov.set('balance_before', balanceBefore)
    relMov.set('balance_after', account.getFloat('balance'))
    relMov.set('reserved_before', reservedBefore)
    relMov.set('reserved_after', account.getFloat('reserved'))
    relMov.set('created_by', auth.id)
    e.app.save(relMov)

    original.set('status', 'estornado')
    e.app.save(original)

    return e.json(200, {
      ok: true,
      movement_id: relMov.id,
      valor: valor,
      balance: account.getFloat('balance'),
      reserved: account.getFloat('reserved'),
      available: account.getFloat('balance') - account.getFloat('reserved'),
    })
  },
  (e) => {
    e.next()
  },
)

routerAdd(
  'POST',
  '/backend/v1/flex/credit',
  (e) => {
    const auth = e.requestInfo().auth
    if (!auth) {
      return e.json(401, { error: 'Autenticação obrigatória' })
    }
    const body = e.requestInfo().body || {}
    const externalId = String(body.external_id || '')
    const empresaId = String(body.empresa_id || '')
    const filialId = String(body.filial_id || '')
    const rcaId = String(body.rca_id || '')
    const valorFlex = Number(body.valor_flex || 0)
    const tipo = String(body.tipo || 'gerado')

    if (externalId === '' || empresaId === '' || rcaId === '') {
      return e.json(400, { error: 'external_id, empresa_id e rca_id são obrigatórios' })
    }
    if (valorFlex <= 0) {
      return e.json(400, { error: 'valor_flex deve ser positivo' })
    }
    if (tipo !== 'gerado' && tipo !== 'liberado') {
      return e.json(400, { error: "tipo deve ser 'gerado' ou 'liberado'" })
    }

    // Idempotência
    let dup = null
    try {
      dup = e.app.findFirstRecordByFilter('flex_movements', "external_id = '" + externalId + "'")
    } catch (err) {
      dup = null
    }
    if (dup) {
      return e.json(200, { ok: true, idempotent: true, movement_id: dup.id })
    }

    let account = null
    try {
      account = e.app.findFirstRecordByFilter(
        'flex_accounts',
        "empresa_id = '" +
          empresaId +
          "' && filial_id = '" +
          filialId +
          "' && rca_id = '" +
          rcaId +
          "'",
      )
    } catch (err) {
      account = null
    }
    if (!account) {
      account = new Record(e.app.findCollectionByNameOrId('flex_accounts'))
      account.set('empresa_id', empresaId)
      account.set('filial_id', filialId)
      account.set('rca_id', rcaId)
      account.set('balance', 0)
      account.set('reserved', 0)
      e.app.save(account)
    }

    const balanceBefore = account.getFloat('balance')
    account.set('balance', balanceBefore + valorFlex)
    e.app.save(account)

    const movement = new Record(e.app.findCollectionByNameOrId('flex_movements'))
    movement.set('type', tipo === 'liberado' ? 'credito_liberado' : 'credito_gerado')
    movement.set('status', 'efetivado')
    movement.set('external_id', externalId)
    movement.set('empresa_id', empresaId)
    movement.set('filial_id', filialId)
    movement.set('rca_id', rcaId)
    movement.set('rca_name', String(body.rca_name || ''))
    movement.set('gerente_id', String(body.gerente_id || ''))
    movement.set('gerente_name', String(body.gerente_name || ''))
    movement.set('equipe_id', String(body.equipe_id || ''))
    movement.set('equipe_name', String(body.equipe_name || ''))
    movement.set('cliente_id', String(body.cliente_id || ''))
    movement.set('cliente_name', String(body.cliente_name || ''))
    movement.set('produto_id', String(body.produto_id || ''))
    movement.set('produto_descricao', String(body.produto_descricao || ''))
    movement.set('quantidade', Number(body.quantidade || 0))
    movement.set('preco_base', Number(body.preco_base || 0))
    movement.set('preco_negociado', Number(body.preco_negociado || 0))
    movement.set('valor_flex', valorFlex)
    movement.set('pedido_fv', String(body.pedido_fv || ''))
    movement.set('pedido_huram', String(body.pedido_huram || ''))
    movement.set('nf', String(body.nf || ''))
    movement.set('integration_status', 'concluida')
    movement.set('balance_before', balanceBefore)
    movement.set('balance_after', balanceBefore + valorFlex)
    movement.set('reserved_before', account.getFloat('reserved'))
    movement.set('reserved_after', account.getFloat('reserved'))
    movement.set('created_by', auth.id)
    try {
      e.app.save(movement)
    } catch (err) {
      // rollback do balance se o movimento falhar
      account.set('balance', balanceBefore)
      e.app.save(account)
      return e.json(409, { error: 'Movimento já registrado (external_id duplicado)' })
    }

    return e.json(200, {
      ok: true,
      movement_id: movement.id,
      balance: account.getFloat('balance'),
      reserved: account.getFloat('reserved'),
      available: account.getFloat('balance') - account.getFloat('reserved'),
    })
  },
  (e) => {
    e.next()
  },
)

routerAdd(
  'POST',
  '/backend/v1/flex/adjust',
  (e) => {
    const auth = e.requestInfo().auth
    if (!auth) {
      return e.json(401, { error: 'Autenticação obrigatória' })
    }
    const body = e.requestInfo().body || {}
    const empresaId = String(body.empresa_id || '')
    const filialId = String(body.filial_id || '')
    const rcaId = String(body.rca_id || '')
    const valor = Number(body.valor || 0)
    const motivo = String(body.motivo || '')
    const tipoAjuste = String(body.tipo || 'credito') // credito | debito

    if (empresaId === '' || rcaId === '' || motivo === '') {
      return e.json(400, { error: 'empresa_id, rca_id e motivo são obrigatórios' })
    }
    if (valor <= 0) {
      return e.json(400, { error: 'valor deve ser positivo' })
    }

    // Ajuste manual restrito: RCA NUNCA ajusta a própria conta
    const role = auth.getString('role')
    if (role === 'rca') {
      return e.json(403, { error: 'Ajuste manual não permitido para RCA' })
    }

    let account = null
    try {
      account = e.app.findFirstRecordByFilter(
        'flex_accounts',
        "empresa_id = '" +
          empresaId +
          "' && filial_id = '" +
          filialId +
          "' && rca_id = '" +
          rcaId +
          "'",
      )
    } catch (err) {
      account = null
    }
    if (!account) {
      return e.json(404, { error: 'Conta do representante não encontrada' })
    }

    const balanceBefore = account.getFloat('balance')
    const balanceAfter =
      tipoAjuste === 'debito' ? Math.max(0, balanceBefore - valor) : balanceBefore + valor
    account.set('balance', balanceAfter)
    e.app.save(account)

    const movement = new Record(e.app.findCollectionByNameOrId('flex_movements'))
    movement.set('type', 'ajuste')
    movement.set('status', 'efetivado')
    movement.set('external_id', 'ajuste-' + Date.now() + '-' + auth.id)
    movement.set('empresa_id', empresaId)
    movement.set('filial_id', filialId)
    movement.set('rca_id', rcaId)
    movement.set('rca_name', account.getString('rca_name'))
    movement.set('gerente_id', account.getString('gerente_id'))
    movement.set('gerente_name', account.getString('gerente_name'))
    movement.set('equipe_id', account.getString('equipe_id'))
    movement.set('equipe_name', account.getString('equipe_name'))
    movement.set('valor_flex', valor)
    movement.set('integration_status', 'concluida')
    movement.set('reason', motivo)
    movement.set('balance_before', balanceBefore)
    movement.set('balance_after', balanceAfter)
    movement.set('reserved_before', account.getFloat('reserved'))
    movement.set('reserved_after', account.getFloat('reserved'))
    movement.set('created_by', auth.id)
    e.app.save(movement)

    return e.json(200, {
      ok: true,
      movement_id: movement.id,
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      balance: account.getFloat('balance'),
      reserved: account.getFloat('reserved'),
      available: account.getFloat('balance') - account.getFloat('reserved'),
    })
  },
  (e) => {
    e.next()
  },
)

routerAdd(
  'POST',
  '/backend/v1/flex/report-issue',
  (e) => {
    const auth = e.requestInfo().auth
    if (!auth) {
      return e.json(401, { error: 'Autenticação obrigatória' })
    }
    const body = e.requestInfo().body || {}
    const movementId = String(body.movement_id || '')
    const issue = String(body.issue || '')

    if (movementId === '' || issue === '') {
      return e.json(400, { error: 'movement_id e issue são obrigatórios' })
    }

    let movement = null
    try {
      movement = e.app.findRecordById('flex_movements', movementId)
    } catch (err) {
      return e.json(404, { error: 'Movimento não encontrado' })
    }

    movement.set('integration_status', 'falha')
    movement.set('reason', issue)
    e.app.save(movement)

    return e.json(200, { ok: true, movement_id: movementId })
  },
  (e) => {
    e.next()
  },
)
