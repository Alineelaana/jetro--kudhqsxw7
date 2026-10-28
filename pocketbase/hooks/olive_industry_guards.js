// pocketbase/hooks/olive_industry_guards.js
// Guardas server-side do Módulo Industrial de Azeitonas HURAM (migração 0300)
// Validações backend: fechamento de ticket sem classificação, faixas plausíveis de pH/sal,
// status do tanque para processamento, pagamento único do produtor e bloqueio de liberação por laudo.

// ---------------------------------------------------------------------------
// 1. TICKET DE SAFRA — não fecha sem classificação; calcula pagamento
// ---------------------------------------------------------------------------
onRecordUpdateRequest((e) => {
  var status = e.record.getString('status') || ''
  var grade = e.record.getString('quality_grade') || ''
  var pricePerTon = e.record.getFloat('price_per_ton') || 0
  var netKg = e.record.getFloat('net_weight_kg') || 0
  var payable = e.record.getFloat('final_payable_amount') || 0
  var original = e.record.original()
  var prevStatus = original ? original.getString('status') || '' : ''

  if (status === 'fechado') {
    if (prevStatus === 'fechado') return e.next()
    if (!grade) {
      return e.badRequestError(
        'Ticket não pode ser fechado sem classificação da fruta por grade de qualidade (calibre/maturação/defeitos).',
      )
    }
    if (grade !== 'DESCARTE' && pricePerTon <= 0) {
      return e.badRequestError('Ticket não pode ser fechado sem preço por tonelada da grade.')
    }
    if (netKg <= 0) {
      return e.badRequestError('Ticket não pode ser fechado sem peso líquido válido.')
    }
    if (payable <= 0 && grade !== 'DESCARTE') {
      return e.badRequestError(
        'Ticket não pode ser fechado sem valor a pagar ao produtor calculado.',
      )
    }
  }

  if (status === 'cancelado' && prevStatus === 'fechado') {
    return e.badRequestError(
      'Ticket já fechado não pode ser cancelado. Estorne por processo próprio.',
    )
  }

  // Regrava valor a pagar em caso de reclassificação: líquido × preço da grade − deduções
  if (status === 'classificado' && grade && grade !== 'DESCARTE' && netKg > 0 && pricePerTon > 0) {
    var calc = (netKg / 1000) * pricePerTon - (e.record.getFloat('deductions_amount') || 0)
    if (calc !== payable) {
      e.record.set('final_payable_amount', parseFloat(calc.toFixed(2)))
    }
  }

  e.next()
}, 'olive_harvest_tickets')

onRecordCreateRequest((e) => {
  if (e.record.getString('status') === 'fechado') {
    var grade = e.record.getString('quality_grade') || ''
    if (!grade) {
      return e.badRequestError(
        'Ticket não pode nascer fechado sem classificação por grade de qualidade.',
      )
    }
  }
  e.next()
}, 'olive_harvest_tickets')

// ---------------------------------------------------------------------------
// 2. MEDIÇÃO DE TANQUE — faixas plausíveis de pH/sal geram alerta
// ---------------------------------------------------------------------------
onRecordCreateRequest((e) => {
  var ph = e.record.getFloat('ph') || 0
  var salt = e.record.getFloat('salt_concentration_percent') || 0
  var temp = e.record.getFloat('temperature_celsius') || 0
  var alerts = []

  if (ph <= 0 || ph > 14) {
    alerts.push('pH fora de faixa plausível (0 a 14): ' + ph)
  } else if (ph > 5.0) {
    alerts.push('pH acima do limite típico de salmoura em cura (até 5.0): ' + ph)
  } else if (ph < 2.5) {
    alerts.push('pH abaixo do limite típico de salmoura em cura (mínimo 2.5): ' + ph)
  }

  if (salt < 0 || salt > 25) {
    alerts.push('Concentração de sal fora de faixa plausível (0% a 25%): ' + salt + '%')
  } else if (salt < 4) {
    alerts.push('Concentração de sal abaixo do mínimo recomendado para cura (4%): ' + salt + '%')
  }

  if (temp < 0 || temp > 60) {
    alerts.push('Temperatura fora de faixa plausível (0°C a 60°C): ' + temp + '°C')
  } else if (temp > 35) {
    alerts.push('Temperatura alta para fermentação controlada (ideal 18°C a 30°C): ' + temp + '°C')
  }

  if (alerts.length > 0) {
    e.record.set('alert_raised', true)
    e.record.set('alert_reason', alerts.join(' | '))
  } else {
    e.record.set('alert_raised', false)
    e.record.set('alert_reason', '')
  }

  e.next()
}, 'curing_measurements')

// ---------------------------------------------------------------------------
// 3. LOTE DE CURA — status do tanque controla transições
// ---------------------------------------------------------------------------
onRecordUpdateRequest((e) => {
  var batchStatus = e.record.getString('status') || ''
  var original = e.record.original()
  var prevBatchStatus = original ? original.getString('status') || '' : ''
  if (batchStatus === prevBatchStatus) return e.next()

  if (batchStatus === 'processado') {
    if (prevBatchStatus !== 'pronto_para_processamento') {
      return e.badRequestError(
        'Lote só pode ser processado quando o tanque estiver em status "pronto_para_processamento" (status atual: ' +
          (prevBatchStatus || 'vazio') +
          ').',
      )
    }
    var tankId = e.record.getString('tank_id') || ''
    if (tankId) {
      try {
        var tank = $app.findRecordById('curing_tanks', tankId)
        var tankStatus = tank.getString('current_status') || ''
        if (tankStatus !== 'pronto_para_processamento' && tankStatus !== 'em_processamento') {
          return e.badRequestError(
            'Tanque ' +
              tank.getString('code') +
              ' não permite processamento (status atual: ' +
              tankStatus +
              ').',
          )
        }
      } catch (_) {}
    }
  }

  if (batchStatus === 'descartado' && prevBatchStatus === 'processado') {
    return e.badRequestError('Lote já processado não pode ser descartado retroativamente.')
  }

  e.next()
}, 'curing_batches')

// ---------------------------------------------------------------------------
// 4. ANÁLISE LABORATORIAL — resultado fora de especificação bloqueia liberação
// ---------------------------------------------------------------------------
onRecordCreateRequest((e) => {
  var compliance = e.record.getString('overall_compliance') || ''
  if (compliance === 'nao_conforme') {
    e.record.set('batch_release_authorized', false)
  }
  e.next()
}, 'laboratory_analyses')

onRecordUpdateRequest((e) => {
  var compliance = e.record.getString('overall_compliance') || ''
  var wantsRelease = Boolean(e.record.get('batch_release_authorized'))
  var original = e.record.original()
  var prevRelease = original ? Boolean(original.get('batch_release_authorized')) : false

  if (wantsRelease && compliance === 'nao_conforme') {
    return e.badRequestError(
      'Laudo NÃO CONFORME bloqueia liberação do lote para faturamento. Trate a não conformidade antes de liberar.',
    )
  }
  if (wantsRelease && compliance === 'em_analise') {
    return e.badRequestError(
      'Análise ainda "em_analise": conclua o veredito antes de liberar o lote.',
    )
  }
  if (!wantsRelease && prevRelease && compliance === 'nao_conforme') {
    // Revogação coerente
    e.record.set('batch_release_authorized', false)
  }
  e.next()
}, 'laboratory_analyses')

// ---------------------------------------------------------------------------
// 5. LAUDO TÉCNICO — veredito coerente com análise vinculada
// ---------------------------------------------------------------------------
onRecordCreateRequest((e) => {
  var verdict = e.record.getString('verdict') || ''
  var analysisId = e.record.getString('analysis_id') || ''
  if (verdict === 'liberado' && analysisId) {
    try {
      var analysis = $app.findRecordById('laboratory_analyses', analysisId)
      var compliance = analysis.getString('overall_compliance') || ''
      if (compliance === 'nao_conforme' || compliance === 'em_analise') {
        return e.badRequestError(
          'Laudo de liberação exige análise CONFORME. Análise vinculada está em "' +
            compliance +
            '".',
        )
      }
    } catch (_) {}
  }
  e.next()
}, 'laboratory_laudos')

// ---------------------------------------------------------------------------
// 6. PAGAMENTO DO PRODUTOR — gera título em contas a pagar UMA ÚNICA VEZ
//    POST /backend/v1/olive/harvest-ticket/pay
// ---------------------------------------------------------------------------
routerAdd(
  'POST',
  '/backend/v1/olive/harvest-ticket/pay',
  (e) => {
    try {
      var authUser = e.auth
      if (!authUser) return e.unauthorizedError('auth required')

      var body = e.requestInfo().body || {}
      var ticketId = body.ticket_id || ''
      if (!ticketId) return e.badRequestError('ticket_id required')

      var ticket = $app.findRecordById('olive_harvest_tickets', ticketId)
      var status = ticket.getString('status') || ''
      if (status !== 'fechado') {
        return e.badRequestError(
          'Só é possível gerar pagamento para ticket fechado (status: ' + status + ').',
        )
      }
      if (
        ticket.getString('payment_status') === 'titulo_gerado' ||
        ticket.getString('payment_status') === 'pago'
      ) {
        return e.badRequestError(
          'Pagamento do produtor já gerado para este ticket (unicidade garantida).',
        )
      }
      if (ticket.getString('financial_payable_id')) {
        return e.badRequestError('Título de contas a pagar já vinculado a este ticket.')
      }

      var producerId = ticket.getString('producer_id') || ''
      var producerName = 'Produtor'
      try {
        var producer = $app.findRecordById('agricultural_producers', producerId)
        producerName =
          producer.getString('name') || producer.getString('property_name') || 'Produtor'
      } catch (_) {}

      var payablesCol = $app.findCollectionByNameOrId('financial_payables')
      var payable = new Record(payablesCol)
      payable.set('numero_titulo', 'SAFRA-' + ticket.getString('ticket_number'))
      payable.set('fornecedor', producerName)
      payable.set('documento_origem', 'ticket_safra/' + ticketId)
      payable.set('numero_nota_fiscal', ticket.getString('ticket_number'))
      payable.set('data_emissao', new Date().toISOString())
      payable.set('data_competencia', new Date().toISOString())
      payable.set('data_vencimento', body.data_vencimento || new Date().toISOString())
      payable.set('valor_original', String(ticket.getFloat('final_payable_amount') || 0))
      payable.set('valor_atualizado', String(ticket.getFloat('final_payable_amount') || 0))
      payable.set('status', 'aberto')
      payable.set('centro_custo', 'Recebimento de Safra')
      payable.set(
        'observacoes',
        'Título gerado automaticamente pelo Recebimento de Safra (grade ' +
          ticket.getString('quality_grade') +
          ', líquido ' +
          ticket.getFloat('net_weight_kg') +
          ' kg, R$/t ' +
          ticket.getFloat('price_per_ton') +
          ', deduções R$ ' +
          ticket.getFloat('deductions_amount') +
          ').',
      )
      if (ticket.getString('empresa_id')) payable.set('empresa', ticket.getString('empresa_id'))
      if (ticket.getString('filial_id')) payable.set('filial', ticket.getString('filial_id'))
      $app.save(payable)

      ticket.set('financial_payable_id', payable.id)
      ticket.set('payment_status', 'titulo_gerado')
      $app.save(ticket)

      try {
        var auditCol = $app.findCollectionByNameOrId('audit_logs')
        var log = new Record(auditCol)
        log.set('user_id', authUser.id)
        log.set('user_name', authUser.getString('name') || authUser.email)
        log.set('action', 'olive_harvest_payment_generated')
        log.set('module', 'industrial')
        log.set('target_collection', 'olive_harvest_tickets')
        log.set('target_id', ticketId)
        log.set(
          'target_summary',
          'Título ' + payable.id + ' | R$ ' + ticket.getFloat('final_payable_amount'),
        )
        $app.save(log)
      } catch (_) {}

      return e.json(200, {
        ok: true,
        payable_id: payable.id,
        valor: ticket.getFloat('final_payable_amount'),
        payment_status: 'titulo_gerado',
      })
    } catch (err) {
      $app.logger().error('olive harvest payment failed', 'error', String(err))
      return e.json(500, { error: 'Falha ao gerar pagamento do produtor' })
    }
  },
  $apis.requireAuth(),
)

// ---------------------------------------------------------------------------
// 7. ENTRADA DE MATÉRIA-PRIMA POR SAFRA — cria movimentação de estoque +
//    alimenta a trilha imutável product_cost_history pelo custo da grade.
//    POST /backend/v1/olive/harvest-ticket/stock-in
// ---------------------------------------------------------------------------
routerAdd(
  'POST',
  '/backend/v1/olive/harvest-ticket/stock-in',
  (e) => {
    try {
      var authUser = e.auth
      if (!authUser) return e.unauthorizedError('auth required')

      var body = e.requestInfo().body || {}
      var ticketId = body.ticket_id || ''
      if (!ticketId) return e.badRequestError('ticket_id required')

      var ticket = $app.findRecordById('olive_harvest_tickets', ticketId)
      if (ticket.getString('status') !== 'fechado') {
        return e.badRequestError('Só é possível gerar estoque para ticket fechado.')
      }
      if (ticket.getString('stock_lot_number')) {
        return e.badRequestError(
          'Entrada de estoque já gerada para este ticket (lote ' +
            ticket.getString('stock_lot_number') +
            ').',
        )
      }

      var productId = ticket.getString('raw_material_product_id') || body.product_id || ''
      if (!productId) return e.badRequestError('Produto de matéria-prima não vinculado ao ticket.')

      var prod
      try {
        prod = $app.findRecordById('products', productId)
      } catch (_) {
        return e.badRequestError('Produto de matéria-prima inexistente.')
      }

      var netKg = ticket.getFloat('net_weight_kg') || 0
      if (netKg <= 0) return e.badRequestError('Peso líquido inválido para entrada de estoque.')

      // Custo da grade: preço por tonelada convertido para custo por kg (trilha imutável)
      var gradeCostPerTon = ticket.getFloat('price_per_ton') || 0
      var gradeCostPerKg = gradeCostPerTon / 1000
      var lotNumber = 'SAFRA-' + ticket.getString('ticket_number')

      var movCol = $app.findCollectionByNameOrId('stock_movements')
      var mov = new Record(movCol)
      mov.set('product_id', productId)
      mov.set('tipo', 'entrada')
      mov.set('quantidade', netKg)
      mov.set('custo_unitario', gradeCostPerKg.toFixed(4))
      mov.set('custo_total', (netKg * gradeCostPerKg).toFixed(2))
      mov.set('documento_origem', 'ticket_safra/' + ticketId)
      mov.set('lote', lotNumber)
      mov.set('motivo', 'Recebimento de Safra — grade ' + ticket.getString('quality_grade'))
      if (ticket.getString('empresa_id')) mov.set('empresa', ticket.getString('empresa_id'))
      $app.save(mov)

      // Entrada física direta no saldo do produto (fonte oficial de custo mantida pelo motor de estoque)
      var saldoAtual = prod.getInt('stock') || 0
      var novoSaldo = saldoAtual + Math.round(netKg)
      prod.set('stock', novoSaldo)
      $app.save(prod)

      // Trilha imutável: custo da safra por grade alimenta product_cost_history
      try {
        var histCol = $app.findCollectionByNameOrId('product_cost_history')
        var hist = new Record(histCol)
        hist.set('product', productId)
        if (ticket.getString('empresa_id')) hist.set('empresa', ticket.getString('empresa_id'))
        hist.set('data_hora', new Date().toISOString())
        hist.set('origem', 'safra_entry')
        hist.set('documento_referencia', 'ticket_safra/' + ticketId)
        hist.set('metodo', 'last_entry')
        hist.set('custo_anterior', parseFloat(prod.getString('cost_average') || '0') || 0)
        hist.set('custo_novo', gradeCostPerKg)
        hist.set('quantidade_entrada', netKg)
        hist.set('saldo_apos', novoSaldo)
        hist.set('composicao', {
          motivo: 'Entrada de matéria-prima por Recebimento de Safra',
          grade: ticket.getString('quality_grade'),
          preco_por_tonelada: gradeCostPerTon,
          preco_por_kg: gradeCostPerKg,
          peso_liquido_kg: netKg,
          ticket_number: ticket.getString('ticket_number'),
          nota: 'Custo da safra por grade — sem duplicidade com NF-e de entrada.',
        })
        if (e.auth) hist.set('usuario', e.auth.id)
        $app.save(hist)
      } catch (histErr) {
        $app
          .logger()
          .error('Falha ao gravar product_cost_history da safra', 'error', String(histErr))
      }

      ticket.set('stock_lot_number', lotNumber)
      ticket.set('stock_movement_id', mov.id)
      $app.save(ticket)

      return e.json(200, {
        ok: true,
        lot_number: lotNumber,
        movement_id: mov.id,
        quantidade: netKg,
        custo_unitario_por_kg: parseFloat(gradeCostPerKg.toFixed(4)),
      })
    } catch (err) {
      $app.logger().error('olive harvest stock-in failed', 'error', String(err))
      return e.json(500, { error: 'Falha ao gerar entrada de estoque do ticket de safra' })
    }
  },
  $apis.requireAuth(),
)

// ---------------------------------------------------------------------------
// 8. FECHAMENTO/CONCLUSÃO DO TANQUE — transfere lote para consumo pelas OPs
//    POST /backend/v1/olive/curing-batch/complete
// ---------------------------------------------------------------------------
routerAdd(
  'POST',
  '/backend/v1/olive/curing-batch/complete',
  (e) => {
    try {
      var authUser = e.auth
      if (!authUser) return e.unauthorizedError('auth required')

      var body = e.requestInfo().body || {}
      var batchId = body.batch_id || ''
      if (!batchId) return e.badRequestError('batch_id required')

      var batch = $app.findRecordById('curing_batches', batchId)
      if (batch.getString('status') !== 'em_cura') {
        return e.badRequestError(
          'Lote não está em cura (status: ' + batch.getString('status') + ').',
        )
      }

      var tankId = batch.getString('tank_id') || ''
      if (!tankId) return e.badRequestError('Lote sem tanque vinculado.')
      var tank = $app.findRecordById('curing_tanks', tankId)

      // Medição obrigatória recente antes de liberar para processamento
      var measurements = []
      try {
        measurements = $app.findRecordsByFilter(
          'curing_measurements',
          'batch_id = "' + batchId + '"',
          '-measurement_date',
          1,
          0,
        )
      } catch (_) {}
      if (measurements.length === 0) {
        return e.badRequestError(
          'Conclusão exige ao menos uma medição registrada (sal/pH/temperatura).',
        )
      }

      var last = measurements[0]
      var ph = last.getFloat('ph') || 0
      if (ph <= 0 || ph > 5.0) {
        return e.badRequestError(
          'Última medição com pH ' +
            ph +
            ' fora da faixa de cura concluída (2.5 a 5.0). Ajuste a salmoura antes de liberar.',
        )
      }

      // Peso final considerando perdas de fermentação registradas nas medições
      var initialKg = batch.getFloat('initial_weight_kg') || 0
      var lossesKg = batch.getFloat('fermentation_loss_kg') || 0
      var finalKg = batch.getFloat('current_weight_kg') || Math.max(initialKg - lossesKg, 0)

      batch.set('status', 'pronto_para_processamento')
      batch.set('actual_completion_date', new Date().toISOString())
      batch.set('current_weight_kg', finalKg)
      $app.save(batch)

      tank.set('current_status', 'pronto_para_processamento')
      tank.set('current_batch_id', batchId)
      $app.save(tank)

      // Elo agrícola na cadeia de rastreabilidade existente (aditivo)
      try {
        var ticketId = batch.getString('harvest_ticket_id') || ''
        var traceCol = $app.findCollectionByNameOrId('industrial_traceability')
        var trace = new Record(traceCol)
        trace.set('product_id', batch.getString('raw_material_product_id') || '')
        trace.set(
          'lot_number',
          'TANQUE-' + tank.getString('code') + '-' + batch.getString('batch_code'),
        )
        trace.set('direction', 'entrada')
        trace.set('quantity', finalKg)
        trace.set('timestamp', new Date().toISOString())
        trace.set('notes', 'Lote de cura concluído no tanque ' + tank.getString('code'))
        if (ticketId) {
          try {
            var ticket = $app.findRecordById('olive_harvest_tickets', ticketId)
            trace.set('producer_id', ticket.getString('producer_id') || '')
            trace.set('harvest_ticket_id', ticketId)
            trace.set('raw_material_id', ticket.getString('raw_material_product_id') || '')
          } catch (_) {}
        }
        trace.set('curing_tank_id', tankId)
        trace.set('curing_batch_id', batchId)
        trace.set('empresa_id', batch.getString('empresa_id') || '')
        $app.save(trace)
      } catch (traceErr) {
        $app
          .logger()
          .error('Falha ao registrar elo de rastreabilidade do tanque', 'error', String(traceErr))
      }

      try {
        var auditCol2 = $app.findCollectionByNameOrId('audit_logs')
        var log2 = new Record(auditCol2)
        log2.set('user_id', authUser.id)
        log2.set('user_name', authUser.getString('name') || authUser.email)
        log2.set('action', 'olive_curing_batch_completed')
        log2.set('module', 'industrial')
        log2.set('target_collection', 'curing_batches')
        log2.set('target_id', batchId)
        log2.set(
          'target_summary',
          'Tanque ' + tank.getString('code') + ' pronto para processamento (' + finalKg + ' kg)',
        )
        $app.save(log2)
      } catch (_) {}

      return e.json(200, {
        ok: true,
        status: 'pronto_para_processamento',
        final_weight_kg: finalKg,
        tank_code: tank.getString('code'),
      })
    } catch (err) {
      $app.logger().error('olive curing batch complete failed', 'error', String(err))
      return e.json(500, { error: 'Falha ao concluir lote de cura' })
    }
  },
  $apis.requireAuth(),
)

// ---------------------------------------------------------------------------
// 9. CONSUMO DO TANQUE PELA ORDEM DE PRODUÇÃO — fecha tanque e vincula OP
//    POST /backend/v1/olive/curing-batch/consume
// ---------------------------------------------------------------------------
routerAdd(
  'POST',
  '/backend/v1/olive/curing-batch/consume',
  (e) => {
    try {
      var authUser = e.auth
      if (!authUser) return e.unauthorizedError('auth required')

      var body = e.requestInfo().body || {}
      var batchId = body.batch_id || ''
      var orderId = body.production_order_id || ''
      if (!batchId || !orderId)
        return e.badRequestError('batch_id and production_order_id required')

      var batch = $app.findRecordById('curing_batches', batchId)
      if (batch.getString('status') !== 'pronto_para_processamento') {
        return e.badRequestError(
          'Lote não está pronto para processamento (status: ' + batch.getString('status') + ').',
        )
      }

      var order
      try {
        order = $app.findRecordById('production_orders', orderId)
      } catch (_) {
        return e.badRequestError('Ordem de produção inexistente.')
      }

      batch.set('status', 'processado')
      batch.set('destination_production_order_id', orderId)
      $app.save(batch)

      var tankId = batch.getString('tank_id') || ''
      if (tankId) {
        var tank2 = $app.findRecordById('curing_tanks', tankId)
        tank2.set('current_status', 'higienizacao')
        tank2.set('current_batch_id', '')
        $app.save(tank2)
      }

      try {
        order.set('curing_batch_id', batchId)
        order.set('curing_tank_id', batch.getString('tank_id') || '')
        order.set('harvest_ticket_id', batch.getString('harvest_ticket_id') || '')
        $app.save(order)
      } catch (_) {}

      return e.json(200, { ok: true, order_id: orderId, batch_status: 'processado' })
    } catch (err) {
      $app.logger().error('olive curing batch consume failed', 'error', String(err))
      return e.json(500, { error: 'Falha ao consumir lote de cura pela ordem' })
    }
  },
  $apis.requireAuth(),
)
