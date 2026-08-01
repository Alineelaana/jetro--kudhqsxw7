migrate(
  (app) => {
    var usersCol = app.findCollectionByNameOrId('_pb_users_auth_')

    if (!usersCol.fields.getByName('cpf')) {
      usersCol.fields.add(new TextField({ name: 'cpf' }))
    }

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

    if (!usersCol.fields.getByName('attendant_status')) {
      usersCol.fields.add(
        new SelectField({
          name: 'attendant_status',
          required: false,
          values: ['Online', 'Ocupado', 'Ausente', 'Offline'],
          maxSelect: 1,
        }),
      )
    }

    usersCol.addIndex('idx_users_cpf', true, 'cpf', "cpf != ''")
    app.save(usersCol)

    var convCol = app.findCollectionByNameOrId('chat_conversations')
    if (!convCol.fields.getByName('attendant_id')) {
      convCol.fields.add(
        new RelationField({
          name: 'attendant_id',
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        }),
      )
    }
    if (!convCol.fields.getByName('closed')) {
      convCol.fields.add(new BoolField({ name: 'closed' }))
    }
    app.save(convCol)

    var ratings = new Collection({
      name: 'chat_ratings',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: '',
      updateRule: "@request.auth.role = 'SUP'",
      deleteRule: "@request.auth.role = 'SUP'",
      fields: [
        {
          name: 'conversation',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('chat_conversations').id,
          maxSelect: 1,
          cascadeDelete: true,
        },
        {
          name: 'attendant',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        },
        { name: 'rating', type: 'number', required: true, min: 1, max: 5, onlyInt: true },
        { name: 'comment', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_chat_ratings_attendant ON chat_ratings (attendant)',
        'CREATE INDEX idx_chat_ratings_conversation ON chat_ratings (conversation)',
      ],
    })
    app.save(ratings)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('chat_ratings'))
    } catch (_) {}
    try {
      var convCol = app.findCollectionByNameOrId('chat_conversations')
      try {
        convCol.fields.removeByName('attendant_id')
      } catch (_) {}
      try {
        convCol.fields.removeByName('closed')
      } catch (_) {}
      app.save(convCol)
    } catch (_) {}
    try {
      var usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
      try {
        usersCol.fields.removeByName('cpf')
      } catch (_) {}
      try {
        usersCol.fields.removeByName('attendant_status')
      } catch (_) {}
      try {
        usersCol.removeIndex('idx_users_cpf')
      } catch (_) {}
      try {
        usersCol.fields.removeByName('role')
      } catch (_) {}
      usersCol.fields.add(
        new SelectField({ name: 'role', required: false, values: ['SUP', 'PADRAO'], maxSelect: 1 }),
      )
      app.save(usersCol)
    } catch (_) {}
  },
)
