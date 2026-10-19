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
  const competencia = data.competencia || ''
  const rcaCode = data.rca_code || ''
  const rcaName = data.rca_name || ''
  const metodoApuracao = data.metodo_apuracao || ''
  const valorTotal = data.valor_total != null ? String(data.valor_total) : ''
  const baseCalculo = data.base_calculo != null ? String(data.base_calculo) : ''

  if (!newStatus) {
    return e.json(400, { message: 'O novo status é obrigatório.' })
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
    let record = null

    // 1. Tentar localizar o registro pelo ID informado se válido
    if (
      apurationId &&
      apurationId !== 'default' &&
      apurationId !== 'undefined' &&
      apurationId !== 'null'
    ) {
      try {
        record = $app.findRecordById('commission_apurations', apurationId)
      } catch (errFind) {
        // Ignora e tenta localizar por competência/RCA
        record = null
      }
    }

    // 2. Se não encontrou por ID mas temos competência ou RCA, buscar registro consolidado existente
    if (!record && (competencia || rcaCode || rcaName)) {
      const filters = []
      if (competencia) {
        filters.push('competencia = {:comp}')
      }
      if (rcaCode && rcaName) {
        filters.push('(rca_code = {:rcaCode} || vendedor_name = {:rcaName})')
      } else if (rcaCode) {
        filters.push('(rca_code = {:rcaCode} || vendedor_id = {:rcaCode})')
      } else if (rcaName) {
        filters.push('vendedor_name = {:rcaName}')
      }

      if (filters.length > 0) {
        const filterStr = filters.join(' && ')
        try {
          const matching = $app.findRecordsByFilter(
            'commission_apurations',
            filterStr,
            '-created',
            1,
            0,
            {
              comp: competencia,
              rcaCode: rcaCode,
              rcaName: rcaName,
            },
          )
          if (matching && matching.length > 0) {
            record = matching[0]
          }
        } catch (errQuery) {
          // Mantém record null para criar
          record = null
        }
      }
    }

    const now = new Date().toISOString()
    const isNew = !record
    let oldStatus = 'nao_apurada'

    // 3. Se não existir registro consolidado de apuração ainda, criar de forma transparente e robusta
    if (!record) {
      const apurationsCol = $app.findCollectionByNameOrId('commission_apurations')
      if (!apurationsCol) {
        return e.json(500, { message: 'Coleção de apurações de comissão não encontrada.' })
      }

      record = new Record(apurationsCol)
      record.set('competencia', competencia || now.slice(0, 7))
      record.set('rca_code', rcaCode)
      record.set('vendedor_name', rcaName || 'Representante Comercial')
      record.set('vendedor_id', rcaCode)
      record.set('metodo_apuracao', metodoApuracao || 'Adiantamento')
      if (valorTotal) record.set('commission_value', valorTotal)
      if (baseCalculo) record.set('base_value', baseCalculo)
      record.set('data_apuracao', now)
      record.set('responsavel_apuracao', userName)
      oldStatus = 'apurada'
    } else {
      oldStatus = record.getString('situacao') || 'apurada'
      if (competencia && !record.getString('competencia')) record.set('competencia', competencia)
      if (rcaCode && !record.getString('rca_code')) record.set('rca_code', rcaCode)
      if (rcaName && !record.getString('vendedor_name')) record.set('vendedor_name', rcaName)
      if (rcaCode && !record.getString('vendedor_id')) record.set('vendedor_id', rcaCode)
      if (metodoApuracao && !record.getString('metodo_apuracao'))
        record.set('metodo_apuracao', metodoApuracao)
      if (valorTotal && !record.getString('commission_value'))
        record.set('commission_value', valorTotal)
      if (baseCalculo && !record.getString('base_value')) record.set('base_value', baseCalculo)
    }

    record.set('situacao', newStatus)

    // Ler histórico anterior de forma segura (pode vir como string JSON, array, objeto ou nulo)
    let histList = []
    try {
      const raw = record.get('historico')
      if (Array.isArray(raw)) {
        histList = raw
      } else if (typeof raw === 'string' && raw.trim()) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          histList = parsed
        } else if (parsed && typeof parsed === 'object') {
          histList = [parsed]
        }
      } else if (raw && typeof raw === 'object') {
        histList = Array.isArray(raw) ? raw : Object.values(raw)
      }
    } catch (_) {}

    if (!Array.isArray(histList) || histList.length === 0) {
      try {
        const rawStr = record.getString('historico')
        if (rawStr && rawStr.trim()) {
          const parsedStr = JSON.parse(rawStr)
          if (Array.isArray(parsedStr)) {
            histList = parsedStr
          } else if (parsedStr && typeof parsedStr === 'object') {
            histList = [parsedStr]
          }
        }
      } catch (_) {}
    }

    if (!Array.isArray(histList)) {
      histList = []
    }

    const acaoLabel =
      newStatus === 'aprovada'
        ? 'Aprovação de Apuração'
        : newStatus === 'paga'
          ? 'Marcação de Pagamento'
          : newStatus === 'reaberta'
            ? 'Reabertura de Apuração'
            : 'Atualização de Status'

    const rcaIdent = rcaCode
      ? rcaName
        ? `${rcaCode} - ${rcaName}`
        : rcaCode
      : rcaName || record.getString('vendedor_name') || record.getString('rca_code') || ''

    histList.push({
      acao: acaoLabel,
      acao_codigo: `STATUS_${newStatus.toUpperCase()}`,
      status_anterior: oldStatus,
      status_novo: newStatus,
      operador: userName,
      usuario_id: authRecord.id,
      usuario_nome: userName,
      usuario_role: role,
      data: now,
      justificativa: justificativa || '',
      competencia: competencia || record.getString('competencia') || '',
      rca: rcaIdent,
      rca_code: rcaCode || record.getString('rca_code') || '',
      rca_name: rcaName || record.getString('vendedor_name') || '',
    })

    // Serializar rigorosamente como JSON string válido para conformidade com PocketBase
    record.set('historico', JSON.stringify(histList))

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

    // Registrar auditoria global em audit_logs
    try {
      const auditCol = $app.findCollectionByNameOrId('audit_logs')
      if (auditCol) {
        const auditRec = new Record(auditCol)
        auditRec.set('user_id', authRecord.id)
        auditRec.set('user_name', userName)
        auditRec.set('user_role', role)
        auditRec.set(
          'action',
          newStatus === 'reaberta'
            ? 'REOPEN_COMMISSION'
            : newStatus === 'aprovada'
              ? 'APPROVE_COMMISSION'
              : newStatus === 'paga'
                ? 'PAY_COMMISSION'
                : 'UPDATE_COMMISSION_STATUS',
        )
        auditRec.set('module', 'Comercial')
        auditRec.set('target_collection', 'commission_apurations')
        auditRec.set('target_id', record.id)
        auditRec.set(
          'target_summary',
          (isNew ? 'Nova apuração criada com status ' : 'Status da comissão alterado para ') +
            newStatus +
            (justificativa ? ' - Justificativa: ' + justificativa : ''),
        )
        auditRec.set('previous_value', JSON.stringify({ situacao: oldStatus }))
        auditRec.set(
          'new_value',
          JSON.stringify({
            situacao: newStatus,
            justificativa: justificativa,
            competencia: record.getString('competencia'),
            rca_code: record.getString('rca_code'),
            vendedor_name: record.getString('vendedor_name'),
          }),
        )
        auditRec.set('criticidade', newStatus === 'reaberta' ? 'Alta' : 'Média')
        auditRec.set('origem', 'Área da Empresa')
        auditRec.set('justification', justificativa)
        $app.save(auditRec)
      }
    } catch (errAudit) {
      console.log('Erro ao gravar audit_logs:', errAudit)
    }

    return e.json(200, {
      success: true,
      record: record,
      message:
        newStatus === 'reaberta'
          ? 'Apuração reaberta com sucesso e registrada na auditoria.'
          : newStatus === 'aprovada'
            ? 'Apuração aprovada com sucesso.'
            : newStatus === 'paga'
              ? 'Comissão marcada como paga com sucesso.'
              : 'Status da apuração atualizado com sucesso.',
    })
  } catch (err) {
    return e.json(500, {
      message:
        'Não foi possível atualizar o status da apuração: ' +
        (err.message || 'Erro interno no servidor.'),
    })
  }
})
