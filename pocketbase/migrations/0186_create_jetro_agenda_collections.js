migrate(
  (app) => {
    // 1. Coleção principal: jetro_agenda_appointments
    const appointmentsCol = new Collection({
      name: 'jetro_agenda_appointments',
      type: 'base',
      listRule: "@request.auth.id != '' && user_id = @request.auth.id",
      viewRule: "@request.auth.id != '' && user_id = @request.auth.id",
      createRule: "@request.auth.id != '' && @request.body.user_id = @request.auth.id",
      updateRule: "@request.auth.id != '' && user_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user_id = @request.auth.id",
      fields: [
        {
          name: 'user_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'user_email', type: 'text' },
        { name: 'user_name', type: 'text' },
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'text' },
        { name: 'date', type: 'text', required: true }, // YYYY-MM-DD
        { name: 'start_time', type: 'text' }, // HH:mm (opcional para tarefas gerais)
        { name: 'end_time', type: 'text' }, // HH:mm (opcional)
        {
          name: 'type',
          type: 'select',
          required: true,
          values: ['Tarefa', 'Reuniao', 'Compromisso', 'Lembrete', 'Outros'],
          maxSelect: 1,
        },
        {
          name: 'priority',
          type: 'select',
          required: true,
          values: ['Baixa', 'Media', 'Alta', 'Urgente'],
          maxSelect: 1,
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['Pendente', 'Em andamento', 'Concluido', 'Cancelado'],
          maxSelect: 1,
        },
        { name: 'has_reminder', type: 'bool' },
        { name: 'reminder_configs', type: 'json' }, // lista com offsets selecionados: ["15m", "30m", "1h", "2h", "6h", "12h", "1d", "2d", "1w", "custom:45m", etc.]
        { name: 'reminder_target_email', type: 'text' },
        {
          name: 'recurrence',
          type: 'select',
          values: ['none', 'daily', 'weekly', 'biweekly', 'monthly', 'yearly'],
          maxSelect: 1,
        },
        { name: 'recurrence_end_date', type: 'text' }, // YYYY-MM-DD
        { name: 'parent_appointment_id', type: 'text' }, // se gerado por recorrência
        { name: 'is_completed', type: 'bool' },
        { name: 'completed_at', type: 'text' },
        { name: 'reference_time_for_reminder', type: 'text' }, // HH:mm usado quando start_time vazio
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_jaa_user_date ON jetro_agenda_appointments (user_id, date)',
        'CREATE INDEX idx_jaa_user_status ON jetro_agenda_appointments (user_id, status)',
        'CREATE INDEX idx_jaa_user_type ON jetro_agenda_appointments (user_id, type)',
        'CREATE INDEX idx_jaa_parent ON jetro_agenda_appointments (parent_appointment_id)',
      ],
    })
    app.save(appointmentsCol)

    // 2. Coleção de disparo de lembretes no servidor: jetro_agenda_reminders
    const remindersCol = new Collection({
      name: 'jetro_agenda_reminders',
      type: 'base',
      listRule: "@request.auth.id != '' && user_id = @request.auth.id",
      viewRule: "@request.auth.id != '' && user_id = @request.auth.id",
      createRule: "@request.auth.id != '' && @request.body.user_id = @request.auth.id",
      updateRule: "@request.auth.id != '' && user_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user_id = @request.auth.id",
      fields: [
        {
          name: 'appointment_id',
          type: 'relation',
          required: true,
          collectionId: appointmentsCol.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'user_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'recipient_email', type: 'text', required: true },
        { name: 'recipient_name', type: 'text' },
        { name: 'appointment_title', type: 'text', required: true },
        { name: 'appointment_description', type: 'text' },
        { name: 'appointment_date', type: 'text', required: true }, // YYYY-MM-DD
        { name: 'appointment_time', type: 'text' }, // HH:mm
        { name: 'appointment_priority', type: 'text' },
        { name: 'appointment_type', type: 'text' },
        { name: 'reminder_offset_key', type: 'text', required: true }, // ex: "15m", "1d", "custom_90m"
        { name: 'scheduled_for', type: 'text', required: true }, // ISO string UTC do momento de disparo
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['pending', 'sent', 'cancelled', 'failed', 'skipped_past'],
          maxSelect: 1,
        },
        { name: 'sent_at', type: 'text' },
        { name: 'error_message', type: 'text' },
        { name: 'attempts', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_jar_status_sched ON jetro_agenda_reminders (status, scheduled_for)',
        'CREATE INDEX idx_jar_appt_offset ON jetro_agenda_reminders (appointment_id, reminder_offset_key)',
        'CREATE INDEX idx_jar_user ON jetro_agenda_reminders (user_id)',
      ],
    })
    app.save(remindersCol)

    console.log('0186_create_jetro_agenda_collections applied successfully')
  },
  (app) => {
    try {
      const col2 = app.findCollectionByNameOrId('jetro_agenda_reminders')
      if (col2) app.delete(col2)
    } catch (_) {}
    try {
      const col1 = app.findCollectionByNameOrId('jetro_agenda_appointments')
      if (col1) app.delete(col1)
    } catch (_) {}
  },
)
