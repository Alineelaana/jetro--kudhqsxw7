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

    mk(
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
      ['CREATE INDEX idx_logistics_routes_situacao ON logistics_routes (situacao)'],
    )

    mk(
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
      ['CREATE INDEX idx_logistics_deliveries_status ON logistics_deliveries (status)'],
    )

    mk(
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
      ['CREATE INDEX idx_logistics_vehicles_situacao ON logistics_vehicles (situacao)'],
    )

    mk(
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
      ['CREATE INDEX idx_logistics_drivers_situacao ON logistics_drivers (situacao)'],
    )

    mk(
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
      ['CREATE INDEX idx_logistics_freights_situacao ON logistics_freights (situacao)'],
    )
  },
  (app) => {
    var cols = [
      'logistics_routes',
      'logistics_deliveries',
      'logistics_vehicles',
      'logistics_drivers',
      'logistics_freights',
    ]
    for (var i = 0; i < cols.length; i++) {
      try {
        app.delete(app.findCollectionByNameOrId(cols[i]))
      } catch (_) {}
    }
  },
)
