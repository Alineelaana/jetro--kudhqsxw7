// pocketbase/hooks/collector_guards.js
// Guardas server-side e endpoints do PWA Coletor HURAM (migração 0303)
// Validações backend:
// 1. Verificação de turno aberto para operador
// 2. Multitenancy por empresa_id/filial_id
// 3. Validação de divergência com motivo obrigatório
// 4. Idempotência estrita por idempotency_key
// 5. Trilha em audit_logs
// 6. Endpoint POST /backend/v1/collector/sync-batch para sincronização de fila offline do PWA

// ---------------------------------------------------------------------------
// 1. GUARD: collector_operations (criação)
// ---------------------------------------------------------------------------
onRecordCreateRequest((e) => {
  var authUser = e.auth
  if (!authUser)
    return e.unauthorizedError('Autenticação requerida para registrar operação de coletor.')

  var role = authUser.getString('role') || ''
  var empresaId = authUser.getString('empresa_id') || ''
  var filialId = authUser.getString('filial_id') || ''

  // Escopo de empresa/filial
  if (role !== 'SUP' && empresaId) {
    var recEmpresa = e.record.getString('empresa_id') || ''
    if (recEmpresa && recEmpresa !== empresaId) {
      return e.badRequestError(
        'Operação de coletor não autorizada para empresa diferente da sua sessão.',
      )
    }
    e.record.set('empresa_id', empresaId)
  }
  if (role !== 'SUP' && filialId) {
    var recFilial = e.record.getString('filial_id') || ''
    if (recFilial && recFilial !== filialId) {
      return e.badRequestError(
        'Operação de coletor não autorizada para filial diferente da sua sessão.',
      )
    }
    e.record.set('filial_id', filialId)
  }

  // Idempotency key obrigatória
  var idemp = e.record.getString('idempotency_key') || ''
  if (!idemp) {
    return e.badRequestError(
      'Chave de idempotência (idempotency_key) obrigatória para operação do coletor.',
    )
  }

  // Validar quantidade
  var qtdExec = e.record.getFloat('quantidade_executada')
  if (qtdExec === undefined || qtdExec === null || isNaN(qtdExec) || qtdExec < 0) {
    return e.badRequestError('Quantidade executada inválida (deve ser maior ou igual a zero).')
  }

  // Validar divergência e motivo
  var qtdEsp = e.record.getFloat('quantidade_esperada') || 0
  var div = qtdExec - qtdEsp
  var motivo = e.record.getString('motivo_divergencia') || ''
  if (qtdEsp > 0 && div !== 0 && !motivo) {
    return e.badRequestError(
      'Divergência detectada entre quantidade esperada e executada. Motivo é obrigatório.',
    )
  }

  // Validar se há turno aberto para este operador (exceto superusuário em teste)
  var opId = e.record.getString('operador_id') || authUser.id
  if (!opId) opId = authUser.id
  e.record.set('operador_id', opId)
  if (!e.record.getString('operador_nome')) {
    e.record.set('operador_nome', authUser.getString('name') || authUser.email)
  }

  if (role !== 'SUP') {
    var openShifts = $app.findRecordsByFilter(
      'collector_shifts',
      'operador_id = {:opId} && status = "aberto"',
      '-created',
      1,
      0,
      { opId: opId },
    )
    if (!openShifts || openShifts.length === 0) {
      return e.badRequestError(
        'Operação recusada: Nenhum turno aberto encontrado para este operador. Abra o turno no coletor antes de operar.',
      )
    }
    if (!e.record.getString('shift_id')) {
      e.record.set('shift_id', openShifts[0].id)
    }
  }

  e.next()

  // Após salvar: gravar log de auditoria
  try {
    var auditCol = $app.findCollectionByNameOrId('audit_logs')
    var log = new Record(auditCol)
    log.set('user_id', authUser.id)
    log.set('user_name', authUser.getString('name') || authUser.email)
    log.set('user_role', role)
    log.set('action', 'collector_operation_executed')
    log.set('module', 'wms')
    log.set('target_collection', 'collector_operations')
    log.set('target_id', e.record.id)
    log.set(
      'target_summary',
      'Op: ' +
        e.record.getString('tipo') +
        ' | Doc: ' +
        e.record.getString('documento_referencia') +
        ' | Qtd: ' +
        e.record.getFloat('quantidade_executada'),
    )
    log.set('criticidade', 'Baixa')
    log.set('origem', 'Aplicativo')
    if (empresaId) log.set('empresa', empresaId)
    if (filialId) log.set('filial', filialId)
    $app.save(log)
  } catch (_) {}
}, 'collector_operations')

// ---------------------------------------------------------------------------
// 2. GUARD: collector_shifts (criação e atualização de turnos)
// ---------------------------------------------------------------------------
onRecordCreateRequest((e) => {
  var authUser = e.auth
  if (!authUser) return e.unauthorizedError('Autenticação requerida para abrir turno de coletor.')

  var role = authUser.getString('role') || ''
  var empresaId = authUser.getString('empresa_id') || ''
  var filialId = authUser.getString('filial_id') || ''

  if (role !== 'SUP' && empresaId) e.record.set('empresa_id', empresaId)
  if (role !== 'SUP' && filialId) e.record.set('filial_id', filialId)

  var opId = e.record.getString('operador_id') || authUser.id
  e.record.set('operador_id', opId)
  if (!e.record.getString('operador_nome')) {
    e.record.set('operador_nome', authUser.getString('name') || authUser.email)
  }

  // Não permitir dois turnos abertos simultâneos para o mesmo operador
  if (e.record.getString('status') === 'aberto') {
    var existingOpen = $app.findRecordsByFilter(
      'collector_shifts',
      'operador_id = {:opId} && status = "aberto"',
      '-created',
      1,
      0,
      { opId: opId },
    )
    if (existingOpen && existingOpen.length > 0) {
      return e.badRequestError(
        'Operador já possui um turno aberto (Turno #' +
          existingOpen[0].id +
          '). Feche o turno anterior antes de iniciar outro.',
      )
    }
  }

  e.next()

  // Trilha de auditoria
  try {
    var auditCol = $app.findCollectionByNameOrId('audit_logs')
    var log = new Record(auditCol)
    log.set('user_id', authUser.id)
    log.set('user_name', authUser.getString('name') || authUser.email)
    log.set('action', 'collector_shift_opened')
    log.set('module', 'wms')
    log.set('target_collection', 'collector_shifts')
    log.set('target_id', e.record.id)
    log.set(
      'target_summary',
      'Abertura de turno Coletor: ' + e.record.getString('dispositivo_codigo'),
    )
    log.set('criticidade', 'Baixa')
    log.set('origem', 'Aplicativo')
    if (empresaId) log.set('empresa', empresaId)
    if (filialId) log.set('filial', filialId)
    $app.save(log)
  } catch (_) {}
}, 'collector_shifts')

onRecordUpdateRequest((e) => {
  var authUser = e.auth
  if (!authUser) return e.unauthorizedError('Autenticação requerida.')

  var status = e.record.getString('status') || ''
  var original = e.record.original()
  var prevStatus = original ? original.getString('status') || '' : ''

  if (status === 'fechado' && prevStatus !== 'fechado') {
    if (!e.record.getString('data_fim')) {
      e.record.set('data_fim', new Date().toISOString())
    }
  }

  e.next()

  if (status === 'fechado' && prevStatus !== 'fechado') {
    try {
      var auditCol = $app.findCollectionByNameOrId('audit_logs')
      var log = new Record(auditCol)
      log.set('user_id', authUser.id)
      log.set('user_name', authUser.getString('name') || authUser.email)
      log.set('action', 'collector_shift_closed')
      log.set('module', 'wms')
      log.set('target_collection', 'collector_shifts')
      log.set('target_id', e.record.id)
      log.set(
        'target_summary',
        'Fechamento de turno Coletor: ' + e.record.getString('dispositivo_codigo'),
      )
      log.set('criticidade', 'Baixa')
      log.set('origem', 'Aplicativo')
      $app.save(log)
    } catch (_) {}
  }
}, 'collector_shifts')

// ---------------------------------------------------------------------------
// 3. ENDPOINT OFFLINE BATCH SYNC: POST /backend/v1/collector/sync-batch
//    Recebe lote de operações da fila offline e sincroniza de modo idempotente.
// ---------------------------------------------------------------------------
routerAdd(
  'POST',
  '/backend/v1/collector/sync-batch',
  (e) => {
    try {
      var authUser = e.auth
      if (!authUser)
        return e.unauthorizedError('Autenticação requerida para sincronizar operações.')

      var body = e.requestInfo().body || {}
      var operations = body.operations
      if (!operations || !Array.isArray(operations) || operations.length === 0) {
        return e.badRequestError('Nenhuma operação enviada para sincronização.')
      }

      var role = authUser.getString('role') || ''
      var empresaId = authUser.getString('empresa_id') || ''
      var filialId = authUser.getString('filial_id') || ''

      var opsCol = $app.findCollectionByNameOrId('collector_operations')
      var results = []
      var syncedCount = 0
      var duplicatedCount = 0
      var errorCount = 0

      for (var i = 0; i < operations.length; i++) {
        var op = operations[i]
        var idemp = op.idempotency_key || ''
        if (!idemp) {
          results.push({ index: i, success: false, error: 'idempotency_key ausente' })
          errorCount++
          continue
        }

        // Checar se já existe no banco (idempotência)
        var existing = $app.findRecordsByFilter(
          'collector_operations',
          'idempotency_key = {:idemp}',
          '-created',
          1,
          0,
          { idemp: idemp },
        )
        if (existing && existing.length > 0) {
          results.push({
            index: i,
            idempotency_key: idemp,
            id: existing[0].id,
            status: 'already_synced',
            success: true,
          })
          duplicatedCount++
          continue
        }

        // Criar registro da operação
        try {
          var rec = new Record(opsCol)
          rec.set('tipo', op.tipo || 'separacao')
          rec.set('shift_id', op.shift_id || '')
          rec.set('dispositivo_codigo', op.dispositivo_codigo || '')
          rec.set('operador_id', op.operador_id || authUser.id)
          rec.set('operador_nome', op.operador_nome || authUser.getString('name') || authUser.email)
          rec.set('documento_referencia', op.documento_referencia || '')
          rec.set('produto_id', op.produto_id || '')
          rec.set('produto_codigo', op.produto_codigo || '')
          rec.set('produto_nome', op.produto_nome || '')
          rec.set('codigo_barras_lido', op.codigo_barras_lido || '')
          rec.set('lote', op.lote || '')
          rec.set('validade', op.validade || '')
          rec.set('endereco_origem', op.endereco_origem || '')
          rec.set('endereco_destino', op.endereco_destino || '')
          rec.set('quantidade_esperada', parseFloat(op.quantidade_esperada || 0))
          rec.set('quantidade_executada', parseFloat(op.quantidade_executada || 0))
          rec.set('divergencia', parseFloat(op.divergencia || 0))
          rec.set('motivo_divergencia', op.motivo_divergencia || '')
          rec.set('status', op.status || 'concluido')
          rec.set('idempotency_key', idemp)
          if (op.metadata) rec.set('metadata', op.metadata)
          rec.set('empresa_id', op.empresa_id || empresaId)
          rec.set('filial_id', op.filial_id || filialId)

          $app.save(rec)

          results.push({
            index: i,
            idempotency_key: idemp,
            id: rec.id,
            status: 'synced',
            success: true,
          })
          syncedCount++
        } catch (itemErr) {
          results.push({
            index: i,
            idempotency_key: idemp,
            success: false,
            error: String(itemErr),
          })
          errorCount++
        }
      }

      // Auditoria resumida da sincronização em lote
      try {
        var auditCol = $app.findCollectionByNameOrId('audit_logs')
        var log = new Record(auditCol)
        log.set('user_id', authUser.id)
        log.set('user_name', authUser.getString('name') || authUser.email)
        log.set('action', 'collector_batch_synced')
        log.set('module', 'wms')
        log.set('target_collection', 'collector_operations')
        log.set(
          'target_summary',
          'Sincronização em lote: ' +
            syncedCount +
            ' novas, ' +
            duplicatedCount +
            ' deduplicadas, ' +
            errorCount +
            ' erros',
        )
        log.set('criticidade', 'Baixa')
        log.set('origem', 'Aplicativo')
        if (empresaId) log.set('empresa', empresaId)
        if (filialId) log.set('filial', filialId)
        $app.save(log)
      } catch (_) {}

      return e.json(200, {
        ok: true,
        total: operations.length,
        synced: syncedCount,
        deduplicated: duplicatedCount,
        errors: errorCount,
        results: results,
      })
    } catch (batchErr) {
      $app.logger().error('collector sync-batch failed', 'error', String(batchErr))
      return e.json(500, { error: 'Falha interna na sincronização do coletor' })
    }
  },
  $apis.requireAuth(),
)
