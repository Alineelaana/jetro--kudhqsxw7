migrate(
  (app) => {
    var col
    try {
      col = app.findCollectionByNameOrId('email_templates')
    } catch (e) {
      return
    }

    if (!col.fields.getByName('cobranca_tipo')) {
      col.fields.add(
        new SelectField({
          name: 'cobranca_tipo',
          values: ['pre_vencimento', 'vencimento', 'promessa_quebrada', 'aviso_final'],
          maxSelect: 1,
        }),
      )
    }

    if (!col.fields.getByName('destinatarios')) {
      col.fields.add(new JSONField({ name: 'destinatarios' }))
    }

    if (!col.fields.getByName('canais')) {
      col.fields.add(new JSONField({ name: 'canais' }))
    }

    app.save(col)
  },
  (app) => {},
)
