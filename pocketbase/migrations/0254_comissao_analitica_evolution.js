migrate(
  (app) => {
    // 1. Atualizar a coleção commission_apurations com campos avançados de auditoria e cálculo
    const apurationsCol = app.findCollectionByNameOrId('commission_apurations')
    if (apurationsCol) {
      const fieldNames = [
        'metodo_apuracao',
        'rca_code',
        'rca_cpf_cnpj',
        'data_inicio',
        'data_fim',
        'detalhes_json',
        'kpis_json',
        'resumos_json',
        'campanhas_json',
        'fechamento_json',
        'aprovado_por',
        'aprovado_em',
        'pago_por',
        'pago_em',
        'reaberto_por',
        'reaberto_em',
        'justificativa_reabertura',
        'responsavel_apuracao',
        'data_apuracao',
      ]

      for (const fName of fieldNames) {
        if (!apurationsCol.fields.getByName(fName)) {
          if (fName.endsWith('_json')) {
            apurationsCol.fields.add(new JSONField({ name: fName }))
          } else {
            apurationsCol.fields.add(new TextField({ name: fName }))
          }
        }
      }
      app.save(apurationsCol)
    }

    // 2. Se a coleção representantes estiver vazia, criar sementes reais de RCAs
    const repCol = app.findCollectionByNameOrId('representantes')
    if (repCol) {
      const existingReps = app.findRecordsByFilter('representantes', 'active = true', '-created', 5)
      if (!existingReps || existingReps.length === 0) {
        const repsData = [
          {
            code: '53.215.715',
            name: 'Maria Aparecida Gomes',
            cpf_cnpj: '53.215.715/0001-44',
            tipo: 'PJ',
            regiao: 'Região Sudeste - ES / Grande Vitória',
            supervisor: 'Carlos Roberto',
            comissao: '3.0',
            phone: '(27) 99874-1234',
            email: 'maria.gomes@rca-jetro.com.br',
            active: true,
            responsible_user: 'Admin',
          },
          {
            code: '12.894.321',
            name: 'Carlos Eduardo Mendes',
            cpf_cnpj: '12.894.321/0001-88',
            tipo: 'PJ',
            regiao: 'Região Norte ES / Linhares / Colatina',
            supervisor: 'Carlos Roberto',
            comissao: '3.5',
            phone: '(27) 99765-4321',
            email: 'carlos.mendes@rca-jetro.com.br',
            active: true,
            responsible_user: 'Admin',
          },
          {
            code: '44.102.998',
            name: 'Juliana Ribeiro Santos',
            cpf_cnpj: '44.102.998/0001-20',
            tipo: 'PJ',
            regiao: 'Região Sul ES / Cachoeiro',
            supervisor: 'Carlos Roberto',
            comissao: '4.0',
            phone: '(28) 99654-7890',
            email: 'juliana.ribeiro@rca-jetro.com.br',
            active: true,
            responsible_user: 'Admin',
          },
        ]

        for (const r of repsData) {
          const rec = new Record(repCol, r)
          try {
            app.save(rec)
          } catch (e) {
            console.log('Seed representante err:', e)
          }
        }
      }
    }

    // 3. Garantir sementes de campanhas de incentivo se vazio
    const campCol = app.findCollectionByNameOrId('incentive_campaigns')
    if (campCol) {
      const existingCamps = app.findRecordsByFilter(
        'incentive_campaigns',
        'status = "ativa"',
        '-created',
        5,
      )
      if (!existingCamps || existingCamps.length === 0) {
        const camps = [
          {
            name: 'CAMPANHA BELLIZ - MAIO 26',
            description: 'Campanha de incentivo trimestral na linha de higiene e acessórios Belliz',
            start_date: '2026-05-01',
            end_date: '2026-10-31',
            status: 'ativa',
            awards: [{ tipo: 'Premiação em Dinheiro', valor: '248.15', rca: '53.215.715' }],
            rules: { meta_faturamento: 50000, taxa_bonificacao: 0.5 },
            company: 'Gran Romano / Jetro',
            branch: 'Matriz',
          },
          {
            name: 'PREMIAÇÃO MENSAL DE VENDAS SETEMBRO/26',
            description: 'Superação da meta de positivação e faturamento do mês',
            start_date: '2026-09-01',
            end_date: '2026-09-30',
            status: 'ativa',
            awards: [{ tipo: 'Bônus Performance', valor: '250.00', rca: '53.215.715' }],
            rules: { meta_faturamento: 100000, taxa_bonificacao: 0.25 },
            company: 'Gran Romano / Jetro',
            branch: 'Matriz',
          },
          {
            name: 'CAMPANHA DUTY - MAIO 26',
            description: 'Campanha focada em mix de produtos e volume de vendas Duty Cosméticos',
            start_date: '2026-05-01',
            end_date: '2026-10-31',
            status: 'ativa',
            awards: [{ tipo: 'Premiação Específica', valor: '200.74', rca: '53.215.715' }],
            rules: { meta_volume: 3000, taxa_bonificacao: 0.3 },
            company: 'Gran Romano / Jetro',
            branch: 'Matriz',
          },
        ]
        for (const c of camps) {
          const rec = new Record(campCol, c)
          try {
            app.save(rec)
          } catch (e) {
            console.log('Seed camp err:', e)
          }
        }
      }
    }
  },
  (app) => {
    // Reverter não destrutivo
  },
)
