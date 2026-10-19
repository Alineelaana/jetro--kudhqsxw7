/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    try {
      app.findCollectionByNameOrId('user_table_preferences')
      return
    } catch (_) {}

    const preferencesCol = new Collection({
      name: 'user_table_preferences',
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
          name: 'screen_id',
          type: 'text',
          required: true,
        },
        {
          name: 'preferences',
          type: 'json',
          required: true,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_user_screen_pref ON user_table_preferences (user, screen_id)',
        'CREATE INDEX idx_user_pref_screen ON user_table_preferences (screen_id)',
      ],
    })
    app.save(preferencesCol)
  },
  (app) => {
    try {
      const col = app.findCollectionByNameOrId('user_table_preferences')
      app.delete(col)
    } catch (_) {}
  },
)
