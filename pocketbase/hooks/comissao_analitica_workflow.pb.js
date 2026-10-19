// Endpoint e regras backend para apuração e fechamento de Comissão Analítica

routerAdd('POST', '/backend/v1/comissao-analitica/status-update', (e) => {
  const authRecord = e.auth
  if (!authRecord) {
    return e.json(401, { message: 'Não autorizado. Faça login.' })
  }

  const reqInfo = e.requestInfo()
  const data = reqInfo.body || {}
  const apurationId = data.apuration_id
  const newStatus = data.new_status
  const justificativa = data.justificativa || ''

  if (!apurationId || !newStatus) {
    return e.json(400, { message: 'apuration_id e new_status são obrigatórios.' })
  }

  const validStatuses = ['nao_apurada', 'em_conferencia', 'apurada', 'aprovada', 'paga', 'reaberta']
  if (!validStatuses.includes(newStatus)) {
    return e.json(400, { message: 'Status inválido informado: ' + newStatus })
  }

  // Validação de alçada de segurança
  const role = authRecord.getString('role')
  const userName = authRecord.getString('name') || authRecord.getString('email') || 'Usuário'

  if (newStatus === 'aprovada' && !['SUP', 'FINANCEIRO', 'COMERCIAL'].includes(role)) {
    return e.json(403, { message: 'Permissão insuficiente para aprovar comissão.' })
  }

  if (newStatus === 'paga' && !['SUP', 'FINANCEIRO'].includes(role)) {
    return e.json(403, { message: 'Apenas Financeiro ou Master podem marcar comissão como paga.' })
  }

  if (newStatus === 'reaberta' && !['SUP', 'FINANCEIRO'].includes(role)) {
    return e.json(403, { message: 'Apenas Financeiro ou Master podem reabrir apurações fechadas.' })
  }

  if (newStatus === 'reaberta' && !justificativa.trim()) {
    return e.json(400, {
      message: 'A reabertura de apuração exige justificativa formal para auditoria.',
    })
  }

  try {
    const record = $app.findRecordById('commission_apurations', apurationId)
    const oldStatus = record.getString('situacao')
    record.set('situacao', newStatus)

    const now = new Date().toISOString()
    const historico = record.get('historico') || []
    const histList = Array.isArray(historico) ? historico : []

    histList.push({
      status_anterior: oldStatus,
      status_novo: newStatus,
      usuario_id: authRecord.id,
      usuario_nome: userName,
      data: now,
      justificativa: justificativa,
    })
    record.set('historico', histList)

    if (newStatus === 'aprovada') {
      record.set('aprovado_por', userName)
      record.set('aprovado_em', now)
    } else if (newStatus === 'paga') {
      record.set('pago_por', userName)
      record.set('pago_em', now)
    } else if (newStatus === 'reaberta') {
      record.set('reaberto_por', userName)
      record.set('reaberto_em', now)
      record.set('justificativa_reabertura', justificativa)
    }

    $app.save(record)

    // Registrar auditoria global
    try {
      const auditCol = $app.findCollectionByNameOrId('audit_logs')
      if (auditCol) {
        const auditRec = new Record(auditCol, {
          user_id: authRecord.id,
          user_name: userName,
          user_role: role,
          action: 'UPDATE_COMMISSION_STATUS',
          module: 'Comercial',
          target_collection: 'commission_apurations',
          target_id: apurationId,
          target_summary:
            'Comissão alterada para ' +
            newStatus +
            (justificativa ? ' - Justificativa: ' + justificativa : ''),
          previous_value: { situacao: oldStatus },
          new_value: { situacao: newStatus, justificativa: justificativa },
          criticidade: newStatus === 'reaberta' ? 'Alta' : 'Média',
          origem: 'Área da Empresa',
        })
        $app.save(auditRec)
      }
    } catch (errAudit) {
      console.log('Erro ao gravar audit_logs:', errAudit)
    }

    return e.json(200, {
      success: true,
      record: record,
      message: 'Status atualizado com sucesso.',
    })
  } catch (err) {
    return e.json(500, { message: 'Erro ao atualizar apuração: ' + err.message })
  }
})
