migrate(
  (app) => {
    try {
      const col = app.findCollectionByNameOrId('certification_artifacts')
      app.delete(col)
    } catch (_) {}
  },
  (app) => {},
)
