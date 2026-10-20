routerAdd(
  'POST',
  '/backend/v1/send-budget-email',
  (e) => {
    const body = e.requestInfo().body || {}
    const requestId = body.request_id
    const recipientEmail = body.recipient_email
    const subject = body.subject || 'Orçamento HURAM — Sistema Inteligente de Gestão'
    const authorName = body.author_name || 'Atendente'

    if (!requestId || !recipientEmail) {
      return e.badRequestError('request_id e recipient_email são obrigatórios')
    }

    const siteUrl = $secrets.get('SITE_URL') || 'https://logistica-premium-es-2cc14.goskip.app'
    const logoHuramUrl = `${siteUrl.replace(/\/$/, '')}/src/assets/logo-huram-em-verde-e-dourado-1-e173e.png`

    const signatureHtml = `
      <div style="margin-top: 30px; padding-top: 15px; border-top: 2px solid #C69B45; font-family: 'Segoe UI', Arial, sans-serif; background: #ffffff;">
        <p style="margin: 0 0 6px 0; color: #66736D; font-size: 13px;">Atenciosamente,</p>
        <p style="margin: 0 0 10px 0; color: #063D30; font-weight: bold; font-size: 15px;">${authorName} — HURAM</p>
        <div style="display: inline-block; padding: 12px 18px; border: 1px solid #E4EAE6; border-radius: 8px; background: #F8FAF9;">
          <img src="${logoHuramUrl}" alt="HURAM — Sistema Inteligente de Gestão" style="max-height: 48px; width: auto; display: block; margin-bottom: 6px;" />
          <span style="font-size: 11px; color: #66736D; letter-spacing: 0.5px;">Sistema Inteligente de Gestão Empresarial</span>
        </div>
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
