/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    // 1. Coleção para os dados da aba Comparativo (linhas de produtos)
    // ATENÇÃO: Nasce 100% VAZIA de produtos/linhas conforme exigência de compliance.
    const comparativoCol = new Collection({
      name: 'margens_comparativo_gr',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'produto', type: 'text', required: true },
        { name: 'cmv', type: 'number', required: false },
        { name: 'preco_rivoli', type: 'number', required: false },
        { name: 'ativo', type: 'bool', required: false },
        { name: 'ordem', type: 'number', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_mg_comp_prod ON margens_comparativo_gr (produto)',
        'CREATE INDEX idx_mg_comp_ordem ON margens_comparativo_gr (ordem)',
      ],
    })
    app.save(comparativoCol)

    // 2. Coleção para os parâmetros da aba Parâmetros (premissas percentuais editáveis)
    const parametrosCol = new Collection({
      name: 'margens_parametros_gr',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'chave', type: 'text', required: true },
        { name: 'nome', type: 'text', required: true },
        { name: 'descricao', type: 'text', required: false },
        { name: 'aliquota_percentual', type: 'number', required: true }, // ex: 1.2 para 1.20%, 3 para 3.00%
        { name: 'base_calculo', type: 'text', required: false }, // "preco_rivoli"
        { name: 'ordem', type: 'number', required: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_mg_param_chave ON margens_parametros_gr (chave)',
        'CREATE INDEX idx_mg_param_ordem ON margens_parametros_gr (ordem)',
      ],
    })
    app.save(parametrosCol)

    // 3. Inicializar os 5 parâmetros padrão declarados pelo usuário no pedido
    const initialParams = [
      {
        chave: 'icms',
        nome: 'ICMS sobre preço Rivoli',
        descricao:
          'Alíquota de ICMS calculada diretamente sobre o preço Rivoli (preço efetivo de venda)',
        aliquota_percentual: 1.2,
        base_calculo: 'preco_rivoli',
        ordem: 1,
      },
      {
        chave: 'pis',
        nome: 'PIS sobre preço Rivoli',
        descricao: 'Alíquota de PIS calculada diretamente sobre o preço Rivoli',
        aliquota_percentual: 1.45,
        base_calculo: 'preco_rivoli',
        ordem: 2,
      },
      {
        chave: 'cofins',
        nome: 'COFINS sobre preço Rivoli',
        descricao: 'Alíquota de COFINS calculada diretamente sobre o preço Rivoli',
        aliquota_percentual: 6.68,
        base_calculo: 'preco_rivoli',
        ordem: 3,
      },
      {
        chave: 'comissao',
        nome: 'Comissão sobre preço Rivoli',
        descricao: 'Comissão de 3% calculada diretamente sobre o preço Rivoli',
        aliquota_percentual: 3.0,
        base_calculo: 'preco_rivoli',
        ordem: 4,
      },
      {
        chave: 'frete',
        nome: 'Frete sobre preço Rivoli',
        descricao: 'Frete de 3% calculado diretamente sobre o preço Rivoli',
        aliquota_percentual: 3.0,
        base_calculo: 'preco_rivoli',
        ordem: 5,
      },
    ]

    for (const p of initialParams) {
      const record = new Record(parametrosCol, {
        chave: p.chave,
        nome: p.nome,
        descricao: p.descricao,
        aliquota_percentual: p.aliquota_percentual,
        base_calculo: p.base_calculo,
        ordem: p.ordem,
      })
      app.save(record)
    }
  },
  (app) => {
    try {
      const comp = app.findCollectionByNameOrId('margens_comparativo_gr')
      app.delete(comp)
    } catch {}
    try {
      const params = app.findCollectionByNameOrId('margens_parametros_gr')
      app.delete(params)
    } catch {}
  },
)
