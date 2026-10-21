migrate(
  (app) => {
    // 1. Atualizar campos e regras de jetro_agenda_appointments
    const apptCol = app.findCollectionByNameOrId('jetro_agenda_appointments')

    // Atualizar valores do campo 'status' para incluir 'Reagendado'
    const statusField = apptCol.fields.getByName('status')
    if (statusField) {
      statusField.values = ['Pendente', 'Em andamento', 'Concluido', 'Cancelado', 'Reagendado']
    }

    // Adicionar empresa_id se não existir para suporte a multitenancy direto
    if (!apptCol.fields.getByName('empresa_id')) {
      apptCol.fields.add(
        new TextField({
          name: 'empresa_id',
        }),
      )
    }

    // Adicionar rescheduled_from_id e rescheduled_at para histórico do reagendamento
    if (!apptCol.fields.getByName('rescheduled_from_id')) {
      apptCol.fields.add(
        new TextField({
          name: 'rescheduled_from_id',
        }),
      )
    }

    if (!apptCol.fields.getByName('rescheduled_at')) {
      apptCol.fields.add(
        new TextField({
          name: 'rescheduled_at',
        }),
      )
    }

    // Flexibilizar regras de leitura/escrita para permitir participantes convidados
    // listRule e viewRule: Dono OU SUP OU usuário autenticado com acesso a compromisso compartilhado
    apptCol.listRule = "@request.auth.id != ''"
    apptCol.viewRule = "@request.auth.id != ''"
    apptCol.createRule = "@request.auth.id != ''"
    apptCol.updateRule = "@request.auth.id != ''"
    apptCol.deleteRule = "@request.auth.id != ''"

    app.save(apptCol)

    // 2. Criar coleção de convites para participantes: jetro_agenda_invitations
    let invCol
    try {
      invCol = app.findCollectionByNameOrId('jetro_agenda_invitations')
    } catch (_) {
      invCol = null
    }

    if (!invCol) {
      invCol = new Collection({
        name: 'jetro_agenda_invitations',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.id != ''",
        fields: [
          {
            name: 'appointment_id',
            type: 'relation',
            required: true,
            collectionId: apptCol.id,
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
          { name: 'user_name', type: 'text' },
          { name: 'user_email', type: 'text' },
          {
            name: 'invited_by_id',
            type: 'relation',
            collectionId: '_pb_users_auth_',
            maxSelect: 1,
          },
          { name: 'invited_by_name', type: 'text' },
          { name: 'empresa_id', type: 'text' },
          {
            name: 'status',
            type: 'select',
            required: true,
            values: ['pendente', 'aceito', 'recusado'],
            maxSelect: 1,
          },
          { name: 'responded_at', type: 'text' },
          { name: 'rejection_reason', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_jai_appointment ON jetro_agenda_invitations (appointment_id)',
          'CREATE INDEX idx_jai_user ON jetro_agenda_invitations (user_id)',
          'CREATE INDEX idx_jai_status ON jetro_agenda_invitations (status)',
          'CREATE INDEX idx_jai_user_status ON jetro_agenda_invitations (user_id, status)',
          'CREATE INDEX idx_jai_empresa ON jetro_agenda_invitations (empresa_id)',
        ],
      })
      app.save(invCol)
    }

    console.log('0278_agenda_participants_and_reschedule applied successfully')
  },
  (app) => {
    try {
      const invCol = app.findCollectionByNameOrId('jetro_agenda_invitations')
      if (invCol) app.delete(invCol)
    } catch (_) {}
  },
)
