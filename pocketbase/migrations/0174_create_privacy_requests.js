migrate(
  (app) => {
    app.save(
      new Collection({
        name: 'privacy_requests',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: '',
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.id != ''",
        fields: [
          { name: 'nome', type: 'text', required: true },
          { name: 'email', type: 'email', required: true },
          { name: 'empresa', type: 'text' },
          { name: 'telefone', type: 'text' },
          {
            name: 'tipo_solicitacao',
            type: 'select',
            values: [
              'Correção',
              'Exclusão',
              'Acesso',
              'Portabilidade',
              'Revogação',
              'Reclamação',
              'Outros',
            ],
            maxSelect: 1,
            required: true,
          },
          { name: 'mensagem', type: 'text', required: true },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_privreq_tipo ON privacy_requests (tipo_solicitacao)',
          'CREATE INDEX idx_privreq_created ON privacy_requests (created)',
        ],
      }),
    )
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('privacy_requests'))
    } catch (_) {}
  },
)
