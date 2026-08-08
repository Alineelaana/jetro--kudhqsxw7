migrate(
  (app) => {
    var col
    try {
      col = app.findCollectionByNameOrId('email_templates')
    } catch (e) {
      return
    }

    var templates = [
      {
        name: 'Cobranca - Pre-Vencimento',
        subject: 'Aviso: titulo a vencer em breve',
        body: 'Ola, identificamos que voce possui titulos a vencer em breve. Entre em contato para regularizar. VeloraLog.',
        category: 'cobranca',
        cobranca_tipo: 'pre_vencimento',
        destinatarios: '{"primary":"cliente","cc":["cobrador"],"channels":["whatsapp","email"]}',
        canais: '["whatsapp","email"]',
      },
      {
        name: 'Cobranca - Vencimento',
        subject: 'Aviso: titulo vencido',
        body: 'Ola, identificamos titulos vencidos em seu nome. Pedimos a regularizacao imediata. VeloraLog.',
        category: 'cobranca',
        cobranca_tipo: 'vencimento',
        destinatarios:
          '{"primary":"cliente","cc":["cobrador","supervisor"],"channels":["whatsapp","email"]}',
        canais: '["whatsapp","email"]',
      },
      {
        name: 'Cobranca - Promessa Quebrada',
        subject: 'Promessa de pagamento nao cumprida',
        body: 'Ola, identificamos que a promessa de pagamento nao foi cumprida. Entre em contato imediatamente. VeloraLog.',
        category: 'cobranca',
        cobranca_tipo: 'promessa_quebrada',
        destinatarios:
          '{"primary":"cliente","cc":["cobrador","supervisor","gerente"],"channels":["whatsapp","email"]}',
        canais: '["whatsapp","email"]',
      },
      {
        name: 'Cobranca - Aviso Final',
        subject: 'Notificacao final de debito',
        body: 'Ola, este e o aviso final referente aos seus titulos vencidos. Caso nao haja regularizacao, medidas adicionais serao tomadas. VeloraLog.',
        category: 'cobranca',
        cobranca_tipo: 'aviso_final',
        destinatarios:
          '{"primary":"cliente","cc":["cobrador","supervisor","gerente"],"channels":["whatsapp","email"]}',
        canais: '["whatsapp","email"]',
      },
    ]

    for (var i = 0; i < templates.length; i++) {
      var t = templates[i]
      try {
        app.findFirstRecordByData('email_templates', 'name', t.name)
        continue
      } catch (e) {}

      var rec = new Record(col)
      if (col.fields.getByName('name')) rec.set('name', t.name)
      if (col.fields.getByName('subject')) rec.set('subject', t.subject)
      if (col.fields.getByName('body')) rec.set('body', t.body)
      if (col.fields.getByName('category')) rec.set('category', t.category)
      if (col.fields.getByName('cobranca_tipo')) rec.set('cobranca_tipo', t.cobranca_tipo)
      if (col.fields.getByName('destinatarios')) rec.set('destinatarios', t.destinatarios)
      if (col.fields.getByName('canais')) rec.set('canais', t.canais)
      if (col.fields.getByName('active')) rec.set('active', true)
      app.save(rec)
    }
  },
  (app) => {},
)
