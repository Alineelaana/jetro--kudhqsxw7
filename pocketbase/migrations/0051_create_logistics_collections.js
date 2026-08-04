migrate(
  (app) => {
    var R = "@request.auth.id != ''"
    var SA = "@request.auth.role = 'SUP'"

    function createCol(name, fields, indexes) {
      try {
        app.findCollectionByNameOrId(name)
        return null
      } catch (_) {}
      var col = new Collection({
        name: name,
        type: 'base',
        listRule: R,
        viewRule: R,
        createRule: R,
        updateRule: R,
        deleteRule: SA,
        fields: fields.concat([
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ]),
        indexes: indexes || [],
      })
      app.save(col)
      return col
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
    function B(n) {
      return { name: n, type: 'bool' }
    }

    createCol(
      'logistics_routes',
      [
        T('codigo_rota'),
        T('nome_rota'),
        T('empresa'),
        T('filial'),
        T('regiao'),
        T('cidade_origem'),
        T('cidades_atendidas'),
        T('estado'),
        T('distancia_estimada'),
        T('tempo_estimado'),
        T('pedagios'),
        T('custo_estimado'),
        T('dias_operacao'),
        T('horario_saida'),
        T('responsavel'),
        T('situacao'),
        T('veiculo_padrao'),
        T('motorista_padrao'),
        N('capacidade_maxima_peso'),
        N('capacidade_maxima_volume'),
        J('clientes_vinculados'),
        J('sequencia_entregas'),
        J('historico'),
      ],
      [
        'CREATE INDEX idx_logistics_routes_situacao ON logistics_routes (situacao)',
        'CREATE INDEX idx_logistics_routes_created ON logistics_routes (created DESC)',
      ],
    )

    createCol(
      'logistics_deliveries',
      [
        T('numero_entrega'),
        T('pedido'),
        T('nota_fiscal'),
        T('cliente'),
        T('endereco'),
        T('cidade'),
        T('rota'),
        T('transportadora'),
        T('veiculo'),
        T('motorista'),
        T('data_prevista'),
        T('data_realizada'),
        T('valor_mercadoria'),
        T('status'),
        T('empresa'),
        T('filial'),
        T('cep'),
        T('regiao'),
        T('prioridade'),
        T('peso'),
        T('volume'),
        T('quantidade_volumes'),
        T('contato_cliente'),
        T('recebedor_nome'),
        T('recebedor_documento'),
        J('pedidos_vinculados'),
        J('notas_fiscais'),
        J('produtos'),
        J('historico_movimentacoes'),
        J('ocorrencias'),
        J('comprovantes'),
      ],
      [
        'CREATE INDEX idx_logistics_deliveries_status ON logistics_deliveries (status)',
        'CREATE INDEX idx_logistics_deliveries_created ON logistics_deliveries (created DESC)',
      ],
    )

    createCol(
      'logistics_vehicles',
      [
        T('codigo'),
        T('tipo_propriedade'),
        T('proprietario'),
        T('placa'),
        T('renavam'),
        T('marca'),
        T('modelo'),
        T('ano'),
        T('cor'),
        T('tipo_veiculo'),
        N('capacidade_peso'),
        N('capacidade_volume'),
        N('quantidade_eixos'),
        T('tipo_carroceria'),
        T('empresa'),
        T('filial'),
        T('unidade_operacao'),
        T('data_aquisicao'),
        T('vencimento_licenciamento'),
        T('vencimento_seguro'),
        T('situacao'),
        J('manutencoes'),
        J('abastecimentos'),
        J('documentos'),
        J('historico'),
      ],
      [
        'CREATE INDEX idx_logistics_vehicles_situacao ON logistics_vehicles (situacao)',
        'CREATE INDEX idx_logistics_vehicles_placa ON logistics_vehicles (placa)',
      ],
    )

    createCol(
      'logistics_drivers',
      [
        T('nome'),
        T('cpf'),
        T('rg'),
        T('data_nascimento'),
        T('telefone'),
        T('email'),
        T('endereco'),
        T('numero_cnh'),
        T('categoria_cnh'),
        T('validade_cnh'),
        T('empresa'),
        T('filial'),
        T('transportadora'),
        T('tipo_vinculo'),
        T('veiculo_padrao'),
        T('situacao'),
        J('documentos'),
        J('rotas'),
        J('entregas'),
        J('ocorrencias'),
        J('desempenho'),
        J('historico'),
      ],
      [
        'CREATE INDEX idx_logistics_drivers_situacao ON logistics_drivers (situacao)',
        'CREATE INDEX idx_logistics_drivers_created ON logistics_drivers (created DESC)',
      ],
    )

    createCol(
      'logistics_freights',
      [
        T('numero_frete'),
        T('documento_origem'),
        T('pedido'),
        T('nota_fiscal'),
        T('cliente'),
        T('transportadora'),
        T('origem'),
        T('destino'),
        T('peso'),
        T('volume'),
        T('valor_mercadoria'),
        T('tipo_frete'),
        T('tabela_frete'),
        T('valor_calculado'),
        T('valor_negociado'),
        T('pedagio'),
        T('seguro'),
        T('taxas'),
        T('adicionais'),
        T('valor_total'),
        T('prazo_entrega'),
        T('responsavel'),
        T('situacao'),
        T('cte'),
        T('empresa'),
        T('filial'),
        J('cotacoes'),
        J('historico'),
      ],
      [
        'CREATE INDEX idx_logistics_freights_situacao ON logistics_freights (situacao)',
        'CREATE INDEX idx_logistics_freights_created ON logistics_freights (created DESC)',
      ],
    )

    createCol(
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

    createCol(
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

    createCol(
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
      [
        'CREATE INDEX idx_logistics_occ_situacao ON logistics_occurrences (situacao)',
        'CREATE INDEX idx_logistics_occ_created ON logistics_occurrences (created DESC)',
      ],
    )

    createCol(
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

    createCol(
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
      'logistics_routes',
      'logistics_deliveries',
      'logistics_vehicles',
      'logistics_drivers',
      'logistics_freights',
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
