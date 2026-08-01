migrate(
  (app) => {
    var partnersCol = app.findCollectionByNameOrId('partners')

    var textFields = [
      'address_number',
      'address_complement',
      'address_district',
      'address_city',
      'address_state',
      'document_number',
      'document_issuer',
      'document_issue_date',
      'document_validity',
      'restriction_reason',
    ]
    for (var i = 0; i < textFields.length; i++) {
      var name = textFields[i]
      if (!partnersCol.fields.getByName(name)) {
        partnersCol.fields.add(new TextField({ name: name }))
      }
    }

    if (!partnersCol.fields.getByName('document_type')) {
      partnersCol.fields.add(
        new SelectField({
          name: 'document_type',
          required: false,
          values: ['RG', 'CNH'],
          maxSelect: 1,
        }),
      )
    }
    if (!partnersCol.fields.getByName('financial_restriction')) {
      partnersCol.fields.add(new BoolField({ name: 'financial_restriction' }))
    }
    var jsonFields = ['restriction_history', 'documents_metadata']
    for (var j = 0; j < jsonFields.length; j++) {
      if (!partnersCol.fields.getByName(jsonFields[j])) {
        partnersCol.fields.add(new JSONField({ name: jsonFields[j] }))
      }
    }
    app.save(partnersCol)

    var usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
    try {
      usersCol.fields.removeByName('role')
    } catch (_) {}
    usersCol.fields.add(
      new SelectField({
        name: 'role',
        required: false,
        values: ['SUP', 'PADRAO', 'SDR', 'Vendedor', 'FINANCEIRO', 'COMERCIAL'],
        maxSelect: 1,
      }),
    )
    app.save(usersCol)
  },
  (app) => {
    var partnersCol = app.findCollectionByNameOrId('partners')
    var fieldsToRemove = [
      'address_number',
      'address_complement',
      'address_district',
      'address_city',
      'address_state',
      'document_type',
      'document_number',
      'document_issuer',
      'document_issue_date',
      'document_validity',
      'financial_restriction',
      'restriction_reason',
      'restriction_history',
      'documents_metadata',
    ]
    for (var i = 0; i < fieldsToRemove.length; i++) {
      try {
        partnersCol.fields.removeByName(fieldsToRemove[i])
      } catch (_) {}
    }
    app.save(partnersCol)

    var usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
    try {
      usersCol.fields.removeByName('role')
    } catch (_) {}
    usersCol.fields.add(
      new SelectField({
        name: 'role',
        required: false,
        values: ['SUP', 'PADRAO', 'SDR', 'Vendedor'],
        maxSelect: 1,
      }),
    )
    app.save(usersCol)
  },
)
