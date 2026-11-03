migrate(
  (app) => {
    // 1. Finalizar chamados de teste/seed que estavam em aberto gerando disparos pelo cron
    try {
      const chamadosCol = app.findCollectionByNameOrId('chamados')
      if (chamadosCol) {
        const testRecords = app.findRecordsByFilter(
          'chamados',
          'status != "finalizado" && status != "cancelado" && (assunto ~ "TESTE" || assunto ~ "teste")',
          '-created',
          500,
          0,
        )
        for (let i = 0; i < testRecords.length; i++) {
          const r = testRecords[i]
          r.set('status', 'finalizado')
          r.set(
            'solucao',
            'Chamado de teste homologado e encerrado para desativar alertas automáticos.',
          )
          app.saveNoValidate(r)
        }
      }
    } catch (e) {
      console.log('0307 chamados cleanup error:', e)
    }

    // 2. Marcar lembretes da agenda com e-mails fictícios/teste como processed/failed para não disparar no cron
    try {
      const remCol = app.findCollectionByNameOrId('jetro_agenda_reminders')
      if (remCol) {
        const testReminders = app.findRecordsByFilter(
          'jetro_agenda_reminders',
          'status = "pending" && (recipient_email ~ "teste" || recipient_email ~ "exemplo" || recipient_email ~ "example")',
          '-created',
          500,
          0,
        )
        for (let j = 0; j < testReminders.length; j++) {
          const rem = testReminders[j]
          rem.set('status', 'failed')
          rem.set('error_message', 'E-mail de teste cancelado preventivamente.')
          app.saveNoValidate(rem)
        }
      }
    } catch (e) {
      console.log('0307 reminders cleanup error:', e)
    }
  },
  (app) => {
    // Reversão não necessária / no-op
  },
)
