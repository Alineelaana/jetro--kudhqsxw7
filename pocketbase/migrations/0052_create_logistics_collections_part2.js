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
    function J(n) {
      return { name: n, type: 'json' }
    }

    mk(
      'logistics_freight_tables',
      [
        T('nome_tabela'),
        T('transportadora'),
        T('empresa'),
        T('filial'),
        T('regiao_origem'),
        T('regiao_destino'),
        T('data_inicial'),
        T('data_final'),
        T('situacao'),
        T('frete_minimo'),
        T('pedagio'),
        T('taxa_dificil_acesso'),
        T('taxa_reentrega'),
        T('taxa_devolucao'),
        T('seguro'),
        T('adicional_urgencia'),
        T('outras_taxas'),
        J('faixas_peso'),
        J('faixas_valor'),
        J('faixas_volume'),
        J('faixas_km'),
        J('faixas_entregas'),
      ],
      ['CREATE INDEX idx_logistics_ft_situacao ON logistics_freight_tables (situacao)'],
    )

    mk(
      'logistics_tracking',
      [
        T('veiculo'),
        T('motorista'),
        T('rota'),
        T('entrega'),
        T('cliente'),
        T('ultima_localizacao'),
        T('data_hora_atualizacao'),
        T('proxima_parada'),
        T('previsao_chegada'),
        T('status'),
        T('latitude'),
        T('longitude'),
        T('empresa'),
        T('filial'),
        J('linha_tempo'),
      ],
      ['CREATE INDEX idx_logistics_tracking_status ON logistics_tracking (status)'],
    )

    mk(
      'logistics_occurrences',
      [
        T('entrega'),
        T('pedido'),
        T('cliente'),
        T('motorista'),
        T('veiculo'),
        T('data_hora'),
        T('tipo_ocorrencia'),
        T('descricao'),
        T('responsavel'),
        T('acao_necessaria'),
        T('nova_data_prevista'),
        T('situacao'),
        T('empresa'),
        T('filial'),
        J('fotos'),
        J('documentos'),
        J('historico'),
      ],
      ['CREATE INDEX idx_logistics_occ_situacao ON logistics_occurrences (situacao)'],
    )

    mk(
      'logistics_proof_delivery',
      [
        T('entrega'),
        T('pedido'),
        T('nota_fiscal'),
        T('cliente'),
        T('romaneio'),
        T('motorista'),
        T('recebedor_nome'),
        T('recebedor_documento'),
        T('data_hora'),
        T('localizacao'),
        T('latitude'),
        T('longitude'),
        T('observacoes'),
        J('fotos'),
        T('empresa'),
        T('filial'),
      ],
      ['CREATE INDEX idx_logistics_pod_entrega ON logistics_proof_delivery (entrega)'],
    )

    mk(
      'logistics_costs',
      [
        T('descricao'),
        T('tipo_custo'),
        T('entrega'),
        T('pedido'),
        T('cliente'),
        T('rota'),
        T('veiculo'),
        T('motorista'),
        T('transportadora'),
        T('empresa'),
        T('filial'),
        T('valor'),
        T('data'),
        T('responsavel'),
        J('historico'),
      ],
      ['CREATE INDEX idx_logistics_costs_tipo ON logistics_costs (tipo_custo)'],
    )
  },
  (app) => {
    var cols = [
      'logistics_freight_tables',
      'logistics_tracking',
      'logistics_occurrences',
      'logistics_proof_delivery',
      'logistics_costs',
    ]
    for (var i = 0; i < cols.length; i++) {
      try {
        app.delete(app.findCollectionByNameOrId(cols[i]))
      } catch (_) {}
    }
  },
)
