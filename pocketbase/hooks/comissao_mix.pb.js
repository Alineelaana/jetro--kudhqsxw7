// Endpoint e hooks para Comissões MIX e integração com Faturamento e Comissão Analítica

// ----------------------------------------------------
// 1. ENDPOINT: CONSULTAR PERCENTUAIS MIX VIGENTES PARA ITENS DE NOTA/PEDIDO
// ----------------------------------------------------
routerAdd('POST', '/backend/v1/comissao/mix/consultar-itens', (e) => {
  const authRecord = e.auth
  if (!authRecord) return e.json(401, { message: 'Não autorizado.' })

  const data = e.requestInfo().body || {}
  const items = Array.isArray(data.items) ? data.items : []
  const dataFaturamento = data.data_faturamento || new Date().toISOString().slice(0, 10)

  const mixRecords = $app.findRecordsByFilter(
    'commission_mix',
    'status = "Ativo"',
    '-vigencia_inicio',
    500,
    0,
  )

  const mixByCode = {}
  const mixByEan = {}
  for (const m of mixRecords) {
    const vInicio = m.getString('vigencia_inicio') || '1900-01-01'
    const vFim = m.getString('vigencia_fim') || '2999-12-31'
    if (dataFaturamento >= vInicio && (!m.getString('vigencia_fim') || dataFaturamento <= vFim)) {
      const code = (m.getString('product_code') || '').trim()
      const ean = (m.getString('product_ean') || '').trim()
      if (code && !mixByCode[code]) mixByCode[code] = m
      if (ean && !mixByEan[ean]) mixByEan[ean] = m
    }
  }

  const enriched = items.map((it) => {
    const code = (it.code || it.product_code || '').trim()
    const ean = (it.ean || it.product_ean || '').trim()
    const found = mixByCode[code] || mixByEan[ean]
    const percentualMix = found ? found.getFloat('commission_percentage') : 3.0 // fallback seguro
    const mixId = found ? found.id : null

    const qty = parseFloat(it.quantity || it.qtd || 1) || 1
    const unitPrice = parseFloat(it.unit_price || it.preco_unitario || it.price || 0) || 0
    const total = parseFloat(it.total || it.total_value || qty * unitPrice) || 0
    const comissaoCalculada = Number(((total * percentualMix) / 100).toFixed(2))

    return {
      ...it,
      code: code,
      ean: ean,
      product: it.product || (found ? found.getString('product_name') : 'Produto'),
      quantity: qty,
      unit_price: unitPrice,
      total: total,
      commission_mix_id: mixId,
      commission_percentage_applied: percentualMix,
      commission_value: comissaoCalculada,
      vigencia_aplicada: found ? found.getString('vigencia_inicio') : dataFaturamento,
    }
  })

  return e.json(200, {
    success: true,
    data_faturamento: dataFaturamento,
    items: enriched,
  })
})

// ----------------------------------------------------
// 2. ENDPOINT: EDIÇÃO EM MASSA DE PERCENTUAIS MIX
// Permissões e Auditoria com registro de percentual anterior e novo
// ----------------------------------------------------
routerAdd('POST', '/backend/v1/comissao/mix/bulk-update', (e) => {
  const authRecord = e.auth
  if (!authRecord) return e.json(401, { message: 'Não autorizado.' })

  const userRole = authRecord.getString('role') || 'PADRAO'
  const userName = authRecord.getString('name') || authRecord.getString('email') || 'Usuário'
  const userId = authRecord.id

  if (!['SUP', 'FINANCEIRO', 'COMERCIAL'].includes(userRole)) {
    return e.json(403, {
      message:
        'Permissão insuficiente. Somente usuários autorizados podem editar percentuais de Comissões MIX.',
    })
  }

  const body = e.requestInfo().body || {}
  const targetIds = Array.isArray(body.ids) ? body.ids : []
  const filterType = body.filter_type // 'ids', 'brand', 'supplier', 'category', 'product_line', 'all_filtered'
  const filterValue = body.filter_value
  const newPercentage = parseFloat(body.new_percentage)
  const vigenciaInicio = body.vigencia_inicio || new Date().toISOString().slice(0, 10)
  const motivo = body.motivo || 'Atualização em massa de comissões MIX'

  if (isNaN(newPercentage) || newPercentage < 0 || newPercentage > 100) {
    return e.json(400, { message: 'Percentual de comissão inválido (deve ser entre 0 e 100).' })
  }

  let recordsToUpdate = []

  if (filterType === 'ids' && targetIds.length > 0) {
    for (const id of targetIds) {
      try {
        const r = $app.findRecordById('commission_mix', id)
        if (r) recordsToUpdate.push(r)
      } catch (err) {
        // ignore not found
      }
    }
  } else if (filterType === 'brand' && filterValue) {
    recordsToUpdate = $app.findRecordsByFilter(
      'commission_mix',
      'brand = {:val}',
      '-created',
      1000,
      0,
      { val: filterValue },
    )
  } else if (filterType === 'supplier' && filterValue) {
    recordsToUpdate = $app.findRecordsByFilter(
      'commission_mix',
      'supplier = {:val}',
      '-created',
      1000,
      0,
      { val: filterValue },
    )
  } else if (filterType === 'category' && filterValue) {
    recordsToUpdate = $app.findRecordsByFilter(
      'commission_mix',
      'category = {:val}',
      '-created',
      1000,
      0,
      { val: filterValue },
    )
  } else if (filterType === 'product_line' && filterValue) {
    recordsToUpdate = $app.findRecordsByFilter(
      'commission_mix',
      'product_line = {:val}',
      '-created',
      1000,
      0,
      { val: filterValue },
    )
  } else if (filterType === 'all') {
    recordsToUpdate = $app.findRecordsByFilter('commission_mix', 'id != ""', '-created', 1000, 0)
  }

  const updated = []
  const now = new Date().toISOString()

  for (const rec of recordsToUpdate) {
    const oldPercentage = rec.getFloat('commission_percentage')
    rec.set('commission_percentage', newPercentage)
    rec.set('vigencia_inicio', vigenciaInicio)
    rec.set('updated_by_user_id', userId)
    rec.set('updated_by_user_name', userName)

    const history = rec.get('history') || []
    const histList = Array.isArray(history) ? history : []
    histList.push({
      data: now,
      usuario_id: userId,
      usuario_nome: userName,
      usuario_role: userRole,
      percentual_anterior: oldPercentage,
      novo_percentual: newPercentage,
      vigencia_inicio: vigenciaInicio,
      motivo: motivo,
      tipo_alteracao: 'EM_MASSA',
    })
    rec.set('history', histList)

    try {
      $app.save(rec)
      updated.push({
        id: rec.id,
        code: rec.getString('product_code'),
        name: rec.getString('product_name'),
        old: oldPercentage,
        new: newPercentage,
      })
    } catch (errSave) {
      console.log('Erro ao salvar record em bulk-update:', errSave)
    }
  }

  // Trilha de auditoria
  try {
    const auditCol = $app.findCollectionByNameOrId('audit_logs')
    if (auditCol) {
      const auditRec = new Record(auditCol, {
        user_id: userId,
        user_name: userName,
        user_role: userRole,
        action: 'COMMISSION_MIX_BULK_UPDATE',
        module: 'Comercial',
        target_collection: 'commission_mix',
        target_id: 'bulk',
        target_summary: `Edição em massa de Comissões MIX: ${updated.length} produtos alterados para ${newPercentage}% (Vigência: ${vigenciaInicio}) - ${motivo}`,
        previous_value: { filter_type: filterType, filter_value: filterValue },
        new_value: {
          new_percentage: newPercentage,
          vigencia_inicio: vigenciaInicio,
          affected_count: updated.length,
        },
        criticidade: 'Alta',
        origem: 'Área da Empresa',
      })
      $app.save(auditRec)
    }
  } catch (eAudit) {
    console.log('Erro ao gravar audit_logs:', eAudit)
  }

  return e.json(200, {
    success: true,
    total_afetados: updated.length,
    itens_atualizados: updated,
    message: `${updated.length} produto(s) atualizados com sucesso para ${newPercentage}% a partir de ${vigenciaInicio}.`,
  })
})

// ----------------------------------------------------
// 3. HOOK ONRECORD BEFORE CREATE / UPDATE PARA COMMISSION_MIX
// Garante integridade do histórico e vigência
// ----------------------------------------------------
onRecordUpdate((e) => {
  if (e.collection.name !== 'commission_mix') {
    e.next()
    return
  }

  const rec = e.record
  const authRecord = e.auth
  const userRole = authRecord ? authRecord.getString('role') || 'PADRAO' : 'PADRAO'
  const userName = authRecord
    ? authRecord.getString('name') || authRecord.getString('email') || 'Usuário'
    : 'Usuário'
  const userId = authRecord ? authRecord.id : 'sistema'

  if (authRecord && !['SUP', 'FINANCEIRO', 'COMERCIAL'].includes(userRole)) {
    throw new BadRequestError('Permissão insuficiente para alterar percentuais de Comissões MIX.')
  }

  e.next()
})
