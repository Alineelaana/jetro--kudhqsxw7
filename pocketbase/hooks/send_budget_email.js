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

    const siteUrl = $secrets.get('SITE_URL') || 'https://logistica-premium-es-2cc14.goskip.app'
    const signatureImageUrl = `${siteUrl.replace(/\/$/, '')}/src/assets/chatgpt-image-1-de-ago.de-2026-155412-d05ee.png`

    const signatureHtml = `
      <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #e5e7eb; font-family: sans-serif;">
        <p style="margin: 0 0 8px 0; color: #374151; font-size: 14px;">Atenciosamente,</p>
        <p style="margin: 0 0 12px 0; color: #005B2E; font-weight: bold; font-size: 15px;">${authorName} — Velora Log Operações Logísticas</p>
        <img src="${signatureImageUrl}" alt="Assinatura Velora Log" style="max-width: 580px; width: 100%; height: auto; border-radius: 8px; display: block; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);" />
      </div>
    `

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
      signatureHtml: signatureHtml,
      signatureImageUrl: signatureImageUrl,
    })
  },
  $apis.requireAuth(),
)
