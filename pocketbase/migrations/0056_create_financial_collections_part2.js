migrate(
  (app) => {
    var R = "@request.auth.id != ''"
    var SA = "@request.auth.role = 'SUP'"
    var ad = [
      { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
      { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
    ]
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
          deleteRule: SA,
          fields: fields.concat(ad),
          indexes: indexes || [],
        }),
      )
    }
    function T(n) {
      return { name: n, type: 'text' }
    }
    function N(n) {
      return { name: n, type: 'number' }
    }
    function J(n) {
      return { name: n, type: 'json' }
    }
    function F(n) {
      return {
        name: n,
        type: 'file',
        maxSelect: 5,
        maxSize: 5242880,
        mimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
      }
    }

    mk(
      'financial_pix',
      [
        T('cliente'),
        T('titulo_id'),
        T('identificador_transacao'),
        T('chave_pix'),
        T('valor'),
        T('data_geracao'),
        T('data_vencimento'),
        T('data_pagamento'),
        T('status'),
        T('tipo_pix'),
        T('empresa'),
        T('filial'),
      ],
      ['CREATE INDEX idx_fin_pix_status ON financial_pix (status)'],
    )

    mk(
      'financial_collections',
      [
        T('cliente'),
        T('titulo_id'),
        T('valor_original'),
        T('valor_atualizado'),
        N('dias_atraso'),
        T('responsavel_cobranca'),
        T('ultimo_contato'),
        T('proxima_acao'),
        T('status'),
        J('historico'),
        T('observacoes'),
        J('documentos'),
        T('empresa'),
        T('filial'),
      ],
      ['CREATE INDEX idx_fin_col_status ON financial_collections (status)'],
    )

    mk(
      'financial_cash_registers',
      [
        T('nome_caixa'),
        T('empresa'),
        T('filial'),
        T('operador'),
        T('conta_financeira'),
        T('saldo_inicial'),
        T('saldo_final'),
        T('data_abertura'),
        T('data_fechamento'),
        T('status'),
        J('valores_forma_pagamento'),
        T('saldo_esperado'),
        T('saldo_contado'),
        T('diferenca'),
        T('justificativa'),
      ],
      ['CREATE INDEX idx_fin_cash_status ON financial_cash_registers (status)'],
    )

    mk(
      'financial_cash_movements',
      [
        T('cash_register_id'),
        T('tipo_movimento'),
        T('valor'),
        T('forma_pagamento'),
        T('documento'),
        T('observacoes'),
        T('data_hora'),
        T('operador'),
      ],
      ['CREATE INDEX idx_fin_cashmov_reg ON financial_cash_movements (cash_register_id)'],
    )

    mk(
      'financial_approvals',
      [
        T('tipo_solicitacao'),
        T('solicitante'),
        T('aprovador'),
        T('data_hora'),
        T('valor'),
        T('motivo'),
        T('decisao'),
        T('justificativa'),
        T('status'),
        T('documento_relacionado'),
        T('empresa'),
        T('filial'),
      ],
      ['CREATE INDEX idx_fin_appr_status ON financial_approvals (status)'],
    )

    mk(
      'financial_closings',
      [
        T('tipo_fechamento'),
        T('periodo'),
        T('empresa'),
        T('filial'),
        T('conta_bancaria'),
        T('caixa_id'),
        T('data_fechamento'),
        T('responsavel'),
        T('status'),
        T('justificativa_reabertura'),
        J('resumo'),
      ],
      ['CREATE INDEX idx_fin_close_status ON financial_closings (status)'],
    )

    mk(
      'financial_reconciliation',
      [
        T('data'),
        T('descricao_bancaria'),
        T('documento'),
        T('valor'),
        T('tipo'),
        T('lancamento_correspondente'),
        T('status'),
        T('conta_bancaria'),
        T('divergencia'),
      ],
      ['CREATE INDEX idx_fin_recon_status ON financial_reconciliation (status)'],
    )

    mk(
      'financial_bank_statements',
      [
        T('conta_bancaria'),
        T('data'),
        T('descricao'),
        T('documento'),
        T('valor'),
        T('tipo'),
        { name: 'conciliado', type: 'bool' },
        T('reconciliation_id'),
        T('arquivo_origem'),
      ],
      ['CREATE INDEX idx_fin_bankstmt_conc ON financial_bank_statements (conciliado)'],
    )
  },
  (app) => {
    var cols = [
      'financial_pix',
      'financial_collections',
      'financial_cash_registers',
      'financial_cash_movements',
      'financial_approvals',
      'financial_closings',
      'financial_reconciliation',
      'financial_bank_statements',
    ]
    for (var i = 0; i < cols.length; i++) {
      try {
        app.delete(app.findCollectionByNameOrId(cols[i]))
      } catch (_) {}
    }
  },
)
