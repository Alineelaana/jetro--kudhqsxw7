migrate(
  (app) => {
    // 1. Coleção: site_clients
    let colClients = null
    try {
      colClients = app.findCollectionByNameOrId('site_clients')
    } catch (_) {}

    if (!colClients) {
      colClients = new Collection({
        name: 'site_clients',
        type: 'base',
        // Leitura pública permitida para clientes ativos na vitrine
        listRule:
          'ativo = true || (@request.auth.id != "" && (@request.auth.role = "SUP" || @request.auth.role = "ADMIN"))',
        viewRule:
          'ativo = true || (@request.auth.id != "" && (@request.auth.role = "SUP" || @request.auth.role = "ADMIN"))',
        // Somente administradores (SUP / ADMIN) gerenciam clientes do site
        createRule:
          '@request.auth.id != "" && (@request.auth.role = "SUP" || @request.auth.role = "ADMIN")',
        updateRule:
          '@request.auth.id != "" && (@request.auth.role = "SUP" || @request.auth.role = "ADMIN")',
        deleteRule:
          '@request.auth.id != "" && (@request.auth.role = "SUP" || @request.auth.role = "ADMIN")',
        fields: [
          { name: 'nome', type: 'text', required: true },
          {
            name: 'logo',
            type: 'file',
            maxSelect: 1,
            maxSize: 5242880,
            mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
          },
          { name: 'site', type: 'text' },
          { name: 'instagram', type: 'text' },
          { name: 'ordem', type: 'number' },
          { name: 'ativo', type: 'bool' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_site_clients_ordem ON site_clients (ordem)',
          'CREATE INDEX idx_site_clients_ativo ON site_clients (ativo)',
          'CREATE INDEX idx_site_clients_nome ON site_clients (nome)',
        ],
      })
      app.save(colClients)
    }

    // 2. Seed inicial dos 4 clientes solicitados: DEC Eldorado, Gran Romano, Velora Digital Commerce, RBJ
    const initialClients = [
      {
        nome: 'DEC Eldorado',
        site: 'https://deceldorado.com.br',
        instagram: 'deceldorado',
        ordem: 1,
        ativo: true,
      },
      {
        nome: 'Gran Romano',
        site: 'https://granromano.com.br',
        instagram: 'granromanoalimentos',
        ordem: 2,
        ativo: true,
      },
      {
        nome: 'Velora Digital Commerce',
        site: 'https://velora.digital',
        instagram: 'veloradigital',
        ordem: 3,
        ativo: true,
      },
      {
        nome: 'RBJ',
        site: '',
        instagram: 'rbj_oficial',
        ordem: 4,
        ativo: true,
      },
    ]

    for (let i = 0; i < initialClients.length; i++) {
      const item = initialClients[i]
      try {
        const existing = app.findFirstRecordByFilter('site_clients', 'nome = {:nome}', {
          nome: item.nome,
        })
        if (!existing) {
          const rec = new Record(colClients)
          rec.set('nome', item.nome)
          rec.set('site', item.site)
          rec.set('instagram', item.instagram)
          rec.set('ordem', item.ordem)
          rec.set('ativo', item.ativo)
          app.save(rec)
        }
      } catch (_) {
        const rec = new Record(colClients)
        rec.set('nome', item.nome)
        rec.set('site', item.site)
        rec.set('instagram', item.instagram)
        rec.set('ordem', item.ordem)
        rec.set('ativo', item.ativo)
        app.save(rec)
      }
    }

    // 3. Coleção: site_testimonials
    let colTestimonials = null
    try {
      colTestimonials = app.findCollectionByNameOrId('site_testimonials')
    } catch (_) {}

    if (!colTestimonials) {
      colTestimonials = new Collection({
        name: 'site_testimonials',
        type: 'base',
        // listRule e viewRule:
        // Apenas depoimentos aprovados ou administradores autorizados.
        listRule:
          'status = "Aprovado" || (@request.auth.id != "" && (@request.auth.role = "SUP" || @request.auth.role = "ADMIN"))',
        viewRule:
          'status = "Aprovado" || (@request.auth.id != "" && (@request.auth.role = "SUP" || @request.auth.role = "ADMIN"))',
        // Criação pública permitida (visitante enviando depoimento), mas status inicial será forçado para "Pendente de Aprovação"
        createRule: '',
        // Atualização e deleção estritamente para administradores (SUP / ADMIN)
        updateRule:
          '@request.auth.id != "" && (@request.auth.role = "SUP" || @request.auth.role = "ADMIN")',
        deleteRule:
          '@request.auth.id != "" && (@request.auth.role = "SUP" || @request.auth.role = "ADMIN")',
        fields: [
          { name: 'nome_autor', type: 'text', required: true },
          { name: 'empresa', type: 'text', required: true },
          { name: 'email', type: 'email', required: true },
          { name: 'instagram', type: 'text', required: true },
          { name: 'depoimento', type: 'text', required: true },
          {
            name: 'foto',
            type: 'file',
            maxSelect: 1,
            maxSize: 5242880,
            mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
          },
          {
            name: 'status',
            type: 'select',
            values: ['Pendente de Aprovação', 'Aprovado', 'Reprovado', 'Despublicado'],
            maxSelect: 1,
            required: true,
          },
          { name: 'verificado', type: 'bool' },
          { name: 'autorizacao_confirmada', type: 'bool' },
          { name: 'autorizacao_versao', type: 'text' },
          { name: 'autorizacao_hash', type: 'text' },
          { name: 'autorizacao_data', type: 'text' },
          { name: 'aprovado_por', type: 'text' },
          { name: 'aprovado_em', type: 'text' },
          { name: 'reprovado_por', type: 'text' },
          { name: 'reprovado_em', type: 'text' },
          { name: 'reprovado_motivo', type: 'text' },
          { name: 'despublicado_por', type: 'text' },
          { name: 'despublicado_em', type: 'text' },
          { name: 'despublicado_motivo', type: 'text' },
          { name: 'ip_origem', type: 'text' },
          { name: 'user_agent', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_site_testim_status ON site_testimonials (status)',
          'CREATE INDEX idx_site_testim_empresa ON site_testimonials (empresa)',
          'CREATE INDEX idx_site_testim_created ON site_testimonials (created)',
          'CREATE INDEX idx_site_testim_verificado ON site_testimonials (verificado)',
        ],
      })
      app.save(colTestimonials)
    }
  },
  (app) => {
    try {
      const ct = app.findCollectionByNameOrId('site_testimonials')
      if (ct) app.delete(ct)
    } catch (_) {}
    try {
      const cc = app.findCollectionByNameOrId('site_clients')
      if (cc) app.delete(cc)
    } catch (_) {}
  },
)
