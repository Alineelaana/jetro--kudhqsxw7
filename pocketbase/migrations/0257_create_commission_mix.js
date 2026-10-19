// Migration 0257: Criar coleção commission_mix para gestão oficial de comissões MIX por produto
migrate(
  (app) => {
    let mixCol = null
    try {
      mixCol = app.findCollectionByNameOrId('commission_mix')
    } catch (e) {
      mixCol = null
    }

    if (!mixCol) {
      mixCol = new Collection({
        name: 'commission_mix',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.role = 'SUP'",
        fields: [
          { name: 'product_id', type: 'text' },
          { name: 'product_code', type: 'text', required: true },
          { name: 'product_ean', type: 'text' },
          { name: 'product_name', type: 'text', required: true },
          { name: 'brand', type: 'text' },
          { name: 'supplier', type: 'text' },
          { name: 'category', type: 'text' },
          { name: 'product_line', type: 'text' },
          { name: 'price', type: 'number' },
          { name: 'commission_percentage', type: 'number', required: false, min: 0, max: 100 },
          {
            name: 'status',
            type: 'select',
            required: true,
            values: ['Ativo', 'Inativo'],
            maxSelect: 1,
          },
          { name: 'vigencia_inicio', type: 'text', required: true },
          { name: 'vigencia_fim', type: 'text' },
          { name: 'history', type: 'json' },
          { name: 'updated_by_user_id', type: 'text' },
          { name: 'updated_by_user_name', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE UNIQUE INDEX idx_commission_mix_prod_code ON commission_mix (product_code)',
          'CREATE INDEX idx_commission_mix_prod_ean ON commission_mix (product_ean)',
          'CREATE INDEX idx_commission_mix_brand ON commission_mix (brand)',
          'CREATE INDEX idx_commission_mix_status ON commission_mix (status)',
        ],
      })
      app.save(mixCol)

      // Sincronizar / Popular produtos existentes para que a Comissões MIX já contenha
      // o catálogo real de produtos do ERP com comissão inicial (se houver ou padrão 3.0%)
      try {
        const productsCol = app.findCollectionByNameOrId('products')
        if (productsCol) {
          const prods = app.findRecordsByFilter(
            'products',
            'active = true || active = false',
            '-created',
            100,
            0,
          )
          const nowStr = new Date().toISOString().slice(0, 10)
          for (const p of prods) {
            const code = (p.getString('code') || p.id).trim()
            if (!code) continue

            // Verificar comissão pré-existente no produto ou default
            let comm = 3.0
            const commRaw = p.get('commission')
            if (commRaw !== null && commRaw !== undefined && commRaw !== '') {
              const parsed = parseFloat(String(commRaw).replace('%', '').trim())
              if (!isNaN(parsed) && parsed >= 0) comm = parsed
            }

            const rec = new Record(mixCol, {
              product_id: p.id,
              product_code: code,
              product_ean: p.getString('ean') || '',
              product_name: p.getString('name') || p.getString('description') || `Produto ${code}`,
              brand: p.getString('brand') || 'Jetro',
              supplier: p.getString('main_supplier') || '',
              category: p.getString('category') || 'Geral',
              product_line: p.getString('subcategory') || '',
              price: p.getFloat('price') || 0,
              commission_percentage: comm,
              status: p.getBool('active') ? 'Ativo' : 'Inativo',
              vigencia_inicio: '2026-01-01',
              vigencia_fim: '',
              history: [
                {
                  data: new Date().toISOString(),
                  usuario_nome: 'Sistema (Carga Inicial ERP)',
                  percentual_anterior: 0,
                  novo_percentual: comm,
                  vigencia_inicio: '2026-01-01',
                  motivo: 'Cadastramento inicial de produtos na Comissões MIX',
                },
              ],
              updated_by_user_id: 'sistema',
              updated_by_user_name: 'Sistema Jetro',
            })
            try {
              app.save(rec)
            } catch (errRec) {
              console.log('Erro ao salvar comissao_mix inicial do produto ' + code + ':', errRec)
            }
          }
        }
      } catch (errSync) {
        console.log('Erro na sincronizacao inicial de produtos com commission_mix:', errSync)
      }
    }
  },
  (app) => {
    try {
      const col = app.findCollectionByNameOrId('commission_mix')
      if (col) app.delete(col)
    } catch (e) {
      // ignore
    }
  },
)
