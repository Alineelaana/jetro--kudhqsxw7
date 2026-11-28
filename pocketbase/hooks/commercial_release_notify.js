// Gatilho automático de notificação no sino — Liberações Comerciais (Rotinas)
//
// Quando uma solicitação de liberação entra em "aguardando liberação"
// (status = pendente), envia UMA notificação idempotente (1 por solicitação
// por destinatário) ao responsável pela análise. Sem responsável configurado,
// notifica a gestão (perfis SUP) sinalizando a pendência de atribuição.
//
// Regras de plataforma respeitadas:
// - NENHUMA referência a funções/constantes de nível superior dentro do
//   callback (Hook scoping error do JSVM): toda a lógica é embutida inline.
// - e.next() SEMPRE é chamado (sem ele o registro não grava mas a API
//   responde 200 — "sucesso falso").
// - Idempotente: procura notificação existente do tipo 'commercial_release'
//   com link apontando para a mesma solicitação antes de criar.

onRecordAfterCreateSuccess((e) => {
  try {
    var record = e.record
    var status = record.getString('status')
    if (status !== 'pendente') {
      return e.next()
    }

    var requestId = record.id
    var responsavelId = record.getString('responsavel_id')
    var orderNumber = record.getString('order_number')
    var clientName = record.getString('client_name')
    var rcaName = record.getString('rca_name')

    var tipoDivergencia = ''
    try {
      var divs = $app.findRecordsByFilter(
        'commercial_release_divergences',
        "request_id = '" + requestId + "'",
        '-created',
        1,
        0,
      )
      if (divs.length > 0) {
        tipoDivergencia = divs[0].getString('rule_description')
      }
    } catch (errDiv) {
      tipoDivergencia = ''
    }

    var message = 'Pedido ' + orderNumber + ' — ' + clientName + ' (RCA ' + (rcaName || '—') + ')'
    if (tipoDivergencia !== '') {
      message = message + ' aguarda liberação: ' + tipoDivergencia
    } else {
      message = message + ' aguarda liberação comercial'
    }

    var link = '/admin/rotinas/liberacoes-comerciais?request=' + requestId
    var notifCol = $app.findCollectionByNameOrId('notifications')

    // Destinatários: responsável; sem responsável => gestão (SUP) com sinal de pendência
    var recipients = []
    var pendingAssignment = false
    if (responsavelId !== '') {
      recipients.push(responsavelId)
    } else {
      pendingAssignment = true
      try {
        var gestao = $app.findRecordsByFilter('users', "role = 'SUP'", '', 50, 0)
        for (var g = 0; g < gestao.length; g++) {
          recipients.push(gestao[g].id)
        }
      } catch (errUsers) {
        // sem destinatários de gestão
      }
    }

    for (var i = 0; i < recipients.length; i++) {
      var recipientId = recipients[i]
      // Idempotente: 1 notificação por solicitação + destinatário
      var existing = null
      try {
        existing = $app.findFirstRecordByFilter(
          notifCol,
          "recipient = '" +
            recipientId +
            "' && type = 'commercial_release' && link ~ '" +
            requestId +
            "'",
        )
      } catch (errFind) {
        existing = null
      }
      if (existing) {
        continue
      }

      var notif = new Record(notifCol)
      notif.set('title', 'Liberação comercial pendente')
      notif.set(
        'message',
        pendingAssignment
          ? message + ' — SEM RESPONSÁVEL: atribua um responsável pela análise'
          : message,
      )
      notif.set('recipient', recipientId)
      notif.set('read', false)
      notif.set('link', link)
      notif.set('type', 'commercial_release')
      $app.save(notif)
    }
  } catch (err) {
    $app.logger().error('commercial release notify failed', 'error', String(err))
  }
  return e.next()
}, 'commercial_release_requests')
