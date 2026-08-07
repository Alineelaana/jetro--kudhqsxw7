onRecordAfterCreateSuccess((e) => {
  var collection = e.record.collectionName
  if (collection !== 'supplier_allowance_agreements') return e.next()

  try {
    var STEPS = [
      { key: 'create', label: 'Criação', role: 'PADRAO', action: 'execute' },
      { key: 'negotiate', label: 'Negociação', role: 'COMERCIAL', action: 'execute' },
      { key: 'review_legal', label: 'Revisão Jurídica', role: 'FINANCEIRO', action: 'review' },
      { key: 'review_finance', label: 'Análise Financeira', role: 'FINANCEIRO', action: 'review' },
      {
        key: 'approve_commercial',
        label: 'Aprovação Comercial',
        role: 'COMERCIAL',
        action: 'approve',
      },
      {
        key: 'approve_finance',
        label: 'Aprovação Financeira',
        role: 'FINANCEIRO',
        action: 'approve',
      },
      { key: 'approve_director', label: 'Aprovação Diretoria', role: 'SUP', action: 'approve' },
      { key: 'publish', label: 'Publicação', role: 'PADRAO', action: 'execute' },
      { key: 'active', label: 'Ativação', role: 'PADRAO', action: 'execute' },
      { key: 'monitor', label: 'Monitoramento', role: 'PADRAO', action: 'review' },
      { key: 'review_period', label: 'Revisão Periódica', role: 'COMERCIAL', action: 'review' },
      { key: 'renew', label: 'Renovação/Encerramento', role: 'COMERCIAL', action: 'execute' },
      { key: 'archive', label: 'Arquivamento', role: 'SUP', action: 'execute' },
      { key: 'close', label: 'Fechamento', role: 'SUP', action: 'close' },
    ]

    var wfCol = $app.findCollectionByNameOrId('platform_workflows')
    var wf = new Record(wfCol)
    wf.set('workflow_key', 'supplier_allowance_agreement')
    wf.set('entity_type', collection)
    wf.set('entity_id', e.record.id)
    wf.set('entity_summary', e.record.getString('agreement_type') || e.record.id)
    wf.set('current_step', STEPS[0].key)
    wf.set('steps', STEPS)
    wf.set('history', [
      {
        step: STEPS[0].key,
        action: 'created',
        user: 'Sistema',
        date: new Date().toISOString(),
        notes: 'Workflow iniciado',
      },
    ])
    wf.set('status', 'in_progress')
    wf.set('assigned_role', STEPS[0].role)
    wf.set('module_origin', collection)
    wf.set('company', e.record.getString('company') || '')
    wf.set('branch', e.record.getString('branch') || '')
    $app.save(wf)
  } catch (err) {
    $app.logger().error('SA: Workflow creation failed', 'error', String(err))
  }

  return e.next()
}, 'supplier_allowance_agreements')
