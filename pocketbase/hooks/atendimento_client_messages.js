routerAdd('GET', '/backend/v1/atendimento/{id}/client-messages', (e) => {
  var atendimentoId = e.request.pathValue('id')
  if (!atendimentoId) return e.badRequestError('id is required')

  var record = null
  try {
    record = $app.findRecordById('service_centers', atendimentoId)
  } catch (_) {
    return e.notFoundError('atendimento not found')
  }

  var clientId = record.getString('client_id')
  var authId = e.auth ? e.auth.id : ''
  var isSuperuser = e.hasSuperuserAuth()

  if (!isSuperuser && clientId && clientId !== authId) {
    var isClient = false
    if (e.auth && e.auth.collectionName === 'clients') {
      isClient = e.auth.id === clientId
    }
    if (!isClient) return e.forbiddenError('access denied')
  }

  var messages = record.get('client_messages')
  if (typeof messages === 'string') {
    try {
      messages = JSON.parse(messages)
    } catch (_) {
      messages = []
    }
  }
  if (!Array.isArray(messages)) messages = []

  var safe = messages.map(function (m) {
    return {
      data_hora: m.data_hora || '',
      usuario: m.usuario || '',
      mensagem: m.mensagem || '',
    }
  })

  return e.json(200, { messages: safe, protocol: record.getString('protocol') })
})
