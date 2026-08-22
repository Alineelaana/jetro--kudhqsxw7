migrate(
  (app) => {
    var col = app.findCollectionByNameOrId('validity_rules')

    if (!col.fields.getByName('attachments')) {
      col.fields.add(
        new FileField({
          name: 'attachments',
          maxSelect: 10,
          maxSize: 10485760,
          mimeTypes: [
            'image/png',
            'image/jpeg',
            'application/pdf',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          ],
        }),
      )
    }

    app.save(col)
  },
  (app) => {
    var col = app.findCollectionByNameOrId('validity_rules')
    var f = col.fields.getByName('attachments')
    if (f) col.fields.remove(f)
    app.save(col)
  },
)
