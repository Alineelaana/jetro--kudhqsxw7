migrate(
  (app) => {
    function stdCol(name, fields, indexes) {
      var allFields = fields.concat([
        { name: 'active', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ])
      app.save(
        new Collection({
          name: name,
          type: 'base',
          listRule: "@request.auth.id != ''",
          viewRule: "@request.auth.id != ''",
          createRule: "@request.auth.id != ''",
          updateRule: "@request.auth.id != ''",
          deleteRule: "@request.auth.role = 'SUP'",
          fields: allFields,
          indexes: indexes || [],
        }),
      )
    }
    function logCol(name, fields, indexes) {
      var allFields = fields.concat([
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ])
      app.save(
        new Collection({
          name: name,
          type: 'base',
          listRule: "@request.auth.id != ''",
          viewRule: "@request.auth.id != ''",
          createRule: "@request.auth.id != ''",
          updateRule: "@request.auth.role = 'SUP'",
          deleteRule: "@request.auth.role = 'SUP'",
          fields: allFields,
          indexes: indexes || [],
        }),
      )
    }

    var empCol = app.findCollectionByNameOrId('empresas')
    var empNew = [
      'regime_tributario',
      'site',
      'responsavel_legal',
      'contador',
      'moeda_padrao',
      'fuso_horario',
      'formato_data',
    ]
    for (var i = 0; i < empNew.length; i++) {
      if (!empCol.fields.getByName(empNew[i])) empCol.fields.add(new TextField({ name: empNew[i] }))
    }
    app.save(empCol)

    var notifCol = app.findCollectionByNameOrId('notifications')
    var oldType = notifCol.fields.getByName('type')
    if (oldType) notifCol.fields.remove(oldType)
    notifCol.fields.add(
      new SelectField({
        name: 'type',
        required: true,
        maxSelect: 1,
        values: [
          'budget_created',
          'budget_saved',
          'stock_low',
          'price_below_cost',
          'approval_pending',
          'account_due',
          'document_expiring',
          'order_delayed',
          'delivery_delayed',
          'negative_margin',
          'integration_error',
          'certificate_expiring',
          'processing_failure',
          'other',
        ],
      }),
    )
    app.save(notifCol)

    stdCol(
      'system_parameters',
      [
        { name: 'module', type: 'text', required: true },
        { name: 'key', type: 'text', required: true },
        { name: 'label', type: 'text', required: true },
        { name: 'value', type: 'text' },
        { name: 'previous_value', type: 'text' },
        {
          name: 'value_type',
          type: 'select',
          maxSelect: 1,
          values: ['text', 'number', 'boolean', 'select', 'json'],
        },
        { name: 'options', type: 'json' },
        { name: 'company', type: 'text' },
        { name: 'branch', type: 'text' },
        { name: 'changed_by', type: 'text' },
        { name: 'change_reason', type: 'text' },
      ],
      [
        'CREATE INDEX idx_sysparams_module ON system_parameters (module)',
        'CREATE INDEX idx_sysparams_key ON system_parameters (key)',
      ],
    )

    stdCol(
      'integrations',
      [
        { name: 'name', type: 'text', required: true },
        { name: 'type', type: 'text', required: true },
        { name: 'company', type: 'text' },
        { name: 'branch', type: 'text' },
        {
          name: 'environment',
          type: 'select',
          maxSelect: 1,
          values: ['producao', 'homologacao', 'sandbox'],
        },
        { name: 'credentials', type: 'json' },
        {
          name: 'status',
          type: 'select',
          maxSelect: 1,
          values: ['ativa', 'inativa', 'em_configuracao', 'com_erro', 'bloqueada'],
        },
        { name: 'last_sync_at', type: 'text' },
        { name: 'last_sync_result', type: 'text' },
        { name: 'responsible', type: 'text' },
        { name: 'observations', type: 'text' },
      ],
      [
        'CREATE INDEX idx_integrations_type ON integrations (type)',
        'CREATE INDEX idx_integrations_status ON integrations (status)',
      ],
    )

    logCol(
      'integration_logs',
      [
        { name: 'integration_id', type: 'text', required: true },
        { name: 'integration_name', type: 'text' },
        { name: 'started_at', type: 'text' },
        { name: 'finished_at', type: 'text' },
        { name: 'result', type: 'text' },
        { name: 'errors', type: 'text' },
        {
          name: 'status',
          type: 'select',
          maxSelect: 1,
          values: ['sucesso', 'erro', 'em_andamento'],
        },
      ],
      ['CREATE INDEX idx_intlog_integration ON integration_logs (integration_id)'],
    )

    stdCol(
      'api_credentials',
      [
        { name: 'app_name', type: 'text', required: true },
        { name: 'api_key', type: 'text', required: true },
        { name: 'api_secret', type: 'text', required: true },
        { name: 'company', type: 'text' },
        { name: 'branch', type: 'text' },
        { name: 'permissions', type: 'json' },
        { name: 'expires_at', type: 'text' },
        { name: 'rate_limit', type: 'number' },
        {
          name: 'status',
          type: 'select',
          maxSelect: 1,
          values: ['ativa', 'inativa', 'expirada', 'revogada', 'bloqueada'],
        },
        { name: 'last_used_at', type: 'text' },
        { name: 'request_count', type: 'number' },
      ],
      ['CREATE INDEX idx_apicred_status ON api_credentials (status)'],
    )

    logCol(
      'api_request_logs',
      [
        { name: 'app_name', type: 'text' },
        { name: 'endpoint', type: 'text' },
        { name: 'user_or_key', type: 'text' },
        { name: 'ip_address', type: 'text' },
        { name: 'result', type: 'text' },
        { name: 'response_code', type: 'number' },
      ],
      [
        'CREATE INDEX idx_apireqlog_app ON api_request_logs (app_name)',
        'CREATE INDEX idx_apireqlog_created ON api_request_logs (created)',
      ],
    )

    stdCol(
      'email_templates',
      [
        { name: 'name', type: 'text', required: true },
        {
          name: 'category',
          type: 'select',
          maxSelect: 1,
          values: [
            'pedido_venda',
            'pedido_compra',
            'proposta',
            'boleto',
            'pix',
            'cobranca',
            'nota_fiscal',
            'contrato',
            'entrega',
            'aprovacao',
            'rh',
            'suporte',
            'outros',
          ],
        },
        { name: 'subject', type: 'text' },
        { name: 'sender', type: 'text' },
        { name: 'body', type: 'text' },
        { name: 'signature', type: 'text' },
        { name: 'default_attachments', type: 'text' },
        { name: 'company', type: 'text' },
        { name: 'branch', type: 'text' },
      ],
      ['CREATE INDEX idx_emailtpl_category ON email_templates (category)'],
    )

    stdCol(
      'document_templates',
      [
        { name: 'name', type: 'text', required: true },
        {
          name: 'category',
          type: 'select',
          maxSelect: 1,
          values: [
            'propostas',
            'pedidos',
            'contratos',
            'recibos',
            'orcamentos',
            'relatorios',
            'declaracoes',
            'termos',
            'avisos',
            'rh',
            'romaneios',
            'etiquetas',
            'outros',
          ],
        },
        { name: 'company', type: 'text' },
        { name: 'branch', type: 'text' },
        { name: 'header', type: 'text' },
        { name: 'body', type: 'text' },
        { name: 'footer', type: 'text' },
        {
          name: 'logo',
          type: 'file',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        },
        { name: 'signatures', type: 'text' },
        { name: 'page_numbering', type: 'bool' },
        { name: 'orientation', type: 'select', maxSelect: 1, values: ['retrato', 'paisagem'] },
        {
          name: 'paper_size',
          type: 'select',
          maxSelect: 1,
          values: ['a4', 'a3', 'carta', 'oficio'],
        },
        { name: 'is_default', type: 'bool' },
        { name: 'version_number', type: 'number' },
      ],
      ['CREATE INDEX idx_doctpl_category ON document_templates (category)'],
    )

    logCol(
      'document_template_versions',
      [
        { name: 'template_id', type: 'text', required: true },
        { name: 'template_name', type: 'text' },
        { name: 'version_data', type: 'json' },
        { name: 'version_number', type: 'number' },
        { name: 'created_by', type: 'text' },
      ],
      ['CREATE INDEX idx_doctplver_template ON document_template_versions (template_id)'],
    )

    stdCol(
      'notification_configs',
      [
        {
          name: 'event',
          type: 'select',
          maxSelect: 1,
          required: true,
          values: [
            'approval_pending',
            'account_due',
            'stock_low',
            'document_expiring',
            'order_delayed',
            'delivery_delayed',
            'negative_margin',
            'integration_error',
            'certificate_expiring',
            'processing_failure',
            'other',
          ],
        },
        { name: 'module', type: 'text' },
        { name: 'recipient_type', type: 'select', maxSelect: 1, values: ['user', 'profile'] },
        { name: 'recipient_id', type: 'text' },
        { name: 'recipient_profile', type: 'text' },
        {
          name: 'channel',
          type: 'select',
          maxSelect: 1,
          values: ['internal', 'email', 'whatsapp', 'dashboard'],
        },
        { name: 'deadline', type: 'text' },
        {
          name: 'frequency',
          type: 'select',
          maxSelect: 1,
          values: ['immediate', 'hourly', 'daily', 'weekly'],
        },
        { name: 'company', type: 'text' },
        { name: 'branch', type: 'text' },
      ],
      ['CREATE INDEX idx_notifcfg_event ON notification_configs (event)'],
    )

    stdCol(
      'numerations',
      [
        {
          name: 'document_type',
          type: 'select',
          maxSelect: 1,
          required: true,
          values: [
            'clientes',
            'fornecedores',
            'produtos',
            'pedidos_venda',
            'pedidos_compra',
            'ordens_producao',
            'titulos_financeiros',
            'contratos',
            'propostas',
            'romaneios',
            'entregas',
            'chamados',
            'outros',
          ],
        },
        { name: 'company', type: 'text' },
        { name: 'branch', type: 'text' },
        { name: 'prefix', type: 'text' },
        { name: 'next_number', type: 'number' },
        { name: 'digit_count', type: 'number' },
        { name: 'annual_reset', type: 'bool' },
      ],
      [
        "CREATE UNIQUE INDEX idx_numerations_unique ON numerations (document_type, company, branch, prefix) WHERE document_type != ''",
      ],
    )

    stdCol(
      'security_config',
      [
        { name: 'key', type: 'text', required: true },
        { name: 'value', type: 'text' },
        { name: 'previous_value', type: 'text' },
        { name: 'company', type: 'text' },
        { name: 'branch', type: 'text' },
        { name: 'changed_by', type: 'text' },
        { name: 'change_reason', type: 'text' },
      ],
      ['CREATE UNIQUE INDEX idx_seccfg_key ON security_config (key)'],
    )

    logCol(
      'import_export_history',
      [
        {
          name: 'operation',
          type: 'select',
          maxSelect: 1,
          required: true,
          values: ['import', 'export'],
        },
        { name: 'entity', type: 'text', required: true },
        { name: 'format', type: 'select', maxSelect: 1, values: ['excel', 'csv', 'pdf', 'xml'] },
        { name: 'file_name', type: 'text' },
        { name: 'total_records', type: 'number' },
        { name: 'valid_records', type: 'number' },
        { name: 'error_records', type: 'number' },
        { name: 'duplicate_records', type: 'number' },
        { name: 'updated_records', type: 'number' },
        { name: 'created_records', type: 'number' },
        {
          name: 'status',
          type: 'select',
          maxSelect: 1,
          values: ['pending', 'processing', 'completed', 'error'],
        },
        { name: 'user_name', type: 'text' },
      ],
      [
        'CREATE INDEX idx_iexphist_op ON import_export_history (operation)',
        'CREATE INDEX idx_iexphist_created ON import_export_history (created)',
      ],
    )

    var secCol = app.findCollectionByNameOrId('security_config')
    var secDefaults = [
      { key: 'password_min_length', value: '8' },
      { key: 'password_require_uppercase', value: 'true' },
      { key: 'password_require_lowercase', value: 'true' },
      { key: 'password_require_number', value: 'true' },
      { key: 'password_require_special', value: 'true' },
      { key: 'password_validity_days', value: '90' },
      { key: 'max_login_attempts', value: '5' },
      { key: 'session_timeout_minutes', value: '60' },
      { key: 'two_factor_auth', value: 'false' },
      { key: 'ip_restriction', value: 'false' },
      { key: 'allowed_ips', value: '' },
      { key: 'time_restriction', value: 'false' },
      { key: 'allowed_hours_start', value: '06:00' },
      { key: 'allowed_hours_end', value: '22:00' },
      { key: 'password_recovery_policy', value: 'email' },
    ]
    for (var j = 0; j < secDefaults.length; j++) {
      try {
        app.findFirstRecordByData('security_config', 'key', secDefaults[j].key)
      } catch (_) {
        var sRec = new Record(secCol)
        sRec.set('key', secDefaults[j].key)
        sRec.set('value', secDefaults[j].value)
        sRec.set('active', true)
        app.save(sRec)
      }
    }

    var numCol = app.findCollectionByNameOrId('numerations')
    var numDefaults = [
      { document_type: 'clientes', prefix: 'CLI', next_number: 1, digit_count: 6 },
      { document_type: 'fornecedores', prefix: 'FOR', next_number: 1, digit_count: 6 },
      { document_type: 'produtos', prefix: 'PRD', next_number: 1, digit_count: 6 },
      { document_type: 'pedidos_venda', prefix: 'PV', next_number: 1, digit_count: 6 },
      { document_type: 'pedidos_compra', prefix: 'PC', next_number: 1, digit_count: 6 },
      { document_type: 'contratos', prefix: 'CNT', next_number: 1, digit_count: 6 },
      { document_type: 'propostas', prefix: 'PPT', next_number: 1, digit_count: 6 },
    ]
    for (var k = 0; k < numDefaults.length; k++) {
      try {
        app.findFirstRecordByData('numerations', 'document_type', numDefaults[k].document_type)
      } catch (_) {
        var nRec = new Record(numCol)
        nRec.set('document_type', numDefaults[k].document_type)
        nRec.set('prefix', numDefaults[k].prefix)
        nRec.set('next_number', numDefaults[k].next_number)
        nRec.set('digit_count', numDefaults[k].digit_count)
        nRec.set('annual_reset', true)
        nRec.set('active', true)
        app.save(nRec)
      }
    }

    var paramCol = app.findCollectionByNameOrId('system_parameters')
    var paramDefaults = [
      {
        module: 'Vendas',
        key: 'max_discount',
        label: 'Desconto Máximo (%)',
        value: '10',
        value_type: 'number',
      },
      {
        module: 'Vendas',
        key: 'min_margin',
        label: 'Margem Mínima (%)',
        value: '15',
        value_type: 'number',
      },
      {
        module: 'Estoque',
        key: 'allow_negative_stock',
        label: 'Permitir Estoque Negativo',
        value: 'false',
        value_type: 'boolean',
      },
      {
        module: 'Estoque',
        key: 'auto_reserve',
        label: 'Reserva Automática de Estoque',
        value: 'true',
        value_type: 'boolean',
      },
      {
        module: 'Compras',
        key: 'require_approval',
        label: 'Exigir Aprovação',
        value: 'true',
        value_type: 'boolean',
      },
      {
        module: 'Cadastros',
        key: 'required_fields',
        label: 'Campos Obrigatórios',
        value: 'name,document',
        value_type: 'text',
      },
    ]
    for (var m = 0; m < paramDefaults.length; m++) {
      try {
        app.findFirstRecordByData('system_parameters', 'key', paramDefaults[m].key)
      } catch (_) {
        var pRec = new Record(paramCol)
        pRec.set('module', paramDefaults[m].module)
        pRec.set('key', paramDefaults[m].key)
        pRec.set('label', paramDefaults[m].label)
        pRec.set('value', paramDefaults[m].value)
        pRec.set('value_type', paramDefaults[m].value_type)
        pRec.set('active', true)
        app.save(pRec)
      }
    }
  },
  (app) => {
    var cols = [
      'system_parameters',
      'integrations',
      'integration_logs',
      'api_credentials',
      'api_request_logs',
      'email_templates',
      'document_templates',
      'document_template_versions',
      'notification_configs',
      'numerations',
      'security_config',
      'import_export_history',
    ]
    for (var i = 0; i < cols.length; i++) {
      try {
        app.delete(app.findCollectionByNameOrId(cols[i]))
      } catch (_) {}
    }
  },
)
