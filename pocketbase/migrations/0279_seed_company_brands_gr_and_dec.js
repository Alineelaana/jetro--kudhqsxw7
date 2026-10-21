migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('empresas')

    if (!col.fields.getByName('marca_cor_complementar')) {
      col.fields.add(
        new TextField({
          name: 'marca_cor_complementar',
        }),
      )
    }

    app.save(col)

    // Atualizar / configurar as marcas oficiais de Gran Romano e Dec Eldorado
    const records = app.findRecordsByFilter('empresas', 'active = true', '-created', 100)

    for (let i = 0; i < records.length; i++) {
      const rec = records[i]
      const code = (rec.getString('code') || '').toUpperCase()
      const name = (rec.getString('name') || '').toLowerCase()

      // Gran Romano: marrom harmonizado (#4A2E1B / #3D2314), secundária dourada (#C69B45), complementar marrom claro/âmbar (#8B5A2B)
      if (code.includes('GRAN-ROMANO') || name.includes('gran romano')) {
        rec.set('marca_nome_exibicao', 'Gran Romano')
        rec.set('marca_cor_primaria', '#4A2E1B') // Marrom nobre e encorpado (substitui o verde da Gran Romano)
        rec.set('marca_cor_secundaria', '#C69B45') // Dourado refinado
        rec.set('marca_cor_complementar', '#8B5A2B') // Marrom caramelo / âmbar
        app.save(rec)
      }

      // Dec Eldorado: Azul royal (#003DA5 ou #0043A8), secundária dourada (#D4AF37 / #C69B45), complementar amarela (#F5B324)
      if (code.includes('DEC-ELDORADO') || name.includes('dec eldorado')) {
        rec.set('marca_nome_exibicao', 'Dec Eldorado')
        rec.set('marca_cor_primaria', '#003DA5') // Azul Royal intenso
        rec.set('marca_cor_secundaria', '#D4AF37') // Dourado sofisticado
        rec.set('marca_cor_complementar', '#F5B324') // Amarelo complementar equilibrado
        app.save(rec)
      }
    }
  },
  (app) => {
    const col = app.findCollectionByNameOrId('empresas')
    col.fields.removeByName('marca_cor_complementar')
    app.save(col)
  },
)
