migrate(
  (app) => {
    let chamadosCol
    try {
      chamadosCol = app.findCollectionByNameOrId('chamados')
    } catch (_) {
      chamadosCol = null
    }

    if (!chamadosCol) {
      const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
      const rhDeptCol = app.findCollectionByNameOrId('rh_departments')

      const chamados = new Collection({
        name: 'chamados',
        type: 'base',
        listRule:
          "@request.auth.id != '' && (solicitante = @request.auth.id || profissional_responsavel = @request.auth.id || participantes ~ @request.auth.id || @request.auth.role = 'SUP' || @request.auth.perfil_acesso ~ 'admin' || @request.auth.perfil_acesso ~ 'master')",
        viewRule:
          "@request.auth.id != '' && (solicitante = @request.auth.id || profissional_responsavel = @request.auth.id || participantes ~ @request.auth.id || @request.auth.role = 'SUP' || @request.auth.perfil_acesso ~ 'admin' || @request.auth.perfil_acesso ~ 'master')",
        createRule: "@request.auth.id != ''",
        updateRule:
          "@request.auth.id != '' && (solicitante = @request.auth.id || profissional_responsavel = @request.auth.id || aprovador = @request.auth.id || @request.auth.role = 'SUP' || @request.auth.perfil_acesso ~ 'admin' || @request.auth.perfil_acesso ~ 'master')",
        deleteRule:
          "@request.auth.id != '' && (@request.auth.role = 'SUP' || @request.auth.perfil_acesso ~ 'admin')",
        fields: [
          { name: 'numero', type: 'text', required: false },
          { name: 'assunto', type: 'text', required: true },
          { name: 'descricao', type: 'editor', required: true },
          {
            name: 'setor_responsavel',
            type: 'relation',
            required: true,
            collectionId: rhDeptCol.id,
            maxSelect: 1,
          },
          {
            name: 'profissional_responsavel',
            type: 'relation',
            required: false,
            collectionId: usersCol.id,
            maxSelect: 1,
          },
          {
            name: 'solicitante',
            type: 'relation',
            required: true,
            collectionId: usersCol.id,
            maxSelect: 1,
          },
          {
            name: 'prioridade',
            type: 'select',
            required: true,
            values: ['baixa', 'normal', 'alta', 'urgente'],
            maxSelect: 1,
          },
          {
            name: 'status',
            type: 'select',
            required: true,
            values: ['novo', 'andamento', 'aprovacao', 'finalizado', 'cancelado'],
            maxSelect: 1,
          },
          {
            name: 'aprovador',
            type: 'relation',
            required: false,
            collectionId: usersCol.id,
            maxSelect: 1,
          },
          {
            name: 'participantes',
            type: 'relation',
            required: false,
            collectionId: usersCol.id,
            maxSelect: 50,
          },
          {
            name: 'convidados_email',
            type: 'json',
            required: false,
          },
          {
            name: 'anexos',
            type: 'file',
            required: false,
            maxSelect: 10,
            maxSize: 10485760,
            mimeTypes: [
              'image/jpeg',
              'image/png',
              'image/webp',
              'application/pdf',
              'application/vnd.ms-excel',
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            ],
          },
          {
            name: 'prazo_atendimento',
            type: 'date',
            required: false,
          },
          {
            name: 'prazo_resolucao',
            type: 'date',
            required: false,
          },
          {
            name: 'cancelado_justificativa',
            type: 'text',
            required: false,
          },
          {
            name: 'created',
            type: 'autodate',
            onCreate: true,
            onUpdate: false,
          },
          {
            name: 'updated',
            type: 'autodate',
            onCreate: true,
            onUpdate: true,
          },
        ],
        indexes: [
          'CREATE UNIQUE INDEX idx_chamados_numero ON chamados (numero)',
          'CREATE INDEX idx_chamados_status ON chamados (status)',
          'CREATE INDEX idx_chamados_solicitante ON chamados (solicitante)',
          'CREATE INDEX idx_chamados_responsavel ON chamados (profissional_responsavel)',
          'CREATE INDEX idx_chamados_prioridade ON chamados (prioridade)',
          'CREATE INDEX idx_chamados_setor ON chamados (setor_responsavel)',
        ],
      })
      app.save(chamados)
    }

    chamadosCol = app.findCollectionByNameOrId('chamados')
    const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')

    let chamadosHistoricoCol
    try {
      chamadosHistoricoCol = app.findCollectionByNameOrId('chamados_historico')
    } catch (_) {
      chamadosHistoricoCol = null
    }

    if (!chamadosHistoricoCol) {
      const chamadosHistorico = new Collection({
        name: 'chamados_historico',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: null,
        deleteRule: null,
        fields: [
          {
            name: 'chamado',
            type: 'relation',
            required: true,
            collectionId: chamadosCol.id,
            maxSelect: 1,
            cascadeDelete: true,
          },
          {
            name: 'usuario',
            type: 'relation',
            required: true,
            collectionId: usersCol.id,
            maxSelect: 1,
          },
          {
            name: 'status_anterior',
            type: 'text',
            required: false,
          },
          {
            name: 'status_novo',
            type: 'text',
            required: false,
          },
          {
            name: 'descricao_acao',
            type: 'text',
            required: true,
          },
          {
            name: 'anexos_acao',
            type: 'file',
            required: false,
            maxSelect: 5,
            maxSize: 10485760,
          },
          {
            name: 'video_universidade_url',
            type: 'text',
            required: false,
          },
          {
            name: 'video_universidade_titulo',
            type: 'text',
            required: false,
          },
          {
            name: 'criado_em',
            type: 'date',
            required: false,
          },
          {
            name: 'created',
            type: 'autodate',
            onCreate: true,
            onUpdate: false,
          },
          {
            name: 'updated',
            type: 'autodate',
            onCreate: true,
            onUpdate: true,
          },
        ],
        indexes: [
          'CREATE INDEX idx_ch_hist_chamado ON chamados_historico (chamado)',
          'CREATE INDEX idx_ch_hist_created ON chamados_historico (created)',
        ],
      })
      app.save(chamadosHistorico)
    }

    let chamadosComunicacaoCol
    try {
      chamadosComunicacaoCol = app.findCollectionByNameOrId('chamados_comunicacao')
    } catch (_) {
      chamadosComunicacaoCol = null
    }

    if (!chamadosComunicacaoCol) {
      const chamadosComunicacao = new Collection({
        name: 'chamados_comunicacao',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != '' && usuario = @request.auth.id",
        deleteRule:
          "@request.auth.id != '' && (@request.auth.role = 'SUP' || usuario = @request.auth.id)",
        fields: [
          {
            name: 'chamado',
            type: 'relation',
            required: true,
            collectionId: chamadosCol.id,
            maxSelect: 1,
            cascadeDelete: true,
          },
          {
            name: 'usuario',
            type: 'relation',
            required: true,
            collectionId: usersCol.id,
            maxSelect: 1,
          },
          {
            name: 'mensagem',
            type: 'text',
            required: true,
          },
          {
            name: 'anexos',
            type: 'file',
            required: false,
            maxSelect: 5,
            maxSize: 10485760,
          },
          {
            name: 'video_universidade_url',
            type: 'text',
            required: false,
          },
          {
            name: 'video_universidade_titulo',
            type: 'text',
            required: false,
          },
          {
            name: 'criado_em',
            type: 'date',
            required: false,
          },
          {
            name: 'created',
            type: 'autodate',
            onCreate: true,
            onUpdate: false,
          },
          {
            name: 'updated',
            type: 'autodate',
            onCreate: true,
            onUpdate: true,
          },
        ],
        indexes: [
          'CREATE INDEX idx_ch_com_chamado ON chamados_comunicacao (chamado)',
          'CREATE INDEX idx_ch_com_created ON chamados_comunicacao (created)',
        ],
      })
      app.save(chamadosComunicacao)
    }
  },
  (app) => {
    try {
      const com = app.findCollectionByNameOrId('chamados_comunicacao')
      if (com) app.delete(com)
    } catch (_) {}
    try {
      const hist = app.findCollectionByNameOrId('chamados_historico')
      if (hist) app.delete(hist)
    } catch (_) {}
    try {
      const ch = app.findCollectionByNameOrId('chamados')
      if (ch) app.delete(ch)
    } catch (_) {}
  },
)
