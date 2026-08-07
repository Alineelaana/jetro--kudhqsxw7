migrate(
  (app) => {
    const leadsCol = app.findCollectionByNameOrId('crm_leads')
    if (!leadsCol.fields.getByName('contacts')) {
      leadsCol.fields.add(new JSONField({ name: 'contacts' }))
    }
    if (!leadsCol.fields.getByName('attachments')) {
      leadsCol.fields.add(
        new FileField({
          name: 'attachments',
          maxSelect: 10,
          maxSize: 10485760,
          mimeTypes: ['image/jpeg', 'image/png', 'application/pdf'],
        }),
      )
    }
    app.save(leadsCol)

    const oppsCol = app.findCollectionByNameOrId('crm_opportunities')
    if (!oppsCol.fields.getByName('expected_margin')) {
      oppsCol.fields.add(new TextField({ name: 'expected_margin' }))
    }
    if (!oppsCol.fields.getByName('weighted_value')) {
      oppsCol.fields.add(new TextField({ name: 'weighted_value' }))
    }
    app.save(oppsCol)

    const fsCol = app.findCollectionByNameOrId('crm_funnel_stages')
    if (!fsCol.fields.getByName('funnel_type')) {
      fsCol.fields.add(new TextField({ name: 'funnel_type' }))
    }
    if (!fsCol.fields.getByName('company')) {
      fsCol.fields.add(new TextField({ name: 'company' }))
    }
    if (!fsCol.fields.getByName('team')) {
      fsCol.fields.add(new TextField({ name: 'team' }))
    }
    if (!fsCol.fields.getByName('segment')) {
      fsCol.fields.add(new TextField({ name: 'segment' }))
    }
    app.save(fsCol)

    const propCol = app.findCollectionByNameOrId('crm_proposals')
    if (!propCol.fields.getByName('version')) {
      propCol.fields.add(new NumberField({ name: 'version' }))
    }
    if (!propCol.fields.getByName('parent_version_id')) {
      propCol.fields.add(new TextField({ name: 'parent_version_id' }))
    }
    if (!propCol.fields.getByName('approval_status')) {
      propCol.fields.add(new TextField({ name: 'approval_status' }))
    }
    if (!propCol.fields.getByName('approval_user')) {
      propCol.fields.add(new TextField({ name: 'approval_user' }))
    }
    if (!propCol.fields.getByName('approval_date')) {
      propCol.fields.add(new TextField({ name: 'approval_date' }))
    }
    if (!propCol.fields.getByName('converted_order_id')) {
      propCol.fields.add(new TextField({ name: 'converted_order_id' }))
    }
    if (!propCol.fields.getByName('converted_order_number')) {
      propCol.fields.add(new TextField({ name: 'converted_order_number' }))
    }
    app.save(propCol)

    app.save(
      new Collection({
        name: 'crm_funnel_configurations',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.role = 'SUP'",
        fields: [
          { name: 'name', type: 'text', required: true },
          { name: 'funnel_type', type: 'text' },
          { name: 'company', type: 'text' },
          { name: 'team', type: 'text' },
          { name: 'segment', type: 'text' },
          { name: 'stage_ids', type: 'json' },
          { name: 'active', type: 'bool' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: ['CREATE INDEX idx_crm_fc_active ON crm_funnel_configurations (active)'],
      }),
    )

    app.save(
      new Collection({
        name: 'crm_proposal_versions',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.role = 'SUP'",
        deleteRule: "@request.auth.role = 'SUP'",
        fields: [
          { name: 'proposal_id', type: 'text', required: true },
          { name: 'version_number', type: 'number' },
          { name: 'items', type: 'json' },
          { name: 'subtotal', type: 'text' },
          { name: 'discount', type: 'text' },
          { name: 'total', type: 'text' },
          { name: 'status', type: 'text' },
          { name: 'created_by', type: 'text' },
          { name: 'notes', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: ['CREATE INDEX idx_crm_pv_proposal ON crm_proposal_versions (proposal_id)'],
      }),
    )

    const fcCol = app.findCollectionByNameOrId('crm_funnel_configurations')
    const defaultFunnels = [
      ['Funil Principal', 'geral', '', '', ''],
      ['Funil Corporativo', 'empresa', 'Velora Log', '', ''],
      ['Funil Varejo', 'segmento', '', '', 'Varejo'],
    ]
    defaultFunnels.forEach(function (f) {
      try {
        app.findFirstRecordByData('crm_funnel_configurations', 'name', f[0])
        return
      } catch (_) {}
      const r = new Record(fcCol)
      r.set('name', f[0])
      r.set('funnel_type', f[1])
      r.set('company', f[2])
      r.set('team', f[3])
      r.set('segment', f[4])
      r.set('active', true)
      app.save(r)
    })
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('crm_proposal_versions'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('crm_funnel_configurations'))
    } catch (_) {}
  },
)
