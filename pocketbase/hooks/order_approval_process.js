/**
 * Hook: order_approval_process.js
 * Endpoints seguros para o fluxo de aprovação e rejeição de pedidos (Venda e Compra)
 * Regras no servidor:
 * 1. Alçada real por valor e perfil (consulta order_approval_tiers ou regras padrão)
 * 2. Validação de estágio (apenas pedidos em "Aguardando Aprovação")
 * 3. Segregação de funções (solicitante não pode aprovar seu próprio pedido, a menos que seja SUP de sistema em ambiente de controle)
 * 4. Isolamento por empresa / filial
 * 5. Idempotência e registro na trilha (order_approval_records + audit_logs + histórico interno do pedido)
 * 6. Disparo de notificação interna para o solicitante e outros interessados
 */

routerAdd('POST', '/backend/v1/orders/approval/action', (e) => {
  const authRecord = e.auth
  if (!authRecord) {
    return e.json(401, { error: 'Autenticação necessária' })
  }

  const reqInfo = e.requestInfo()
  const body = reqInfo.body || {}
  const orderId = body.order_id
  const orderType = body.order_type // 'venda' | 'compra'
  const action = body.action // 'aprovar' | 'rejeitar'
  const reason = body.reason || ''
  const notes = body.notes || ''

  if (!orderId || !orderType || !action) {
    return e.json(400, { error: 'order_id, order_type e action são obrigatórios.' })
  }

  if (action === 'rejeitar' && !reason.trim()) {
    return e.json(400, { error: 'O motivo da rejeição é estritamente obrigatório.' })
  }

  const targetColName = orderType === 'venda' ? 'sales_orders' : 'purchase_orders'

  try {
    const order = $app.findRecordById(targetColName, orderId)
    if (!order) {
      return e.json(404, { error: 'Pedido não encontrado.' })
    }

    const currentStatus = order.getString('status') || order.getString('order_stage') || ''
    if (currentStatus !== 'Aguardando Aprovação') {
      return e.json(400, {
        error:
          'O pedido não está no estágio "Aguardando Aprovação". Status atual: ' + currentStatus,
      })
    }

    // Identificação do aprovador
    const approverId = authRecord.id
    const approverName = authRecord.getString('name') || 'Aprovador'
    const approverRole = authRecord.getString('role') || 'PADRAO'
    const approverEmpresa = authRecord.getString('empresa_id') || ''
    const approverFilial = authRecord.getString('filial_id') || ''

    // Isolamento multiempresa (se aplicável ao pedido e usuário não for SUP)
    const orderEmpresa =
      order.getString('empresa_id') ||
      order.getString('company') ||
      order.getString('empresa') ||
      ''
    const orderFilial =
      order.getString('filial_id') || order.getString('branch') || order.getString('filial') || ''

    if (approverRole !== 'SUP') {
      if (approverEmpresa && orderEmpresa && approverEmpresa !== orderEmpresa) {
        return e.json(403, {
          error: 'Acesso negado: o pedido pertence a outra empresa do grupo.',
        })
      }
    }

    // Segregação de Funções: Solicitante NÃO pode aprovar o próprio pedido
    const requesterId =
      order.getString('created_by') ||
      order.getString('buyer_id') ||
      order.getString('salesperson_id') ||
      order.getString('requester_id') ||
      ''
    const requesterName =
      order.getString('responsible_user') ||
      order.getString('buyer') ||
      order.getString('salesperson_name') ||
      'Solicitante'

    if (approverRole !== 'SUP' && requesterId && requesterId === approverId) {
      return e.json(403, {
        error:
          'Segregação de funções: o solicitante do pedido não tem permissão para aprovar a própria solicitação.',
      })
    }

    // Valor do pedido
    const totalValue =
      parseFloat(order.getString('total_value') || order.getString('products_value') || '0') || 0

    // Verificação de alçada do usuário/perfil para aprovação
    let userMaxApproval = 0
    let tierLevelName = approverRole

    try {
      const tiers = $app.findRecordsByFilter(
        'order_approval_tiers',
        `active = true && role_or_profile = "${approverRole}"`,
        '-max_value_approval',
        1,
        0,
      )
      if (tiers && tiers.length > 0) {
        userMaxApproval = tiers[0].getInt('max_value_approval') || 0
        tierLevelName = tiers[0].getString('name') || approverRole
      } else {
        // Fallback para valores padrão caso tiers não tenham sido customizados
        if (approverRole === 'SUP') {
          userMaxApproval = 999999999
          tierLevelName = 'Diretoria / Superusuário'
        } else if (approverRole === 'FINANCEIRO') {
          userMaxApproval = 100000
          tierLevelName = 'Controladoria e Financeiro'
        } else if (approverRole === 'COMERCIAL') {
          userMaxApproval = 50000
          tierLevelName = 'Gerência Comercial'
        } else if (approverRole === 'PADRAO') {
          userMaxApproval = 15000
          tierLevelName = 'Gestão Operacional'
        } else {
          userMaxApproval = 0
          tierLevelName = 'Sem alçada de aprovação'
        }
      }
    } catch (_) {
      if (approverRole === 'SUP') userMaxApproval = 999999999
      else if (approverRole === 'FINANCEIRO') userMaxApproval = 100000
      else if (approverRole === 'COMERCIAL') userMaxApproval = 50000
      else userMaxApproval = 15000
    }

    if (action === 'aprovar' && approverRole !== 'SUP' && totalValue > userMaxApproval) {
      return e.json(403, {
        error: `Alçada insuficiente: seu perfil (${tierLevelName}) possui limite de aprovação de até R$ ${userMaxApproval.toFixed(2)}, enquanto o pedido totaliza R$ ${totalValue.toFixed(2)}.`,
      })
    }

    const nowIso = new Date().toISOString()
    const targetStatus =
      action === 'aprovar' ? (orderType === 'venda' ? 'Confirmado' : 'Aprovado') : 'Cancelado'

    const orderNumber = order.getString('order_number') || order.id

    // 1. Atualizar o Pedido
    order.set('status', targetStatus)
    order.set('order_stage', targetStatus)
    if (action === 'aprovar') {
      order.set('approved_by', approverName)
      order.set('approved_at', nowIso)
      if (orderType === 'venda') {
        order.set('stock_reserved', true)
      }
    } else {
      order.set('cancellation_reason', reason)
    }

    // Histórico interno do pedido
    const history = order.get('history') || []
    const trailEntry = {
      action: action === 'aprovar' ? 'Aprovação de Pedido' : 'Rejeição de Pedido',
      user: approverName,
      user_id: approverId,
      date: nowIso,
      tier_level: tierLevelName,
      order_type: orderType,
      value: totalValue,
      reason: reason || (action === 'aprovar' ? 'Pedido liberado dentro da alçada' : ''),
      notes: notes,
    }
    history.push(trailEntry)
    order.set('history', history)

    // approval_trail consolidada
    const approvalTrail = order.get('approval_trail') || []
    approvalTrail.push(trailEntry)
    order.set('approval_trail', approvalTrail)

    $app.save(order)

    // 2. Gravar na Coleção de Trilha Auditável (order_approval_records)
    try {
      const recordsCol = $app.findCollectionByNameOrId('order_approval_records')
      const rec = new Record(recordsCol)
      rec.set('order_id', order.id)
      rec.set('order_number', orderNumber)
      rec.set('order_type', orderType)
      rec.set('company', orderEmpresa)
      rec.set('branch', orderFilial)
      rec.set('total_value', totalValue)
      rec.set('requester_id', requesterId)
      rec.set('requester_name', requesterName)
      rec.set('approver_id', approverId)
      rec.set('approver_name', approverName)
      rec.set('action', action === 'aprovar' ? 'aprovado' : 'rejeitado')
      rec.set('tier_level', tierLevelName)
      rec.set('reason', reason)
      rec.set('notes', notes)
      $app.save(rec)
    } catch (recErr) {
      $app.logger().warn('Falha ao registrar order_approval_records:', 'error', String(recErr))
    }

    // 3. Auditoria HURAM (audit_logs)
    try {
      const auditCol = $app.findCollectionByNameOrId('audit_logs')
      const auditRec = new Record(auditCol)
      auditRec.set('user_id', approverId)
      auditRec.set('user_name', approverName)
      auditRec.set('user_role', approverRole)
      auditRec.set('action', action === 'aprovar' ? 'order_approved' : 'order_rejected')
      auditRec.set('module', orderType === 'venda' ? 'vendas' : 'compras')
      auditRec.set('target_collection', targetColName)
      auditRec.set('target_id', order.id)
      auditRec.set(
        'target_summary',
        `Pedido de ${orderType === 'venda' ? 'Venda' : 'Compra'} ${orderNumber} ${action === 'aprovar' ? 'aprovado' : 'rejeitado'} por ${approverName} (${tierLevelName}).`,
      )
      auditRec.set('criticidade', 'Alta')
      auditRec.set('origem', 'Área da Empresa')
      auditRec.set('empresa', orderEmpresa)
      auditRec.set('filial', orderFilial)
      $app.save(auditRec)
    } catch (_) {}

    // 4. Notificação Interna para o Solicitante
    if (requesterId) {
      try {
        const notifCol = $app.findCollectionByNameOrId('notifications')
        const notif = new Record(notifCol)
        const isApprove = action === 'aprovar'
        notif.set('title', `Pedido ${orderNumber} ${isApprove ? 'Aprovado' : 'Rejeitado'}`)
        notif.set(
          'message',
          `Seu pedido de ${orderType === 'venda' ? 'Venda' : 'Compra'} nº ${orderNumber} foi ${isApprove ? 'APROVADO' : 'REJEITADO'} por ${approverName}.${reason ? ' Motivo: ' + reason : ''}`,
        )
        notif.set('recipient', requesterId)
        notif.set('read', false)
        notif.set(
          'link',
          orderType === 'venda' ? '/admin/vendas/pedidos' : '/admin/compras/pedidos',
        )
        notif.set('type', 'approval_pending')
        $app.save(notif)
      } catch (notifErr) {
        $app.logger().warn('Falha ao gerar notificação de aprovação:', 'error', String(notifErr))
      }
    }

    return e.json(200, {
      success: true,
      message: `Pedido ${orderNumber} ${action === 'aprovar' ? 'aprovado' : 'rejeitado'} com sucesso.`,
      status: targetStatus,
      order_id: order.id,
      order_number: orderNumber,
      action: action,
      approver: approverName,
      tier: tierLevelName,
    })
  } catch (err) {
    $app.logger().error('Erro no processamento de aprovação:', 'error', String(err))
    return e.json(500, { error: 'Falha interna ao processar ação: ' + String(err) })
  }
})

/**
 * Endpoint para submissão de pedido para a fila de aprovação com envio de notificação aos aprovadores
 */
routerAdd('POST', '/backend/v1/orders/approval/submit', (e) => {
  const authRecord = e.auth
  if (!authRecord) {
    return e.json(401, { error: 'Autenticação necessária' })
  }

  const reqInfo = e.requestInfo()
  const body = reqInfo.body || {}
  const orderId = body.order_id
  const orderType = body.order_type // 'venda' | 'compra'
  const approvalReasons = body.approval_reasons || []

  if (!orderId || !orderType) {
    return e.json(400, { error: 'order_id e order_type são obrigatórios.' })
  }

  const targetColName = orderType === 'venda' ? 'sales_orders' : 'purchase_orders'

  try {
    const order = $app.findRecordById(targetColName, orderId)
    if (!order) {
      return e.json(404, { error: 'Pedido não encontrado.' })
    }

    const orderNumber = order.getString('order_number') || order.id
    const requesterName = authRecord.getString('name') || 'Solicitante'
    const totalValue =
      parseFloat(order.getString('total_value') || order.getString('products_value') || '0') || 0
    const nowIso = new Date().toISOString()

    order.set('status', 'Aguardando Aprovação')
    order.set('order_stage', 'Aguardando Aprovação')

    const history = order.get('history') || []
    history.push({
      action: 'Submetido para Aprovação',
      user: requesterName,
      user_id: authRecord.id,
      date: nowIso,
      order_type: orderType,
      value: totalValue,
      reasons: approvalReasons,
      note: approvalReasons.length > 0 ? `Motivos: ${approvalReasons.join('; ')}` : '',
    })
    order.set('history', history)
    $app.save(order)

    // Registrar no order_approval_records a solicitação
    try {
      const recordsCol = $app.findCollectionByNameOrId('order_approval_records')
      const rec = new Record(recordsCol)
      rec.set('order_id', order.id)
      rec.set('order_number', orderNumber)
      rec.set('order_type', orderType)
      rec.set('company', order.getString('empresa_id') || order.getString('company') || '')
      rec.set('branch', order.getString('filial_id') || order.getString('branch') || '')
      rec.set('total_value', totalValue)
      rec.set('requester_id', authRecord.id)
      rec.set('requester_name', requesterName)
      rec.set('action', 'solicitado')
      rec.set('approval_reasons', approvalReasons)
      rec.set('notes', approvalReasons.join('; '))
      $app.save(rec)
    } catch (_) {}

    // Notificar os aprovadores do sistema (usuários com perfil SUP, FINANCEIRO ou COMERCIAL)
    try {
      const approvers = $app.findRecordsByFilter(
        '_pb_users_auth_',
        `active = true && (role = "SUP" || role = "FINANCEIRO" || role = "COMERCIAL") && id != "${authRecord.id}"`,
        '',
        20,
        0,
      )

      const notifCol = $app.findCollectionByNameOrId('notifications')
      approvers.forEach((appr) => {
        try {
          const notif = new Record(notifCol)
          notif.set(
            'title',
            `Novo Pedido de ${orderType === 'venda' ? 'Venda' : 'Compra'} Pendente de Aprovação`,
          )
          notif.set(
            'message',
            `O pedido nº ${orderNumber} (R$ ${totalValue.toFixed(2)}) foi encaminhado para aprovação por ${requesterName}.${approvalReasons.length > 0 ? ' Motivo: ' + approvalReasons.join('; ') : ''}`,
          )
          notif.set('recipient', appr.id)
          notif.set('read', false)
          notif.set('link', '/admin/aprovacoes/pedidos')
          notif.set('type', 'approval_pending')
          $app.save(notif)
        } catch (_) {}
      })
    } catch (notifErr) {
      $app.logger().warn('Falha ao notificar aprovadores:', 'error', String(notifErr))
    }

    return e.json(200, {
      success: true,
      message: `Pedido ${orderNumber} enviado para aprovação com sucesso.`,
      status: 'Aguardando Aprovação',
    })
  } catch (err) {
    return e.json(500, { error: 'Falha ao submeter pedido para aprovação: ' + String(err) })
  }
})
