migrate(
  (app) => {
    var R = "@request.auth.id != ''"
    var RS = "@request.auth.role = 'SUP'"
    var A = [
      new AutodateField({ name: 'created', onCreate: true, onUpdate: false }),
      new AutodateField({ name: 'updated', onCreate: true, onUpdate: true }),
    ]
    function T(n) {
      return new TextField({ name: n })
    }
    function N(n) {
      return new NumberField({ name: n })
    }
    function B(n) {
      return new BoolField({ name: n })
    }
    function J(n) {
      return new JSONField({ name: n })
    }
    function S(n, v) {
      return new SelectField({ name: n, values: v, maxSelect: 1 })
    }
    function F(n) {
      return new FileField({
        name: n,
        maxSelect: 5,
        maxSize: 5242880,
        mimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
      })
    }
    function mk(name, fields, indexes) {
      try {
        app.findCollectionByNameOrId(name)
        return
      } catch (_) {}
      app.save(
        new Collection({
          name: name,
          type: 'base',
          listRule: R,
          viewRule: R,
          createRule: R,
          updateRule: R,
          deleteRule: RS,
          fields: fields.concat(A),
          indexes: indexes || [],
        }),
      )
    }

    var pc = app.findCollectionByNameOrId('plano_contas')
    if (!pc.fields.getByName('nivel')) pc.fields.add(new NumberField({ name: 'nivel' }))
    if (!pc.fields.getByName('grupo'))
      pc.fields.add(
        new SelectField({
          name: 'grupo',
          values: [
            'Ativo',
            'Passivo',
            'Patrimônio Líquido',
            'Receitas',
            'Custos',
            'Despesas',
            'Contas de Compensação',
          ],
          maxSelect: 1,
        }),
      )
    if (!pc.fields.getByName('tipo_conta')) pc.fields.add(new TextField({ name: 'tipo_conta' }))
    if (!pc.fields.getByName('exige_centro_custo'))
      pc.fields.add(new BoolField({ name: 'exige_centro_custo' }))
    if (!pc.fields.getByName('exige_projeto'))
      pc.fields.add(new BoolField({ name: 'exige_projeto' }))
    if (!pc.fields.getByName('conta_referencial'))
      pc.fields.add(new TextField({ name: 'conta_referencial' }))
    if (!pc.fields.getByName('situacao'))
      pc.fields.add(
        new SelectField({ name: 'situacao', values: ['Ativo', 'Inativo'], maxSelect: 1 }),
      )
    app.save(pc)

    var cc = app.findCollectionByNameOrId('centros_custo')
    if (!cc.fields.getByName('parent_code')) cc.fields.add(new TextField({ name: 'parent_code' }))
    if (!cc.fields.getByName('departamento')) cc.fields.add(new TextField({ name: 'departamento' }))
    app.save(cc)

    mk(
      'contabil_lancamentos',
      [
        T('numero_lancamento'),
        T('data_lancamento'),
        T('data_competencia'),
        T('empresa'),
        T('filial'),
        T('historico'),
        T('documento_origem'),
        T('numero_documento'),
        T('conta_debito'),
        T('conta_credito'),
        T('valor'),
        T('centro_custo'),
        T('projeto'),
        T('departamento'),
        T('filial_origem'),
        T('observacoes'),
        F('anexos'),
        J('partidas'),
        S('status', [
          'Rascunho',
          'Aguardando Conferência',
          'Aguardando Aprovação',
          'Contabilizado',
          'Estornado',
          'Cancelado',
        ]),
        T('origem'),
        T('lote_id'),
        T('estorno_de'),
        T('usuario_responsavel'),
        T('justificativa'),
        T('total_debitos'),
        T('total_creditos'),
      ],
      [
        'CREATE INDEX idx_contabil_lanc_status ON contabil_lancamentos (status)',
        'CREATE INDEX idx_contabil_lanc_compet ON contabil_lancamentos (data_competencia)',
        'CREATE INDEX idx_contabil_lanc_empresa ON contabil_lancamentos (empresa)',
        'CREATE INDEX idx_contabil_lanc_conta ON contabil_lancamentos (conta_debito)',
      ],
    )

    mk(
      'contabil_lotes',
      [
        T('numero_lote'),
        T('descricao'),
        T('empresa'),
        T('filial'),
        T('periodo'),
        T('origem'),
        N('quantidade_lancamentos'),
        T('total_debitos'),
        T('total_creditos'),
        T('responsavel'),
        S('status', [
          'Em Digitação',
          'Aguardando Conferência',
          'Aguardando Aprovação',
          'Processado',
          'Com Divergência',
          'Cancelado',
        ]),
        T('justificativa'),
      ],
      [
        'CREATE INDEX idx_contabil_lotes_status ON contabil_lotes (status)',
        'CREATE INDEX idx_contabil_lotes_periodo ON contabil_lotes (periodo)',
      ],
    )

    mk(
      'contabil_integration_rules',
      [
        S('tipo_operacao', [
          'Venda faturada',
          'Recebimento de cliente',
          'Compra de mercadoria',
          'Pagamento de fornecedor',
          'Entrada de estoque',
          'Baixa de estoque',
          'Impostos sobre vendas',
          'Impostos a recuperar',
          'Comissão a pagar',
          'Depreciação',
          'Provisão',
          'Estorno',
        ]),
        T('conta_debito'),
        T('conta_credito'),
        T('historico_padrao'),
        T('centro_custo'),
        T('projeto'),
        T('empresa'),
        T('filial'),
        T('data_competencia'),
        B('ativo'),
        T('observacoes'),
      ],
      ['CREATE INDEX idx_contabil_rules_tipo ON contabil_integration_rules (tipo_operacao)'],
    )

    mk(
      'contabil_pending_integrations',
      [
        T('data'),
        T('modulo_origem'),
        T('documento'),
        T('tipo_operacao'),
        T('valor'),
        T('motivo_pendencia'),
        S('status', ['Pendente', 'Processado', 'Ignorado']),
        T('origem_id'),
        T('justificativa'),
      ],
      ['CREATE INDEX idx_contabil_pend_status ON contabil_pending_integrations (status)'],
    )

    mk(
      'contabil_reconciliations',
      [
        T('conta_contabil'),
        T('saldo_contabil'),
        T('saldo_modulo_origem'),
        T('diferenca'),
        S('status', ['Pendente', 'Conciliado', 'Com Divergência', 'Ajustado', 'Ignorado']),
        T('modulo_origem'),
        T('periodo'),
        T('empresa'),
        T('filial'),
        T('justificativa'),
        F('anexos'),
      ],
      ['CREATE INDEX idx_contabil_recon_status ON contabil_reconciliations (status)'],
    )

    mk(
      'contabil_provisions',
      [
        T('descricao'),
        T('valor_total'),
        T('data_inicial'),
        T('data_final'),
        N('quantidade_parcelas'),
        T('conta_debito'),
        T('conta_credito'),
        T('centro_custo'),
        T('projeto'),
        S('periodicidade', ['Mensal', 'Trimestral', 'Semestral', 'Anual']),
        S('tipo', [
          'Provisão',
          'Apropriação',
          'Diferimento',
          'Despesa Antecipada',
          'Receita Antecipada',
        ]),
        S('status', ['Ativo', 'Inativo', 'Concluído']),
        T('empresa'),
        T('filial'),
        N('parcelas_geradas'),
      ],
      ['CREATE INDEX idx_contabil_prov_status ON contabil_provisions (status)'],
    )

    mk(
      'contabil_periods',
      [
        T('periodo'),
        T('empresa'),
        T('filial'),
        T('data_inicial'),
        T('data_final'),
        S('status', ['Aberto', 'Em Conferência', 'Aguardando Aprovação', 'Fechado', 'Reaberto']),
        T('responsavel'),
        T('justificativa'),
        J('checklist'),
        T('data_fechamento'),
      ],
      [
        'CREATE INDEX idx_contabil_per_status ON contabil_periods (status)',
        'CREATE INDEX idx_contabil_per_periodo ON contabil_periods (periodo)',
      ],
    )

    mk(
      'contabil_fiscal_years',
      [
        T('ano'),
        T('empresa'),
        T('data_inicial'),
        T('data_final'),
        S('status', ['Planejado', 'Aberto', 'Em Encerramento', 'Encerrado']),
        T('responsavel'),
        T('justificativa'),
      ],
      ['CREATE INDEX idx_contabil_fy_status ON contabil_fiscal_years (status)'],
    )

    mk(
      'contabil_dre_config',
      [
        S('grupo', [
          'Receita Bruta',
          'Deduções da Receita',
          'Receita Líquida',
          'Custos',
          'Lucro Bruto',
          'Despesas Operacionais',
          'Resultado Operacional',
          'Receitas Financeiras',
          'Despesas Financeiras',
          'Resultado antes dos Tributos',
          'Tributos sobre o Resultado',
          'Lucro ou Prejuízo Líquido',
        ]),
        T('descricao'),
        J('contas'),
        N('ordem'),
        S('natureza', ['Devedora', 'Credora']),
        T('empresa'),
        B('ativo'),
      ],
      ['CREATE INDEX idx_contabil_dre_grupo ON contabil_dre_config (grupo)'],
    )

    mk(
      'contabil_balance_sheet_config',
      [
        S('grupo', [
          'Ativo Circulante',
          'Ativo Não Circulante',
          'Passivo Circulante',
          'Passivo Não Circulante',
          'Patrimônio Líquido',
        ]),
        T('descricao'),
        J('contas'),
        N('ordem'),
        S('natureza', ['Devedora', 'Credora']),
        T('empresa'),
        B('ativo'),
      ],
      ['CREATE INDEX idx_contabil_bs_grupo ON contabil_balance_sheet_config (grupo)'],
    )
  },
  (app) => {
    var cols = [
      'contabil_lancamentos',
      'contabil_lotes',
      'contabil_integration_rules',
      'contabil_pending_integrations',
      'contabil_reconciliations',
      'contabil_provisions',
      'contabil_periods',
      'contabil_fiscal_years',
      'contabil_dre_config',
      'contabil_balance_sheet_config',
    ]
    for (var i = 0; i < cols.length; i++) {
      try {
        app.delete(app.findCollectionByNameOrId(cols[i]))
      } catch (_) {}
    }
  },
)
