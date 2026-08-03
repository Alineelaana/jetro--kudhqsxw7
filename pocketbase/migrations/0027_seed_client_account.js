migrate(
  (app) => {
    const clientsCol = app.findCollectionByNameOrId('clients')

    try {
      app.findAuthRecordByEmail('clients', 'alineelaana@gmail.com')
    } catch (_) {
      const client = new Record(clientsCol)
      client.setEmail('alineelaana@gmail.com')
      client.setPassword('alineelaana')
      client.setVerified(true)
      client.set('name', 'Alinela Ana')
      app.save(client)
    }
  },
  (app) => {
    try {
      const record = app.findAuthRecordByEmail('clients', 'alineelaana@gmail.com')
      app.delete(record)
    } catch (_) {}
  },
)
