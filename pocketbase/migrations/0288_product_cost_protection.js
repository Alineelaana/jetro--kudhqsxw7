/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  // 1. Atualizar a coleção `products` com campos de controle de custo
  const productsCol = app.findCollectionByNameOrId('products')

  const costOriginField = productsCol.fields.getByName('cost_origin')
  if (!costOriginField) {
    productsCol.fields.add(
      new SelectField({
        name: 'cost_origin',
        values: ['fiscal_entry', 'production', 'adjustment', 'initial'],
        maxSelect: 1,
        required: false,
      }),
    )
  }

  const costLockedField = productsCol.fields.getByName('cost_locked')
  if (!costLockedField) {
    productsCol.fields.add(
      new BoolField({
        name: 'cost_locked',
        required: false,
      }),
    )
  }

  const costTypeField = productsCol.fields.getByName('cost_type')
  if (!costTypeField) {
    productsCol.fields.add(
      new SelectField({
        name: 'cost_type',
        values: ['revenda', 'fabricado'],
        maxSelect: 1,
        required: false,
      }),
    )
  }

  app.save(productsCol)

  // Backfill inicial para produtos existentes
  try {
    const existingProducts = app.findRecordsByFilter('products', '1 = 1', '-created', 5000, 0)
    for (const p of existingProducts) {
      let isUpdated = false
      const tipo = p.getString('tipo_finalidade') || ''
      const isRevenda = tipo === 'revenda' || tipo === '' || tipo === 'mercadoria_revenda'

      if (!p.getString('cost_type')) {
        p.set('cost_type', isRevenda ? 'revenda' : 'fabricado')
        isUpdated = true
      }
      if (!p.getString('cost_origin')) {
        p.set('cost_origin', 'initial')
        isUpdated = true
      }
      if (
        p.get('cost_locked') === null ||
        p.get('cost_locked') === undefined ||
        p.get('cost_locked') === false
      ) {
        p.set('cost_locked', isRevenda)
        isUpdated = true
      }

      if (isUpdated) {
        app.save(p)
      }
    }
  } catch (err) {
    console.log('Aviso no backfill de produtos:', err)
  }

  // 2. Criar coleção `product_cost_history`
  let costHistoryCol
  try {
    costHistoryCol = app.findCollectionByNameOrId('product_cost_history')
  } catch (_) {
    costHistoryCol = null
  }

  if (!costHistoryCol) {
    const col = new Collection({
      name: 'product_cost_history',
      type: 'base',
      listRule: '@request.auth.id != ""',
      viewRule: '@request.auth.id != ""',
      createRule: null, // Escrita somente via hooks / sistema interno
      updateRule: null, // Imutável
      deleteRule: null, // Imutável
      fields: [
        new RelationField({
          name: 'product',
          collectionId: productsCol.id,
          cascadeDelete: false,
          maxSelect: 1,
          required: false,
        }),
        new RelationField({
          name: 'empresa',
          collectionId: app.findCollectionByNameOrId('empresas').id,
          cascadeDelete: false,
          maxSelect: 1,
          required: false,
        }),
        new TextField({
          name: 'data_hora',
          required: false,
        }),
        new SelectField({
          name: 'origem',
          values: ['fiscal_entry', 'production', 'adjustment', 'initial'],
          maxSelect: 1,
          required: false,
        }),
        new TextField({
          name: 'documento_referencia',
          required: false,
        }),
        new SelectField({
          name: 'metodo',
          values: ['last_entry', 'weighted_average'],
          maxSelect: 1,
          required: false,
        }),
        new NumberField({
          name: 'custo_anterior',
          required: false,
        }),
        new NumberField({
          name: 'custo_novo',
          required: false,
        }),
        new JSONField({
          name: 'composicao',
          required: false,
        }),
        new NumberField({
          name: 'quantidade_entrada',
          required: false,
        }),
        new NumberField({
          name: 'saldo_apos',
          required: false,
        }),
        new RelationField({
          name: 'usuario',
          collectionId: '_pb_users_auth_',
          cascadeDelete: false,
          maxSelect: 1,
          required: false,
        }),
      ],
    })
    app.save(col)
  }

  // 3. Criar coleção `cost_policy` (política de custeio por empresa)
  let costPolicyCol
  try {
    costPolicyCol = app.findCollectionByNameOrId('cost_policy')
  } catch (_) {
    costPolicyCol = null
  }

  if (!costPolicyCol) {
    const col = new Collection({
      name: 'cost_policy',
      type: 'base',
      listRule: '@request.auth.id != ""',
      viewRule: '@request.auth.id != ""',
      createRule: '@request.auth.role = "SUP"',
      updateRule: '@request.auth.role = "SUP"',
      deleteRule: null,
      fields: [
        new RelationField({
          name: 'empresa',
          collectionId: app.findCollectionByNameOrId('empresas').id,
          cascadeDelete: false,
          maxSelect: 1,
          required: true,
        }),
        new SelectField({
          name: 'metodo',
          values: ['weighted_average', 'last_entry'],
          maxSelect: 1,
          required: true,
        }),
        new BoolField({
          name: 'incluir_frete',
          required: false,
        }),
        new BoolField({
          name: 'incluir_seguro',
          required: false,
        }),
        new BoolField({
          name: 'incluir_despesas_acessorias',
          required: false,
        }),
        new BoolField({
          name: 'deduzir_impostos_recuperaveis',
          required: false,
        }),
        new JSONField({
          name: 'parametros_composicao',
          required: false,
        }),
        new BoolField({
          name: 'ativo',
          required: false,
        }),
      ],
    })
    app.save(col)
  }

  // Semear cost_policy padrão para as empresas existentes
  try {
    const policyCol = app.findCollectionByNameOrId('cost_policy')
    const empresas = app.findRecordsByFilter('empresas', '1 = 1', '-created', 100, 0)
    for (const emp of empresas) {
      let existingPolicy = null
      try {
        existingPolicy = app.findFirstRecordByFilter('cost_policy', `empresa = "${emp.id}"`)
      } catch (_) {}

      if (!existingPolicy) {
        const policyRecord = new Record(policyCol)
        policyRecord.set('empresa', emp.id)
        policyRecord.set('metodo', 'weighted_average')
        policyRecord.set('incluir_frete', true)
        policyRecord.set('incluir_seguro', true)
        policyRecord.set('incluir_despesas_acessorias', true)
        policyRecord.set('deduzir_impostos_recuperaveis', true)
        policyRecord.set('ativo', true)
        policyRecord.set('parametros_composicao', {
          rateio_frete: 'valor',
          considerar_descontos_incondicionais: true,
          icms_recuperavel: true,
          pis_cofins_recuperavel: true,
          ipi_recuperavel: false,
        })
        app.save(policyRecord)
      }
    }
  } catch (err) {
    console.log('Aviso ao semear cost_policy:', err)
  }
})
