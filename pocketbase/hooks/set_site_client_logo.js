routerAdd('POST', '/backend/v1/custom/set-site-client-logo', (e) => {
  try {
    var body = e.requestInfo().body
    var clientId = body.clientId
    var base64Data = body.base64Data
    var fileName = body.fileName

    if (!clientId || !base64Data || !fileName) {
      return e.json(400, { error: 'clientId, base64Data e fileName são obrigatórios' })
    }

    var record = $app.findRecordById('site_clients', clientId)
    if (!record) {
      return e.json(404, { error: 'Cliente não encontrado' })
    }

    // decode base64
    var fileBytes = $security.base64Decode(base64Data)
    var file = $filesystem.fileFromBytes(fileBytes, fileName)

    record.set('logo', file)
    $app.save(record)

    return e.json(200, {
      success: true,
      clientId: record.id,
      logo: record.getString('logo'),
    })
  } catch (err) {
    return e.json(500, { error: String(err) })
  }
})
