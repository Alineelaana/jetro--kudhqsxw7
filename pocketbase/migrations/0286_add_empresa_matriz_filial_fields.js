migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('empresas')

    if (!col.fields.getByName('tipo_unidade')) {
      col.fields.add(
        new TextField({
          name: 'tipo_unidade',
        }),
      )
    }

    if (!col.fields.getByName('matriz_id')) {
      col.fields.add(
        new TextField({
          name: 'matriz_id',
        }),
      )
    }

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('empresas')
    col.fields.removeByName('tipo_unidade')
    col.fields.removeByName('matriz_id')
    app.save(col)
  },
)
