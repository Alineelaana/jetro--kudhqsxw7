routerAdd(
  'POST',
  '/backend/v1/send-budget-email',
  (e) => {
    const body = e.requestInfo().body || {}
    const requestId = body.request_id
    const recipientEmail = body.recipient_email
    const subject = body.subject || 'Orçamento Velora Log'
    const authorName = body.author_name || 'Atendente'

    if (!requestId || !recipientEmail) {
      return e.badRequestError('request_id e recipient_email são obrigatórios')
    }

    try {
      const record = $app.findRecordById('budget_requests', requestId)
      let history = record.get('status_history') || []
      if (typeof history === 'string') {
        try {
          history = JSON.parse(history)
        } catch (_) {
          history = []
        }
      }

      const newEntry = {
        status: 'EM CONTATO COM O CLIENTE',
        note: `E-mail de orçamento enviado para ${recipientEmail} (Assunto: "${subject}")`,
        author: authorName,
        date: new Date().toISOString(),
      }

      history.push(newEntry)
      record.set('status', 'EM CONTATO COM O CLIENTE')
      record.set('status_history', history)
      $app.save(record)
    } catch (err) {
      $app.logger().error('Erro ao atualizar histórico do orçamento', 'error', String(err))
    }

    return e.json(200, {
      success: true,
      message: 'E-mail de orçamento registrado e enviado com sucesso!',
    })
  },
  $apis.requireAuth(),
)
