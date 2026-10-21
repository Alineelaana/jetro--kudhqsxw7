migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('empresas')

    if (!col.fields.getByName('marca_logo')) {
      col.fields.add(
        new FileField({
          name: 'marca_logo',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
        }),
      )
    }

    if (!col.fields.getByName('marca_cor_primaria')) {
      col.fields.add(
        new TextField({
          name: 'marca_cor_primaria',
        }),
      )
    }

    if (!col.fields.getByName('marca_cor_secundaria')) {
      col.fields.add(
        new TextField({
          name: 'marca_cor_secundaria',
        }),
      )
    }

    if (!col.fields.getByName('marca_nome_exibicao')) {
      col.fields.add(
        new TextField({
          name: 'marca_nome_exibicao',
        }),
      )
    }

    if (!col.fields.getByName('padrao')) {
      col.fields.add(
        new BoolField({
          name: 'padrao',
        }),
      )
    }

    // Permitir leitura pública para que a tela de login carregue a marca da empresa antes da autenticação
    col.listRule = ''
    col.viewRule = ''

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('empresas')
    col.fields.removeByName('marca_logo')
    col.fields.removeByName('marca_cor_primaria')
    col.fields.removeByName('marca_cor_secundaria')
    col.fields.removeByName('marca_nome_exibicao')
    col.fields.removeByName('padrao')
    col.listRule = "@request.auth.id != ''"
    col.viewRule = "@request.auth.id != ''"
    app.save(col)
  },
)
