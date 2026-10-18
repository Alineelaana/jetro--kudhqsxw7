/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const preferencesCol = new Collection({
      name: 'user_preferences',
      type: 'base',
      listRule: "@request.auth.id != '' && user = @request.auth.id",
      viewRule: "@request.auth.id != '' && user = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && user = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user = @request.auth.id",
      fields: [
        {
          name: 'user',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'preferences',
          type: 'json',
          required: true,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_user_prefs_user ON user_preferences (user)'],
    })
    app.save(preferencesCol)
  },
  (app) => {
    try {
      const col = app.findCollectionByNameOrId('user_preferences')
      app.delete(col)
    } catch {}
  },
)
