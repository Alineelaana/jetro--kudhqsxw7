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
      'financial_receivables',
      [
        T('numero_titulo'),
        T('cliente'),
        T('client_id'),
        T('empresa'),
        T('filial'),
        T('documento_origem'),
        T('numero_nota_fiscal'),
        T('numero_pedido'),
        T('data_emissao'),
        T('data_competencia'),
        T('data_vencimento'),
        T('valor_original'),
        T('desconto'),
        T('juros'),
        T('multa'),
        T('acrescimos'),
        T('valor_atualizado'),
        T('forma_recebimento'),
        T('conta_bancaria'),
        T('centro_custo'),
        T('plano_contas'),
        T('projeto'),
        T('vendedor'),
        T('observacoes'),
        T('status'),
        T('valor_recebido'),
        T('data_recebimento'),
        J('parcelas'),
        J('historico'),
        F('comprovante'),
      ],
      [
        'CREATE INDEX idx_fin_recv_status ON financial_receivables (status)',
        'CREATE INDEX idx_fin_recv_venc ON financial_receivables (data_vencimento)',
      ],
    )

    mk(
      'financial_payables',
      [
        T('numero_titulo'),
        T('fornecedor'),
        T('empresa'),
        T('filial'),
        T('documento_origem'),
        T('numero_nota_fiscal'),
        T('numero_pedido'),
        T('data_emissao'),
        T('data_competencia'),
        T('data_vencimento'),
        T('valor_original'),
        T('desconto'),
        T('juros'),
        T('multa'),
        T('acrescimos'),
        T('valor_atualizado'),
        T('forma_pagamento'),
        T('conta_bancaria'),
        T('centro_custo'),
        T('plano_contas'),
        T('projeto'),
        T('codigo_barras'),
        T('chave_pix'),
        T('observacoes'),
        T('status'),
        T('valor_pago'),
        T('data_pagamento'),
        J('historico'),
        F('anexos'),
      ],
      [
        'CREATE INDEX idx_fin_pay_status ON financial_payables (status)',
        'CREATE INDEX idx_fin_pay_venc ON financial_payables (data_vencimento)',
      ],
    )

    mk(
      'financial_movements',
      [
        T('data_hora'),
        T('tipo_movimentacao'),
        T('documento'),
        T('cliente_fornecedor'),
        T('conta'),
        T('entrada'),
        T('saida'),
        T('saldo'),
        T('centro_custo'),
        T('plano_contas'),
        T('usuario'),
        T('empresa'),
        T('filial'),
        T('observacoes'),
        T('projeto'),
        T('departamento'),
      ],
      [
        'CREATE INDEX idx_fin_mov_tipo ON financial_movements (tipo_movimentacao)',
        'CREATE INDEX idx_fin_mov_data ON financial_movements (data_hora)',
      ],
    )

    mk(
      'financial_transfers',
      [
        T('numero_transferencia'),
        T('data'),
        T('empresa_origem'),
        T('conta_origem'),
        T('empresa_destino'),
        T('conta_destino'),
        T('valor'),
        T('tarifa'),
        T('motivo'),
        T('responsavel'),
        T('observacoes'),
        T('status'),
        F('comprovante'),
      ],
      ['CREATE INDEX idx_fin_trans_status ON financial_transfers (status)'],
    )

    mk(
      'financial_checks',
      [
        T('tipo_cheque'),
        T('banco'),
        T('agencia'),
        T('numero_cheque'),
        T('emitente'),
        T('beneficiario'),
        T('cpf_cnpj'),
        T('valor'),
        T('data_emissao'),
        T('data_vencimento'),
        T('data_compensacao'),
        T('conta_bancaria'),
        T('documento_relacionado'),
        T('observacoes'),
        T('status'),
      ],
      ['CREATE INDEX idx_fin_chk_status ON financial_checks (status)'],
    )

    mk(
      'financial_cards',
      [
        T('nome_administradora'),
        T('bandeira'),
        T('maquina'),
        T('conta_recebimento'),
        T('taxa'),
        T('prazo_repasse'),
        T('antecipacao'),
        T('empresa'),
        T('filial'),
        T('observacoes'),
        { name: 'ativo', type: 'bool' },
      ],
      ['CREATE INDEX idx_fin_card_ativo ON financial_cards (ativo)'],
    )

    mk(
      'financial_card_transactions',
      [
        T('data_venda'),
        T('cliente'),
        T('pedido'),
        T('bandeira'),
        T('modalidade'),
        N('numero_parcelas'),
        T('valor_bruto'),
        T('taxa'),
        T('valor_liquido'),
        T('data_prevista_repasse'),
        T('data_real_repasse'),
        T('status'),
        T('card_id'),
      ],
      ['CREATE INDEX idx_fin_cardtx_status ON financial_card_transactions (status)'],
    )

    mk(
      'financial_boletos',
      [
        T('cliente'),
        T('titulo_id'),
        T('nosso_numero'),
        T('linha_digitavel'),
        T('valor'),
        T('data_emissao'),
        T('data_vencimento'),
        T('banco'),
        T('status'),
        T('empresa'),
        T('filial'),
      ],
      ['CREATE INDEX idx_fin_bol_status ON financial_boletos (status)'],
    )
  },
  (app) => {
    var cols = [
      'financial_receivables',
      'financial_payables',
      'financial_movements',
      'financial_transfers',
      'financial_checks',
      'financial_cards',
      'financial_card_transactions',
      'financial_boletos',
    ]
    for (var i = 0; i < cols.length; i++) {
      try {
        app.delete(app.findCollectionByNameOrId(cols[i]))
      } catch (_) {}
    }
  },
)
