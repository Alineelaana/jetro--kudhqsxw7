migrate(
  (app) => {
    function mk(name, fields, indexes) {
      app.save(
        new Collection({
          name: name,
          type: 'base',
          listRule: "@request.auth.id != ''",
          viewRule: "@request.auth.id != ''",
          createRule: "@request.auth.id != ''",
          updateRule: "@request.auth.id != ''",
          deleteRule: "@request.auth.id != ''",
          fields: fields.concat([
            { name: 'supplier', type: 'text' },
            { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
            { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
          ]),
          indexes: indexes || [],
        }),
      )
    }

    mk(
      'mk_action_types',
      [
        { name: 'name', type: 'text', required: true },
        { name: 'description', type: 'text' },
        { name: 'active', type: 'bool' },
        { name: 'color', type: 'text' },
      ],
      ['CREATE INDEX idx_mk_at_name ON mk_action_types (name)'],
    )

    mk(
      'mk_materials',
      [
        { name: 'name', type: 'text', required: true },
        { name: 'type', type: 'text' },
        { name: 'category', type: 'text' },
        { name: 'brand', type: 'text' },
        { name: 'product', type: 'text' },
        { name: 'campaign_id', type: 'text' },
        { name: 'action_id', type: 'text' },
        { name: 'year', type: 'text' },
        { name: 'file', type: 'file', maxSelect: 5, maxSize: 52428800 },
        { name: 'description', type: 'text' },
        { name: 'tags', type: 'json' },
        { name: 'status', type: 'text' },
        { name: 'responsible_id', type: 'text' },
        { name: 'responsible_name', type: 'text' },
      ],
      ['CREATE INDEX idx_mk_mat_supplier ON mk_materials (supplier)'],
    )

    mk(
      'mk_material_versions',
      [
        { name: 'material_id', type: 'text', required: true },
        { name: 'version', type: 'number' },
        {
          name: 'status',
          type: 'select',
          values: ['Rascunho', 'Em Aprovação', 'Aprovado', 'Reprovado', 'Obsoleto'],
          maxSelect: 1,
        },
        { name: 'file', type: 'file', maxSelect: 1, maxSize: 52428800 },
        { name: 'changes', type: 'text' },
        { name: 'responsible_id', type: 'text' },
        { name: 'responsible_name', type: 'text' },
        { name: 'approved_by', type: 'text' },
        { name: 'approved_at', type: 'text' },
      ],
      ['CREATE INDEX idx_mk_mv_mat ON mk_material_versions (material_id)'],
    )

    mk(
      'mk_pdv_assets',
      [
        { name: 'name', type: 'text', required: true },
        { name: 'type', type: 'text' },
        { name: 'brand', type: 'text' },
        { name: 'quantity', type: 'number' },
        { name: 'cost', type: 'text' },
        { name: 'location', type: 'text' },
        { name: 'client', type: 'text' },
        { name: 'responsible_id', type: 'text' },
        { name: 'responsible_name', type: 'text' },
        { name: 'installation_date', type: 'text' },
        { name: 'return_date', type: 'text' },
        { name: 'photos', type: 'json' },
        { name: 'conservation_state', type: 'text' },
        { name: 'status', type: 'text' },
      ],
      [],
    )

    mk(
      'mk_giveaways',
      [
        { name: 'name', type: 'text', required: true },
        { name: 'brand', type: 'text' },
        { name: 'stock', type: 'number' },
        { name: 'unit_cost', type: 'text' },
        { name: 'entries', type: 'number' },
        { name: 'exits', type: 'number' },
        { name: 'campaign_id', type: 'text' },
        { name: 'action_id', type: 'text' },
        { name: 'recipient', type: 'text' },
        { name: 'responsible_id', type: 'text' },
        { name: 'responsible_name', type: 'text' },
        { name: 'balance', type: 'number' },
      ],
      [],
    )

    mk(
      'mk_events',
      [
        { name: 'name', type: 'text', required: true },
        { name: 'type', type: 'text' },
        { name: 'location', type: 'text' },
        { name: 'city', type: 'text' },
        { name: 'start_date', type: 'text' },
        { name: 'end_date', type: 'text' },
        { name: 'participants', type: 'json' },
        { name: 'sponsors', type: 'json' },
        { name: 'budget', type: 'text' },
        { name: 'costs', type: 'text' },
        { name: 'responsible_id', type: 'text' },
        { name: 'responsible_name', type: 'text' },
        { name: 'attachments', type: 'json' },
        { name: 'photos', type: 'json' },
        { name: 'results', type: 'json' },
      ],
      [],
    )

    mk(
      'mk_annual_plans',
      [
        { name: 'year', type: 'text', required: true },
        { name: 'brand', type: 'text' },
        { name: 'campaign_name', type: 'text' },
        { name: 'objective', type: 'text' },
        { name: 'budget_planned', type: 'text' },
        { name: 'budget_approved', type: 'text' },
        { name: 'committed', type: 'text' },
        { name: 'realized', type: 'text' },
        { name: 'start_period', type: 'text' },
        { name: 'end_period', type: 'text' },
        { name: 'responsible_id', type: 'text' },
        { name: 'responsible_name', type: 'text' },
        { name: 'result', type: 'text' },
        { name: 'balance', type: 'text' },
      ],
      ['CREATE INDEX idx_mk_ap_year ON mk_annual_plans (year)'],
    )

    mk(
      'mk_accountability',
      [
        { name: 'action_id', type: 'text' },
        { name: 'campaign_id', type: 'text' },
        { name: 'verba_id', type: 'text' },
        { name: 'objective', type: 'text' },
        { name: 'mechanic', type: 'text' },
        { name: 'start_date', type: 'text' },
        { name: 'end_date', type: 'text' },
        { name: 'results', type: 'json' },
        { name: 'indicators', type: 'json' },
        { name: 'photos', type: 'json' },
        { name: 'comprovantes', type: 'json' },
        { name: 'investment', type: 'text' },
        { name: 'roi', type: 'text' },
        { name: 'roi_id', type: 'text' },
        { name: 'comments', type: 'text' },
        { name: 'status', type: 'text' },
        { name: 'responsible_id', type: 'text' },
        { name: 'responsible_name', type: 'text' },
      ],
      ['CREATE INDEX idx_mk_acc_action ON mk_accountability (action_id)'],
    )

    mk(
      'mk_accountability_templates',
      [
        { name: 'name', type: 'text', required: true },
        { name: 'company', type: 'text' },
        { name: 'brand', type: 'text' },
        { name: 'action_type', type: 'text' },
        { name: 'cover_image', type: 'text' },
        { name: 'background', type: 'text' },
        { name: 'colors', type: 'json' },
        { name: 'logo', type: 'text' },
        { name: 'footer', type: 'text' },
        { name: 'blocks', type: 'json' },
        { name: 'active', type: 'bool' },
      ],
      [],
    )

    mk(
      'mk_social_planning',
      [
        {
          name: 'channel',
          type: 'select',
          values: ['Instagram', 'Facebook', 'LinkedIn', 'YouTube', 'TikTok', 'Outros'],
          maxSelect: 1,
        },
        { name: 'content', type: 'text' },
        { name: 'campaign_id', type: 'text' },
        { name: 'action_id', type: 'text' },
        { name: 'planned_date', type: 'text' },
        { name: 'published_date', type: 'text' },
        { name: 'responsible_id', type: 'text' },
        { name: 'responsible_name', type: 'text' },
        { name: 'status', type: 'text' },
        { name: 'attachments', type: 'json' },
        { name: 'links', type: 'json' },
      ],
      ['CREATE INDEX idx_mk_sp_date ON mk_social_planning (planned_date)'],
    )

    mk(
      'mk_digital_metrics',
      [
        { name: 'campaign_id', type: 'text' },
        { name: 'action_id', type: 'text' },
        { name: 'channel', type: 'text' },
        { name: 'period', type: 'text' },
        { name: 'reach', type: 'number' },
        { name: 'impressions', type: 'number' },
        { name: 'clicks', type: 'number' },
        { name: 'ctr', type: 'text' },
        { name: 'engagement', type: 'text' },
        { name: 'leads', type: 'number' },
        { name: 'conversions', type: 'number' },
        { name: 'cost', type: 'text' },
        { name: 'followers', type: 'number' },
        { name: 'source', type: 'text' },
      ],
      [],
    )

    mk(
      'mk_surveys',
      [
        { name: 'title', type: 'text', required: true },
        {
          name: 'type',
          type: 'select',
          values: ['satisfacao', 'evento', 'campanha', 'produto', 'treinamento', 'pdv'],
          maxSelect: 1,
        },
        { name: 'campaign_id', type: 'text' },
        { name: 'action_id', type: 'text' },
        { name: 'questions', type: 'json' },
        { name: 'answers', type: 'json' },
        { name: 'nps', type: 'number' },
        { name: 'results', type: 'json' },
        { name: 'active', type: 'bool' },
        { name: 'responsible_id', type: 'text' },
        { name: 'responsible_name', type: 'text' },
      ],
      [],
    )

    mk(
      'mk_competitor_intel',
      [
        { name: 'competitor', type: 'text', required: true },
        { name: 'brand', type: 'text' },
        { name: 'product', type: 'text' },
        { name: 'price', type: 'text' },
        { name: 'promotion', type: 'text' },
        { name: 'photo', type: 'text' },
        { name: 'region', type: 'text' },
        { name: 'client', type: 'text' },
        { name: 'date', type: 'text' },
        { name: 'observation', type: 'text' },
        { name: 'facts', type: 'text' },
        { name: 'opinions', type: 'text' },
        { name: 'responsible_id', type: 'text' },
        { name: 'responsible_name', type: 'text' },
      ],
      [],
    )

    mk(
      'mk_market_research',
      [
        { name: 'title', type: 'text', required: true },
        { name: 'sources', type: 'json' },
        { name: 'files', type: 'json' },
        { name: 'data', type: 'json' },
        { name: 'conclusions', type: 'text' },
        { name: 'responsible_id', type: 'text' },
        { name: 'responsible_name', type: 'text' },
        { name: 'period', type: 'text' },
      ],
      [],
    )

    mk(
      'mk_roi_calculations',
      [
        { name: 'campaign_id', type: 'text' },
        { name: 'action_id', type: 'text' },
        { name: 'investment', type: 'text' },
        { name: 'cost', type: 'text' },
        { name: 'related_sales', type: 'text' },
        { name: 'incremental_margin', type: 'text' },
        { name: 'result', type: 'text' },
        { name: 'roi', type: 'text' },
        {
          name: 'attribution_method',
          type: 'select',
          values: ['venda_vinculada', 'cliente_participante', 'produto_periodo_regiao'],
          maxSelect: 1,
          required: true,
        },
        { name: 'evidence', type: 'json' },
        { name: 'period', type: 'text' },
        { name: 'responsible_id', type: 'text' },
        { name: 'responsible_name', type: 'text' },
      ],
      ['CREATE INDEX idx_mk_roi_action ON mk_roi_calculations (action_id)'],
    )

    mk(
      'mk_budget_lines',
      [
        { name: 'campaign_id', type: 'text' },
        { name: 'action_id', type: 'text' },
        {
          name: 'type',
          type: 'select',
          values: ['forecast', 'approved', 'committed', 'realized'],
          maxSelect: 1,
        },
        { name: 'value', type: 'text' },
        { name: 'description', type: 'text' },
        { name: 'date', type: 'text' },
        { name: 'responsible_id', type: 'text' },
        { name: 'responsible_name', type: 'text' },
      ],
      ['CREATE INDEX idx_mk_bl_action ON mk_budget_lines (action_id)'],
    )

    var tmCol = app.findCollectionByNameOrId('trade_marketing_actions')
    if (!tmCol.fields.getByName('roi')) tmCol.fields.add(new TextField({ name: 'roi' }))
    if (!tmCol.fields.getByName('action_type_id'))
      tmCol.fields.add(new TextField({ name: 'action_type_id' }))
    if (!tmCol.fields.getByName('photos')) tmCol.fields.add(new JSONField({ name: 'photos' }))
    if (!tmCol.fields.getByName('participants'))
      tmCol.fields.add(new JSONField({ name: 'participants' }))
    app.save(tmCol)

    var types = [
      'Degustação',
      'Evento',
      'Encarte',
      'Tabloide',
      'Ponta de Gôndola',
      'Ilha Promocional',
      'Material de PDV',
      'Treinamento',
      'Convenção',
      'Lançamento',
      'Feira',
      'Patrocínio',
      'Influencer',
      'Rádio',
      'Mídia Digital',
      'Ativação',
      'Brinde',
      'Ação com RCA',
      'Ação com Gerente',
      'Campanha Promocional',
      'Campanha Digital',
      'Sell-in',
      'Sell-out',
    ]
    var atCol = app.findCollectionByNameOrId('mk_action_types')
    for (var i = 0; i < types.length; i++) {
      try {
        app.findFirstRecordByData('mk_action_types', 'name', types[i])
      } catch (_) {
        var rec = new Record(atCol)
        rec.set('name', types[i])
        rec.set('active', true)
        app.save(rec)
      }
    }
  },
  (app) => {
    var names = [
      'mk_action_types',
      'mk_materials',
      'mk_material_versions',
      'mk_pdv_assets',
      'mk_giveaways',
      'mk_events',
      'mk_annual_plans',
      'mk_accountability',
      'mk_accountability_templates',
      'mk_social_planning',
      'mk_digital_metrics',
      'mk_surveys',
      'mk_competitor_intel',
      'mk_market_research',
      'mk_roi_calculations',
      'mk_budget_lines',
    ]
    for (var i = 0; i < names.length; i++) {
      try {
        app.delete(app.findCollectionByNameOrId(names[i]))
      } catch (_) {}
    }
  },
)
