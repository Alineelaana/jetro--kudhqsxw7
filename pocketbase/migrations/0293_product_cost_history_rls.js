/// <reference path="../pb_data/types.d.ts" />

migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('product_cost_history')
    if (!col) return

    // Inspecionar os campos da coleção em runtime
    const fieldNames = []
    try {
      col.fields.forEach((f) => fieldNames.push(f.name))
    } catch (_) {}
    console.log('Migration 0293: campos de product_cost_history =', JSON.stringify(fieldNames))

    // Garantir o campo empresa se não existir
    if (!col.fields.getByName('empresa')) {
      try {
        const empresasCol = app.findCollectionByNameOrId('empresas')
        if (empresasCol) {
          col.fields.add(
            new RelationField({
              name: 'empresa',
              collectionId: empresasCol.id,
              cascadeDelete: false,
              maxSelect: 1,
              required: false,
            }),
          )
        }
      } catch (e) {
        console.log('Migration 0293: erro ao adicionar campo empresa:', e)
      }
    }

    col.listRule =
      '@request.auth.id != "" && (@request.auth.role = "SUP" || empresa = "" || empresa = null || empresa = @request.auth.empresa_id || @request.auth.empresa_id = "")'
    col.viewRule =
      '@request.auth.id != "" && (@request.auth.role = "SUP" || empresa = "" || empresa = null || empresa = @request.auth.empresa_id || @request.auth.empresa_id = "")'
    col.createRule = null // Apenas via hooks server-side
    col.updateRule = null // Imutável
    col.deleteRule = null // Imutável

    // Expande valores permitidos no select caso seja select field
    try {
      const origemField = col.fields.getByName('origem')
      if (origemField && origemField.values) {
        const origens = [
          'fiscal_entry',
          'production',
          'adjustment',
          'initial',
          'supplier_allowance',
          'reversal',
        ]
        for (const o of origens) {
          if (!origemField.values.includes(o)) {
            origemField.values.push(o)
          }
        }
      }
    } catch (_) {}

    try {
      const metodoField = col.fields.getByName('metodo')
      if (metodoField && metodoField.values) {
        const metodos = ['last_entry', 'weighted_average', 'allowance_deduction', 'adjustment']
        for (const m of metodos) {
          if (!metodoField.values.includes(m)) {
            metodoField.values.push(m)
          }
        }
      }
    } catch (_) {}

    app.save(col)
  },
  (app) => {
    try {
      const col = app.findCollectionByNameOrId('product_cost_history')
      if (col) {
        col.listRule = '@request.auth.id != ""'
        col.viewRule = '@request.auth.id != ""'
        app.save(col)
      }
    } catch (_) {}
  },
)
