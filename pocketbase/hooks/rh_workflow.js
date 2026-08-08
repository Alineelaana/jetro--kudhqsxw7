routerAdd(
  'POST',
  '/backend/v1/rh/workflow',
  (e) => {
    try {
      var body = e.requestInfo().body || {}
      var userId = e.auth && e.auth.id
      var userName = (e.auth && e.auth.getString('name')) || 'System'

      var wfCol = $app.findCollectionByNameOrId('platform_workflows')

      var STEPS = {
        promotion: [
          { key: 'request', label: 'Solicitacao', role: 'PADRAO', action: 'execute' },
          { key: 'approve', label: 'Aprovacao RH', role: 'SUP', action: 'approve' },
          { key: 'close', label: 'Aplicacao', role: 'SUP', action: 'close' },
        ],
        transfer: [
          { key: 'request', label: 'Solicitacao', role: 'PADRAO', action: 'execute' },
          { key: 'approve', label: 'Aprovacao', role: 'SUP', action: 'approve' },
          { key: 'close', label: 'Conclusao', role: 'SUP', action: 'close' },
        ],
        onboarding: [
          { key: 'create', label: 'Pre-admissao', role: 'PADRAO', action: 'execute' },
          { key: 'docs', label: 'Documentos', role: 'PADRAO', action: 'execute' },
          { key: 'train', label: 'Treinamentos', role: 'PADRAO', action: 'execute' },
          { key: 'equip', label: 'Equipamentos', role: 'PADRAO', action: 'execute' },
          { key: 'close', label: 'Encerramento', role: 'SUP', action: 'close' },
        ],
        offboarding: [
          { key: 'request', label: 'Solicitacao', role: 'PADRAO', action: 'execute' },
          { key: 'approve', label: 'Aprovacao', role: 'SUP', action: 'approve' },
          { key: 'interview', label: 'Entrevista', role: 'PADRAO', action: 'execute' },
          { key: 'assets', label: 'Devolucao Ativos', role: 'PADRAO', action: 'execute' },
          { key: 'close', label: 'Encerramento', role: 'SUP', action: 'close' },
        ],
        generic: [
          { key: 'create', label: 'Inicio', role: 'PADRAO', action: 'execute' },
          { key: 'approve', label: 'Aprovacao', role: 'SUP', action: 'approve' },
          { key: 'close', label: 'Conclusao', role: 'SUP', action: 'close' },
        ],
      }

      var steps = STEPS[body.workflow_key] || STEPS.generic
      var wf = new Record(wfCol)
      wf.set('workflow_key', body.workflow_key || 'generic')
      wf.set('entity_type', body.entity_type || 'rh')
      wf.set('entity_id', body.entity_id || '')
      wf.set('entity_number', '')
      wf.set('entity_summary', body.entity_summary || '')
      wf.set('current_step', steps[0].key)
      wf.set('steps', steps)
      wf.set('history', [
        {
          step: steps[0].key,
          action: 'created',
          user: userName,
          date: new Date().toISOString(),
          notes: 'Workflow RH iniciado',
        },
      ])
      wf.set('status', 'in_progress')
      wf.set('assigned_role', steps[0].role)
      wf.set('module_origin', 'rh')
      wf.set('company', '')
      wf.set('branch', '')
      wf.set('created_by', userId || '')
      wf.set('created_by_name', userName)
      $app.save(wf)

      return e.json(201, { id: wf.id, status: 'in_progress' })
    } catch (err) {
      $app.logger().error('rh workflow creation failed', 'error', String(err))
      return e.json(500, { error: 'workflow creation failed' })
    }
  },
  $apis.requireAuth(),
)
