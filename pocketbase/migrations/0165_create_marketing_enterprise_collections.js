migrate(
  (app) => {
    function mk(name, fields, indexes) {
      var col = new Collection({
        name: name,
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.role = 'SUP'",
        fields: fields.concat([
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ]),
        indexes: indexes || [],
      })
      app.save(col)
      return col
    }

    mk(
      'mk_requests',
      [
        { name: 'request_number', type: 'text' },
        { name: 'title', type: 'text', required: true },
        {
          name: 'type',
          type: 'select',
          values: [
            'campanha',
            'arte',
            'material',
            'evento',
            'midia',
            'comunicacao',
            'conteudo',
            'landing_page',
            'acao_promocional',
            'apoio_comercial',
            'acao_interna',
            'acao_marca',
          ],
          maxSelect: 1,
        },
        { name: 'requester', type: 'text' },
        { name: 'requester_id', type: 'text' },
        { name: 'area', type: 'text' },
        { name: 'company', type: 'text' },
        { name: 'branch', type: 'text' },
        { name: 'objective', type: 'text' },
        { name: 'briefing', type: 'text' },
        {
          name: 'priority',
          type: 'select',
          values: ['baixa', 'normal', 'alta', 'urgente', 'critica'],
          maxSelect: 1,
        },
        { name: 'deadline', type: 'text' },
        { name: 'budget', type: 'text' },
        { name: 'audience', type: 'text' },
        { name: 'channel', type: 'text' },
        { name: 'responsible_id', type: 'text' },
        { name: 'responsible_name', type: 'text' },
        { name: 'attachments', type: 'json' },
        { name: 'status', type: 'text' },
        { name: 'campaign_id', type: 'text' },
        { name: 'job_id', type: 'text' },
        { name: 'checklist', type: 'json' },
        { name: 'workflow_id', type: 'text' },
      ],
      [
        'CREATE INDEX idx_mk_req_status ON mk_requests (status)',
        'CREATE INDEX idx_mk_req_type ON mk_requests (type)',
      ],
    )

    mk(
      'mk_briefing_templates',
      [
        { name: 'name', type: 'text', required: true },
        { name: 'type', type: 'text' },
        { name: 'objective', type: 'text' },
        { name: 'audience', type: 'text' },
        { name: 'message', type: 'text' },
        { name: 'product', type: 'text' },
        { name: 'brand', type: 'text' },
        { name: 'channel', type: 'text' },
        { name: 'region', type: 'text' },
        { name: 'period', type: 'text' },
        { name: 'budget', type: 'text' },
        { name: 'deliverables', type: 'json' },
        { name: 'references', type: 'json' },
        { name: 'restrictions', type: 'text' },
        { name: 'approvers', type: 'json' },
        { name: 'active', type: 'bool' },
      ],
      [],
    )

    mk(
      'mk_jobs',
      [
        { name: 'job_number', type: 'text' },
        { name: 'title', type: 'text', required: true },
        { name: 'campaign_id', type: 'text' },
        { name: 'request_id', type: 'text' },
        {
          name: 'type',
          type: 'select',
          values: [
            'arte',
            'video',
            'fotografia',
            'landing_page',
            'email',
            'midia',
            'impressao',
            'evento',
            'material_pdv',
            'conteudo_social',
          ],
          maxSelect: 1,
        },
        { name: 'description', type: 'text' },
        { name: 'responsible_id', type: 'text' },
        { name: 'responsible_name', type: 'text' },
        { name: 'deadline', type: 'text' },
        {
          name: 'priority',
          type: 'select',
          values: ['baixa', 'normal', 'alta', 'urgente', 'critica'],
          maxSelect: 1,
        },
        {
          name: 'status',
          type: 'select',
          values: [
            'briefing',
            'producao',
            'revisao',
            'aprovacao',
            'programacao',
            'publicacao',
            'resultado',
            'encerrado',
            'cancelado',
          ],
          maxSelect: 1,
        },
        { name: 'version', type: 'number' },
        { name: 'checklist', type: 'json' },
        { name: 'attachments', type: 'json' },
        { name: 'approvers', type: 'json' },
        { name: 'supplier_id', type: 'text' },
        { name: 'supplier_name', type: 'text' },
        { name: 'cost', type: 'text' },
        { name: 'company', type: 'text' },
        { name: 'branch', type: 'text' },
        { name: 'created_by', type: 'text' },
        { name: 'created_by_name', type: 'text' },
      ],
      [
        'CREATE INDEX idx_mk_job_status ON mk_jobs (status)',
        'CREATE INDEX idx_mk_job_campaign ON mk_jobs (campaign_id)',
      ],
    )

    mk(
      'mk_content_pieces',
      [
        { name: 'title', type: 'text', required: true },
        { name: 'job_id', type: 'text' },
        { name: 'campaign_id', type: 'text' },
        {
          name: 'type',
          type: 'select',
          values: [
            'post',
            'video',
            'banner',
            'anuncio',
            'email',
            'apresentacao',
            'folder',
            'catalogo',
            'landing_page',
            'material_pdv',
          ],
          maxSelect: 1,
        },
        { name: 'description', type: 'text' },
        {
          name: 'status',
          type: 'select',
          values: [
            'criacao',
            'revisao_marketing',
            'compliance',
            'gestor',
            'aprovado',
            'publicado',
            'reprovado',
          ],
          maxSelect: 1,
        },
        { name: 'current_version', type: 'number' },
        { name: 'channel', type: 'text' },
        { name: 'responsible_id', type: 'text' },
        { name: 'responsible_name', type: 'text' },
        { name: 'needs_compliance', type: 'bool' },
        { name: 'approver_id', type: 'text' },
        { name: 'approver_name', type: 'text' },
        { name: 'approved_at', type: 'text' },
        { name: 'published_at', type: 'text' },
        { name: 'rejection_reason', type: 'text' },
        { name: 'file_url', type: 'text' },
        { name: 'attachments', type: 'json' },
        { name: 'company', type: 'text' },
        { name: 'branch', type: 'text' },
      ],
      [
        'CREATE INDEX idx_mk_cp_status ON mk_content_pieces (status)',
        'CREATE INDEX idx_mk_cp_job ON mk_content_pieces (job_id)',
      ],
    )

    mk(
      'mk_content_versions',
      [
        { name: 'piece_id', type: 'text', required: true },
        { name: 'version', type: 'number' },
        { name: 'author', type: 'text' },
        { name: 'author_id', type: 'text' },
        { name: 'date', type: 'text' },
        { name: 'time', type: 'text' },
        { name: 'change_reason', type: 'text' },
        { name: 'approver', type: 'text' },
        { name: 'status', type: 'text' },
        { name: 'file_url', type: 'text' },
        { name: 'notes', type: 'text' },
      ],
      ['CREATE INDEX idx_mk_cv_piece ON mk_content_versions (piece_id)'],
    )

    mk(
      'mk_brand_assets',
      [
        { name: 'name', type: 'text', required: true },
        { name: 'brand', type: 'text' },
        {
          name: 'category',
          type: 'select',
          values: [
            'logo',
            'manual',
            'guideline',
            'cor',
            'template',
            'apresentacao',
            'foto',
            'video',
            'catalogo',
            'arte_anterior',
          ],
          maxSelect: 1,
        },
        { name: 'version', type: 'text' },
        { name: 'validity', type: 'text' },
        { name: 'responsible_id', type: 'text' },
        { name: 'responsible_name', type: 'text' },
        { name: 'tags', type: 'json' },
        { name: 'permissions', type: 'json' },
        { name: 'file_url', type: 'text' },
        { name: 'description', type: 'text' },
        { name: 'active', type: 'bool' },
      ],
      ['CREATE INDEX idx_mk_ba_brand ON mk_brand_assets (brand)'],
    )

    mk(
      'mk_media_campaigns',
      [
        { name: 'name', type: 'text', required: true },
        { name: 'campaign_id', type: 'text' },
        {
          name: 'channel',
          type: 'select',
          values: ['google', 'meta', 'linkedin', 'tiktok', 'youtube', 'outros'],
          maxSelect: 1,
        },
        { name: 'type', type: 'select', values: ['paga', 'organica'], maxSelect: 1 },
        { name: 'budget', type: 'text' },
        { name: 'investment', type: 'text' },
        { name: 'start_date', type: 'text' },
        { name: 'end_date', type: 'text' },
        { name: 'agency', type: 'text' },
        { name: 'supplier_id', type: 'text' },
        { name: 'supplier_name', type: 'text' },
        { name: 'objective', type: 'text' },
        { name: 'impressions', type: 'number' },
        { name: 'clicks', type: 'number' },
        { name: 'leads', type: 'number' },
        { name: 'conversions', type: 'number' },
        { name: 'cost', type: 'text' },
        { name: 'roi', type: 'text' },
        { name: 'company', type: 'text' },
        { name: 'branch', type: 'text' },
        { name: 'responsible_id', type: 'text' },
        { name: 'responsible_name', type: 'text' },
      ],
      ['CREATE INDEX idx_mk_mc_channel ON mk_media_campaigns (channel)'],
    )

    mk(
      'mk_result_attributions',
      [
        { name: 'campaign_id', type: 'text' },
        { name: 'campaign_name', type: 'text' },
        { name: 'source', type: 'text' },
        { name: 'channel', type: 'text' },
        { name: 'lead_id', type: 'text' },
        { name: 'lead_name', type: 'text' },
        { name: 'opportunity_id', type: 'text' },
        { name: 'order_id', type: 'text' },
        { name: 'order_number', type: 'text' },
        { name: 'invoice_id', type: 'text' },
        { name: 'revenue', type: 'text' },
        {
          name: 'attribution_method',
          type: 'select',
          values: ['direta', 'correlacionada', 'estimada'],
          maxSelect: 1,
        },
        { name: 'period', type: 'text' },
        { name: 'company', type: 'text' },
        { name: 'responsible_name', type: 'text' },
      ],
      ['CREATE INDEX idx_mk_ra_campaign ON mk_result_attributions (campaign_id)'],
    )

    mk(
      'mk_social_posts',
      [
        { name: 'campaign_id', type: 'text' },
        {
          name: 'channel',
          type: 'select',
          values: ['Instagram', 'Facebook', 'LinkedIn', 'YouTube', 'TikTok', 'Outros'],
          maxSelect: 1,
        },
        { name: 'format', type: 'text' },
        { name: 'content', type: 'text' },
        { name: 'responsible_id', type: 'text' },
        { name: 'responsible_name', type: 'text' },
        { name: 'planned_date', type: 'text' },
        { name: 'planned_time', type: 'text' },
        { name: 'published_date', type: 'text' },
        { name: 'audience', type: 'text' },
        { name: 'objective', type: 'text' },
        { name: 'status', type: 'text' },
        { name: 'attachments', type: 'json' },
        { name: 'piece_id', type: 'text' },
      ],
      ['CREATE INDEX idx_mk_sp_planned ON mk_social_posts (planned_date)'],
    )

    var seeds = [
      {
        col: 'mk_briefing_templates',
        data: [
          {
            name: 'Campanha Promocional',
            type: 'campanha',
            objective: 'Aumentar vendas',
            audience: 'Consumidor final',
            message: 'Promoção especial',
            deliverables: ['Arte digital', 'Material PDV'],
            references: [],
            restrictions: '',
            approvers: [],
            active: true,
          },
          {
            name: 'Conteúdo Social',
            type: 'conteudo',
            objective: 'Engajamento',
            audience: 'Seguidores',
            message: 'Educar e informar',
            deliverables: ['Post carrossel', 'Stories'],
            references: [],
            restrictions: '',
            approvers: [],
            active: true,
          },
          {
            name: 'Landing Page',
            type: 'landing_page',
            objective: 'Geração de leads',
            audience: 'B2B',
            message: 'Conversão',
            deliverables: ['Landing page', 'Formulário'],
            references: [],
            restrictions: '',
            approvers: [],
            active: true,
          },
        ],
      },
    ]

    for (var i = 0; i < seeds.length; i++) {
      var s = seeds[i]
      for (var j = 0; j < s.data.length; j++) {
        try {
          app.findFirstRecordByData(s.col, 'name', s.data[j].name)
        } catch (_) {
          var c = app.findCollectionByNameOrId(s.col)
          var r = new Record(c)
          var keys = Object.keys(s.data[j])
          for (var k = 0; k < keys.length; k++) r.set(keys[k], s.data[j][keys[k]])
          app.save(r)
        }
      }
    }
  },
  (app) => {
    var names = [
      'mk_requests',
      'mk_briefing_templates',
      'mk_jobs',
      'mk_content_pieces',
      'mk_content_versions',
      'mk_brand_assets',
      'mk_media_campaigns',
      'mk_result_attributions',
      'mk_social_posts',
    ]
    for (var i = 0; i < names.length; i++) {
      try {
        app.delete(app.findCollectionByNameOrId(names[i]))
      } catch (_) {}
    }
  },
)
