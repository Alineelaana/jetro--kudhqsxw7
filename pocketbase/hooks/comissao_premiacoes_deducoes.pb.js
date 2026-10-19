// Endpoints e validações backend para Premiações e Descontos/Deduções de Comissões

// ----------------------------------------------------
// CHECAGEM DE DEVOLUÇÃO JÁ ESTORNADA NA COMISSÃO ANALÍTICA
// Regra crítica: impede que o mesmo valor de devolução seja descontado duas vezes
// ----------------------------------------------------
routerAdd('POST', '/backend/v1/comissao/verificar-devolucao-estornada', (e) => {
  const authRecord = e.auth
  if (!authRecord) return e.json(401, { message: 'Não autorizado.' })

  const data = e.requestInfo().body || {}
  const devolutionId = data.devolution_id || ''
  const invoiceNumber = data.invoice_number || ''
  const competencia = data.competencia || ''

  let estornadoAutomaticamente = false
  let motivoEstorno = ''

  try {
    let devRecord = null
    if (devolutionId) {
      try {
        devRecord = $app.findRecordById('sales_returns', devolutionId)
      } catch (errDev) {
        devRecord = null
      }
    }
    if (!devRecord && invoiceNumber) {
      const devs = $app.findRecordsByFilter(
        'sales_returns',
        'invoice_number = {:inv}',
        '-created',
        1,
        0,
        { inv: invoiceNumber },
      )
      if (devs && devs.length > 0) devRecord = devs[0]
    }

    if (devRecord) {
      const devTotal = devRecord.getString('total_value') || '0'
      const devInv = devRecord.getString('invoice_number') || invoiceNumber
      const devCreated = devRecord.getString('created') || ''
      const compDev = devCreated.slice(0, 7)

      if (competencia && compDev === competencia) {
        estornadoAutomaticamente = true
        motivoEstorno = `A devolução da NF ${devInv} (R$ ${devTotal}) foi processada no módulo Comercial e JÁ ESTÁ INCLUÍDA no estorno automático da Comissão Analítica na competência ${competencia}. Não lance como dedução manual para evitar cobrança em duplicidade.`
      }
    }

    if (devolutionId) {
      const existingDeds = $app.findRecordsByFilter(
        'commission_deductions',
        'devolution_id = {:devId} && status != "Cancelado" && status != "Rejeitado"',
        '-created',
        1,
        0,
        { devId: devolutionId },
      )
      if (existingDeds && existingDeds.length > 0) {
        return e.json(200, {
          bloqueado: true,
          estornadoAutomaticamente: true,
          motivo: `Esta devolução já possui a dedução #${existingDeds[0].id} registrada no sistema com status "${existingDeds[0].getString('status')}". Não é permitido duplicar o lançamento.`,
        })
      }
    }

    return e.json(200, {
      bloqueado: estornadoAutomaticamente,
      estornadoAutomaticamente: estornadoAutomaticamente,
      motivo: motivoEstorno || 'Devolução liberada para dedução.',
    })
  } catch (err) {
    return e.json(500, {
      message: 'Erro ao verificar devolução: ' + (err.message || 'Erro interno'),
    })
  }
})

// ----------------------------------------------------
// WORKFLOW DE APROVAÇÃO/REJEIÇÃO/CANCELAMENTO PARA PREMIAÇÕES
// ----------------------------------------------------
routerAdd('POST', '/backend/v1/comissao/premiacoes/status-update', (e) => {
  const authRecord = e.auth
  if (!authRecord) return e.json(401, { message: 'Não autorizado.' })

  const userRole = authRecord.getString('role') || 'PADRAO'
  const userName = authRecord.getString('name') || authRecord.getString('email') || 'Usuário'
  const userId = authRecord.id

  const data = e.requestInfo().body || {}
  const awardId = data.award_id
  const newStatus = data.new_status
  const justificativa = data.justificativa || ''

  if (!awardId || !newStatus) {
    return e.json(400, { message: 'award_id e new_status são obrigatórios.' })
  }

  const validStatuses = ['Pendente', 'Aprovado', 'Rejeitado', 'Cancelado']
  if (!validStatuses.includes(newStatus)) {
    return e.json(400, { message: 'Status inválido informado: ' + newStatus })
  }

  if (
    ['Aprovado', 'Rejeitado'].includes(newStatus) &&
    !['SUP', 'FINANCEIRO', 'COMERCIAL'].includes(userRole)
  ) {
    return e.json(403, {
      message:
        'Permissão insuficiente. Apenas gestores Comerciais, Financeiro ou Master podem aprovar ou rejeitar premiações.',
    })
  }

  try {
    const record = $app.findRecordById('commission_awards', awardId)
    if (!record) return e.json(404, { message: 'Lançamento de premiação não encontrado.' })

    const oldStatus = record.getString('status') || 'Pendente'
    const competencia = record.getString('competencia')
    const benCode = record.getString('beneficiary_code')
    const benName = record.getString('beneficiary_name')

    // Checar se a apuração geral do mês já está fechada
    if (competencia && userRole !== 'SUP') {
      try {
        const filters = ['competencia = {:comp}']
        if (benCode && benName) {
          filters.push('(rca_code = {:rcaCode} || vendedor_name = {:rcaName})')
        } else if (benCode) {
          filters.push('(rca_code = {:rcaCode} || vendedor_id = {:rcaCode})')
        } else if (benName) {
          filters.push('vendedor_name = {:rcaName}')
        }
        const matching = $app.findRecordsByFilter(
          'commission_apurations',
          filters.join(' && '),
          '-created',
          1,
          0,
          { comp: competencia, rcaCode: benCode, rcaName: benName },
        )
        if (matching && matching.length > 0) {
          const apur = matching[0]
          const sit = apur.getString('situacao') || 'apurada'
          if (['apurada', 'aprovada', 'paga'].includes(sit)) {
            return e.json(403, {
              message: `A apuração da comissão para a competência ${competencia} já está com status "${sit.toUpperCase()}". Alterações de lançamentos exigem reabertura formal no fechamento da Comissão Analítica.`,
            })
          }
        }
      } catch (errCheck) {
        console.log('Erro ao checar apuracao:', errCheck)
      }
    }

    const now = new Date().toISOString()
    record.set('status', newStatus)

    if (newStatus === 'Aprovado') {
      record.set('approved_by_id', userId)
      record.set('approved_by_name', userName)
      record.set('approved_at', now)
    } else if (newStatus === 'Rejeitado') {
      record.set('rejected_by_id', userId)
      record.set('rejected_by_name', userName)
      record.set('rejected_at', now)
      if (justificativa) record.set('justification', justificativa)
    } else if (newStatus === 'Cancelado') {
      record.set('cancelled_by_id', userId)
      record.set('cancelled_by_name', userName)
      record.set('cancelled_at', now)
      if (justificativa) record.set('justification', justificativa)
    }

    const history = record.get('history') || []
    const histList = Array.isArray(history) ? history : []
    histList.push({
      acao: `STATUS_${newStatus.toUpperCase()}`,
      status_anterior: oldStatus,
      status_novo: newStatus,
      usuario_id: userId,
      usuario_nome: userName,
      usuario_role: userRole,
      data: now,
      justificativa: justificativa,
    })
    record.set('history', histList)

    $app.save(record)

    // Auditoria
    try {
      const auditCol = $app.findCollectionByNameOrId('audit_logs')
      if (auditCol) {
        const auditRec = new Record(auditCol, {
          user_id: userId,
          user_name: userName,
          user_role: userRole,
          action: `COMMISSION_AWARD_${newStatus.toUpperCase()}`,
          module: 'Comercial',
          target_collection: 'commission_awards',
          target_id: record.id,
          target_summary: `Premiação #${record.id} (${record.getString('award_type')} - R$ ${record.getFloat('amount')}) alterada para ${newStatus}${justificativa ? ' - ' + justificativa : ''}`,
          previous_value: { status: oldStatus },
          new_value: { status: newStatus, justificativa: justificativa },
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
      record: record,
      message: `Status da premiação alterado para "${newStatus}" com sucesso.`,
    })
  } catch (err) {
    return e.json(500, {
      message: 'Erro ao atualizar premiação: ' + (err.message || 'Erro interno'),
    })
  }
})

// ----------------------------------------------------
// WORKFLOW DE APROVAÇÃO/REJEIÇÃO/CANCELAMENTO PARA DESCONTOS E DEDUÇÕES
// ----------------------------------------------------
routerAdd('POST', '/backend/v1/comissao/descontos/status-update', (e) => {
  const authRecord = e.auth
  if (!authRecord) return e.json(401, { message: 'Não autorizado.' })

  const userRole = authRecord.getString('role') || 'PADRAO'
  const userName = authRecord.getString('name') || authRecord.getString('email') || 'Usuário'
  const userId = authRecord.id

  const data = e.requestInfo().body || {}
  const deductionId = data.deduction_id
  const newStatus = data.new_status
  const justificativa = data.justificativa || ''

  if (!deductionId || !newStatus) {
    return e.json(400, { message: 'deduction_id e new_status são obrigatórios.' })
  }

  const validStatuses = ['Pendente', 'Aprovado', 'Rejeitado', 'Cancelado']
  if (!validStatuses.includes(newStatus)) {
    return e.json(400, { message: 'Status inválido informado: ' + newStatus })
  }

  if (
    ['Aprovado', 'Rejeitado'].includes(newStatus) &&
    !['SUP', 'FINANCEIRO', 'COMERCIAL'].includes(userRole)
  ) {
    return e.json(403, {
      message:
        'Permissão insuficiente. Apenas gestores autorizados podem aprovar ou rejeitar deduções de comissões.',
    })
  }

  try {
    const record = $app.findRecordById('commission_deductions', deductionId)
    if (!record) return e.json(404, { message: 'Lançamento de dedução não encontrado.' })

    const oldStatus = record.getString('status') || 'Pendente'
    const competencia = record.getString('competencia')
    const benCode = record.getString('beneficiary_code')
    const benName = record.getString('beneficiary_name')

    // Checar se a apuração geral do mês já está fechada
    if (competencia && userRole !== 'SUP') {
      try {
        const filters = ['competencia = {:comp}']
        if (benCode && benName) {
          filters.push('(rca_code = {:rcaCode} || vendedor_name = {:rcaName})')
        } else if (benCode) {
          filters.push('(rca_code = {:rcaCode} || vendedor_id = {:rcaCode})')
        } else if (benName) {
          filters.push('vendedor_name = {:rcaName}')
        }
        const matching = $app.findRecordsByFilter(
          'commission_apurations',
          filters.join(' && '),
          '-created',
          1,
          0,
          { comp: competencia, rcaCode: benCode, rcaName: benName },
        )
        if (matching && matching.length > 0) {
          const apur = matching[0]
          const sit = apur.getString('situacao') || 'apurada'
          if (['apurada', 'aprovada', 'paga'].includes(sit)) {
            return e.json(403, {
              message: `A apuração da comissão para a competência ${competencia} já está com status "${sit.toUpperCase()}". Alterações de lançamentos exigem reabertura formal no fechamento da Comissão Analítica.`,
            })
          }
        }
      } catch (errCheck) {
        console.log('Erro ao checar apuracao:', errCheck)
      }
    }

    const now = new Date().toISOString()
    record.set('status', newStatus)

    if (newStatus === 'Aprovado') {
      record.set('approved_by_id', userId)
      record.set('approved_by_name', userName)
      record.set('approved_at', now)
    } else if (newStatus === 'Rejeitado') {
      record.set('rejected_by_id', userId)
      record.set('rejected_by_name', userName)
      record.set('rejected_at', now)
      if (justificativa) record.set('justification', justificativa)
    } else if (newStatus === 'Cancelado') {
      record.set('cancelled_by_id', userId)
      record.set('cancelled_by_name', userName)
      record.set('cancelled_at', now)
      if (justificativa) record.set('justification', justificativa)
    }

    const history = record.get('history') || []
    const histList = Array.isArray(history) ? history : []
    histList.push({
      acao: `STATUS_${newStatus.toUpperCase()}`,
      status_anterior: oldStatus,
      status_novo: newStatus,
      usuario_id: userId,
      usuario_nome: userName,
      usuario_role: userRole,
      data: now,
      justificativa: justificativa,
    })
    record.set('history', histList)

    $app.save(record)

    // Auditoria
    try {
      const auditCol = $app.findCollectionByNameOrId('audit_logs')
      if (auditCol) {
        const auditRec = new Record(auditCol, {
          user_id: userId,
          user_name: userName,
          user_role: userRole,
          action: `COMMISSION_DEDUCTION_${newStatus.toUpperCase()}`,
          module: 'Comercial',
          target_collection: 'commission_deductions',
          target_id: record.id,
          target_summary: `Dedução #${record.id} (${record.getString('reason')} - R$ ${record.getFloat('amount')}) alterada para ${newStatus}${justificativa ? ' - ' + justificativa : ''}`,
          previous_value: { status: oldStatus },
          new_value: { status: newStatus, justificativa: justificativa },
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
      record: record,
      message: `Status da dedução alterado para "${newStatus}" com sucesso.`,
    })
  } catch (err) {
    return e.json(500, { message: 'Erro ao atualizar dedução: ' + (err.message || 'Erro interno') })
  }
})

// ----------------------------------------------------
// HOOKS ONRECORD BEFORE CREATE
// Prevenção de duplicidade, bloqueio de apuração fechada e auditoria
// ----------------------------------------------------
onRecordCreateRequest(
  (e) => {
    const collectionName = e.collection.name
    if (collectionName !== 'commission_awards' && collectionName !== 'commission_deductions') {
      e.next()
      return
    }

    const authRecord = e.auth
    const userRole = authRecord ? authRecord.getString('role') || 'PADRAO' : 'PADRAO'
    const userName = authRecord
      ? authRecord.getString('name') || authRecord.getString('email') || 'Usuário'
      : 'Usuário'
    const userId = authRecord ? authRecord.id : 'sistema'

    const rec = e.record
    const competencia = rec.getString('competencia') || ''
    const benCode = rec.getString('beneficiary_code') || ''
    const benName = rec.getString('beneficiary_name') || ''
    const tipo =
      collectionName === 'commission_awards'
        ? rec.getString('award_type')
        : rec.getString('deduction_type')
    const amount = rec.getFloat('amount') || 0
    const desc = rec.getString('description') || ''

    // Bloqueio se apuração fechada
    if (competencia && userRole !== 'SUP') {
      try {
        const filters = ['competencia = {:comp}']
        if (benCode && benName) {
          filters.push('(rca_code = {:rcaCode} || vendedor_name = {:rcaName})')
        } else if (benCode) {
          filters.push('(rca_code = {:rcaCode} || vendedor_id = {:rcaCode})')
        } else if (benName) {
          filters.push('vendedor_name = {:rcaName}')
        }
        const matching = $app.findRecordsByFilter(
          'commission_apurations',
          filters.join(' && '),
          '-created',
          1,
          0,
          { comp: competencia, rcaCode: benCode, rcaName: benName },
        )
        if (matching && matching.length > 0) {
          const apur = matching[0]
          const sit = apur.getString('situacao') || 'apurada'
          if (['apurada', 'aprovada', 'paga'].includes(sit)) {
            throw new BadRequestError(
              `A apuração da comissão para a competência ${competencia} já está com status "${sit.toUpperCase()}". Novos lançamentos exigem reabertura formal da apuração no fechamento da Comissão Analítica.`,
            )
          }
        }
      } catch (errCheck) {
        if (errCheck.name === 'BadRequestError' || errCheck.message.includes('fechamento')) {
          throw errCheck
        }
      }
    }

    // Prevenção de duplicidade: mesmo profissional + competência + tipo + valor + descrição
    const hash = `${benCode}|${competencia}|${tipo}|${amount.toFixed(2)}|${desc.trim().toLowerCase()}`
    rec.set('hash_duplicidade', hash)

    const existingDups = $app.findRecordsByFilter(
      collectionName,
      'hash_duplicidade = {:h} && status != "Cancelado" && status != "Rejeitado"',
      '-created',
      1,
      0,
      { h: hash },
    )
    if (existingDups && existingDups.length > 0) {
      throw new BadRequestError(
        'Lançamento duplicado detectado: já existe um registro idêntico com o mesmo profissional, competência, tipo, valor e descrição no sistema.',
      )
    }

    // Preenchimento automático do usuário responsável
    if (authRecord) {
      rec.set('responsible_user_id', userId)
      rec.set('responsible_user_name', userName)
    }

    // Trilha de auditoria inicial
    const now = new Date().toISOString()
    const initialHistory = [
      {
        acao: 'CRIACAO',
        usuario_id: userId,
        usuario_nome: userName,
        data: now,
        detalhes: `Lançamento criado com status ${rec.getString('status') || 'Pendente'}`,
      },
    ]
    rec.set('history', initialHistory)

    e.next()
  },
  'commission_awards',
  'commission_deductions',
)

onRecordUpdateRequest(
  (e) => {
    const collectionName = e.collection.name
    if (collectionName !== 'commission_awards' && collectionName !== 'commission_deductions') {
      e.next()
      return
    }

    const authRecord = e.auth
    const userRole = authRecord ? authRecord.getString('role') || 'PADRAO' : 'PADRAO'
    const userName = authRecord
      ? authRecord.getString('name') || authRecord.getString('email') || 'Usuário'
      : 'Usuário'
    const userId = authRecord ? authRecord.id : 'sistema'

    const rec = e.record
    const competencia = rec.getString('competencia') || ''
    const benCode = rec.getString('beneficiary_code') || ''
    const benName = rec.getString('beneficiary_name') || ''

    // Bloqueio se apuração fechada
    if (competencia && userRole !== 'SUP') {
      try {
        const filters = ['competencia = {:comp}']
        if (benCode && benName) {
          filters.push('(rca_code = {:rcaCode} || vendedor_name = {:rcaName})')
        } else if (benCode) {
          filters.push('(rca_code = {:rcaCode} || vendedor_id = {:rcaCode})')
        } else if (benName) {
          filters.push('vendedor_name = {:rcaName}')
        }
        const matching = $app.findRecordsByFilter(
          'commission_apurations',
          filters.join(' && '),
          '-created',
          1,
          0,
          { comp: competencia, rcaCode: benCode, rcaName: benName },
        )
        if (matching && matching.length > 0) {
          const apur = matching[0]
          const sit = apur.getString('situacao') || 'apurada'
          if (['apurada', 'aprovada', 'paga'].includes(sit)) {
            throw new BadRequestError(
              `A apuração da comissão para a competência ${competencia} já está com status "${sit.toUpperCase()}". Alterações exigem reabertura formal no fechamento da Comissão Analítica.`,
            )
          }
        }
      } catch (errCheck) {
        if (errCheck.name === 'BadRequestError' || errCheck.message.includes('fechamento')) {
          throw errCheck
        }
      }
    }

    // Trilha de auditoria de edição
    const now = new Date().toISOString()
    const history = rec.get('history') || []
    const histList = Array.isArray(history) ? history : []
    histList.push({
      acao: 'EDICAO',
      usuario_id: userId,
      usuario_nome: userName,
      data: now,
      detalhes: 'Lançamento editado pelo usuário',
    })
    rec.set('history', histList)

    e.next()
  },
  'commission_awards',
  'commission_deductions',
)
