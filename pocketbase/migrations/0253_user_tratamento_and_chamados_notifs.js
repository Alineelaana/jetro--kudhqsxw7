migrate(
  (app) => {
    var usersCol = app.findCollectionByNameOrId('_pb_users_auth_')

    // 1. Campo de tratamento no usuário: masculino, feminino, neutro
    if (!usersCol.fields.getByName('tratamento')) {
      usersCol.fields.add(
        new SelectField({
          name: 'tratamento',
          values: ['masculino', 'feminino', 'neutro'],
          maxSelect: 1,
        }),
      )
    }

    // 2. Campo de fuso_horario no usuário se não existir
    if (!usersCol.fields.getByName('fuso_horario')) {
      usersCol.fields.add(
        new TextField({
          name: 'fuso_horario',
        }),
      )
    }

    app.save(usersCol)

    // 3. Estender tipos de notificação para incluir chamados corporativos
    try {
      var notifCol = app.findCollectionByNameOrId('notifications')
      var typeField = notifCol.fields.getByName('type')
      var requiredValues = [
        'budget_created',
        'budget_saved',
        'stock_low',
        'price_below_cost',
        'approval_pending',
        'account_due',
        'document_expiring',
        'order_delayed',
        'delivery_delayed',
        'negative_margin',
        'integration_error',
        'certificate_expiring',
        'processing_failure',
        'workflow_step',
        'agenda_reminder',
        'monitoring_alert',
        'chamado_atribuido',
        'chamado_status',
        'chamado_comunicacao',
        'chamado_aprovacao',
        'other',
      ]

      if (typeField) {
        notifCol.fields.removeByName('type')
      }
      notifCol.fields.add(
        new SelectField({
          name: 'type',
          required: false,
          values: requiredValues,
          maxSelect: 1,
        }),
      )

      // Garantir regra de criação para usuários autenticados ou chamados
      notifCol.createRule = "@request.auth.id != ''"
      app.save(notifCol)
    } catch (errNotif) {
      console.log('0253: aviso ao atualizar collection notifications: ' + errNotif)
    }

    console.log('0253_user_tratamento_and_chamados_notifs applied successfully')
  },
  (app) => {
    try {
      var usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
      var fTratamento = usersCol.fields.getByName('tratamento')
      if (fTratamento) usersCol.fields.remove(fTratamento)
      var fFuso = usersCol.fields.getByName('fuso_horario')
      if (fFuso) usersCol.fields.remove(fFuso)
      app.save(usersCol)
    } catch (_) {}
  },
)
