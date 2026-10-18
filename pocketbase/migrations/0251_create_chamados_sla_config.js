/// <reference path="../pb_data/types.d.ts" />

migrate(
  (app) => {
    // 1. Adicionar data_conclusao na coleção chamados se ainda não existir
    try {
      const chamadosCol = app.findCollectionByNameOrId('chamados')
      if (chamadosCol && !chamadosCol.fields.getByName('data_conclusao')) {
        chamadosCol.fields.add(
          new DateField({
            name: 'data_conclusao',
            required: false,
          }),
        )
        app.save(chamadosCol)
      }
    } catch (errAdd) {
      console.log('Aviso ao adicionar data_conclusao em chamados:', errAdd)
    }

    // 2. Criar coleção chamados_sla_config para configuração administrativa de prazos
    let slaCol
    try {
      slaCol = app.findCollectionByNameOrId('chamados_sla_config')
    } catch (_) {
      slaCol = null
    }

    if (!slaCol) {
      let rhDeptCol
      try {
        rhDeptCol = app.findCollectionByNameOrId('rh_departments')
      } catch (_) {
        rhDeptCol = null
      }

      const fields = [
        {
          name: 'prioridade',
          type: 'select',
          required: true,
          values: ['baixa', 'normal', 'alta', 'urgente'],
          maxSelect: 1,
        },
        {
          name: 'setor',
          type: 'relation',
          required: false,
          collectionId: rhDeptCol ? rhDeptCol.id : 'rh_departments',
          maxSelect: 1,
        },
        {
          name: 'tempo_primeira_resposta_horas',
          type: 'number',
          required: true,
          min: 1,
        },
        {
          name: 'tempo_resolucao_horas',
          type: 'number',
          required: true,
          min: 1,
        },
        {
          name: 'ativo',
          type: 'bool',
          required: false,
        },
        {
          name: 'descricao',
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
      ]

      const newSlaCol = new Collection({
        name: 'chamados_sla_config',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule:
          "@request.auth.id != '' && (@request.auth.role = 'SUP' || @request.auth.perfil_acesso ~ 'admin' || @request.auth.perfil_acesso ~ 'master')",
        updateRule:
          "@request.auth.id != '' && (@request.auth.role = 'SUP' || @request.auth.perfil_acesso ~ 'admin' || @request.auth.perfil_acesso ~ 'master')",
        deleteRule:
          "@request.auth.id != '' && (@request.auth.role = 'SUP' || @request.auth.perfil_acesso ~ 'admin' || @request.auth.perfil_acesso ~ 'master')",
        fields: fields,
        indexes: [],
      })
      app.save(newSlaCol)

      // 3. Inserir sementes padrão de regras de SLA por prioridade (sem setor específico, regra global)
      const regrasIniciais = [
        {
          prioridade: 'urgente',
          tempo_primeira_resposta_horas: 2,
          tempo_resolucao_horas: 8,
          ativo: true,
          descricao: 'Chamados urgentes: resposta em 2h e resolução em até 8h (1 dia útil).',
        },
        {
          prioridade: 'alta',
          tempo_primeira_resposta_horas: 4,
          tempo_resolucao_horas: 24,
          ativo: true,
          descricao: 'Chamados com alta prioridade: resposta em 4h e resolução em até 24h.',
        },
        {
          prioridade: 'normal',
          tempo_primeira_resposta_horas: 12,
          tempo_resolucao_horas: 48,
          ativo: true,
          descricao: 'Prioridade padrão corporativa: primeira resposta em 12h e resolução em 48h.',
        },
        {
          prioridade: 'baixa',
          tempo_primeira_resposta_horas: 24,
          tempo_resolucao_horas: 72,
          ativo: true,
          descricao: 'Prioridade baixa: primeira resposta em até 24h e resolução em até 72h.',
        },
      ]

      const createdCol = app.findCollectionByNameOrId('chamados_sla_config')
      for (let i = 0; i < regrasIniciais.length; i++) {
        const item = regrasIniciais[i]
        const rec = new Record(createdCol)
        rec.set('prioridade', item.prioridade)
        rec.set('setor', '')
        rec.set('tempo_primeira_resposta_horas', item.tempo_primeira_resposta_horas)
        rec.set('tempo_resolucao_horas', item.tempo_resolucao_horas)
        rec.set('ativo', item.ativo)
        rec.set('descricao', item.descricao)
        app.save(rec)
      }
    }
  },
  (app) => {
    try {
      const col = app.findCollectionByNameOrId('chamados_sla_config')
      if (col) app.delete(col)
    } catch (_) {}
  },
)
