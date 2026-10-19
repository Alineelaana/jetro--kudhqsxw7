migrate(
  (app) => {
    // 1. Coleção: commission_award_types (Tipos de Premiações cadastráveis)
    let awardTypesCol = null
    try {
      awardTypesCol = app.findCollectionByNameOrId('commission_award_types')
    } catch (e) {
      awardTypesCol = null
    }

    if (!awardTypesCol) {
      awardTypesCol = new Collection({
        name: 'commission_award_types',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.role = 'SUP'",
        fields: [
          { name: 'name', type: 'text', required: true },
          { name: 'code', type: 'text' },
          { name: 'description', type: 'text' },
          { name: 'active', type: 'bool' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE UNIQUE INDEX idx_commission_award_types_name ON commission_award_types (name)',
        ],
      })
      app.save(awardTypesCol)

      // Sementes dos tipos iniciais de premiações
      const seedAwardTypes = [
        {
          name: 'Campanha Comercial',
          code: 'CAMPANHA',
          description: 'Pagamento de campanhas comerciais vigentes',
        },
        {
          name: 'Premiação por Metas Atingidas',
          code: 'METAS',
          description: 'Atingimento ou superação de metas comerciais',
        },
        {
          name: 'Bonificação por Desempenho',
          code: 'BONIFICACAO',
          description: 'Reconhecimento por desempenho excepcional',
        },
        {
          name: 'Incentivo Comercial',
          code: 'INCENTIVO',
          description: 'Incentivo de curto prazo ou de produto foco',
        },
        {
          name: 'Gratificação Extraordinária',
          code: 'GRATIFICACAO',
          description: 'Gratificações excepcionais autorizadas',
        },
        {
          name: 'Outros Pagamentos Extras',
          code: 'OUTROS',
          description: 'Demais proventos e valores adicionais',
        },
      ]
      for (const t of seedAwardTypes) {
        try {
          const rec = new Record(awardTypesCol, { ...t, active: true })
          app.save(rec)
        } catch (errSeed) {
          console.log('Seed award type err:', errSeed)
        }
      }
    }

    // 2. Coleção: commission_deduction_reasons (Motivos de Dedução cadastráveis)
    let deductionReasonsCol = null
    try {
      deductionReasonsCol = app.findCollectionByNameOrId('commission_deduction_reasons')
    } catch (e) {
      deductionReasonsCol = null
    }

    if (!deductionReasonsCol) {
      deductionReasonsCol = new Collection({
        name: 'commission_deduction_reasons',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.role = 'SUP'",
        fields: [
          { name: 'name', type: 'text', required: true },
          { name: 'code', type: 'text' },
          { name: 'description', type: 'text' },
          { name: 'requires_devolution', type: 'bool' },
          { name: 'active', type: 'bool' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE UNIQUE INDEX idx_commission_ded_reasons_name ON commission_deduction_reasons (name)',
        ],
      })
      app.save(deductionReasonsCol)

      // Sementes dos motivos iniciais de dedução
      const seedDeductionReasons = [
        {
          name: 'Devolução de Mercadorias',
          code: 'DEVOLUCAO',
          description: 'Débitos relacionados a devoluções de vendas',
          requires_devolution: true,
        },
        {
          name: 'Estorno de Comissão',
          code: 'ESTORNO',
          description: 'Estornos decorrentes de cancelamentos ou inadimplência',
          requires_devolution: false,
        },
        {
          name: 'Ajuste de Pagamentos Anteriores',
          code: 'AJUSTE',
          description: 'Compensação de valores apurados em competências anteriores',
          requires_devolution: false,
        },
        {
          name: 'Correção de Valor Pago Indevidamente',
          code: 'CORRECAO',
          description: 'Correção e ressarcimento de pagamentos indevidos',
          requires_devolution: false,
        },
        {
          name: 'Outros Descontos Autorizados',
          code: 'OUTROS',
          description: 'Outras deduções justificadas e aprovadas pela gerência',
          requires_devolution: false,
        },
      ]
      for (const r of seedDeductionReasons) {
        try {
          const rec = new Record(deductionReasonsCol, { ...r, active: true })
          app.save(rec)
        } catch (errSeed) {
          console.log('Seed deduction reason err:', errSeed)
        }
      }
    }

    // 3. Coleção: commission_awards (Premiações)
    let awardsCol = null
    try {
      awardsCol = app.findCollectionByNameOrId('commission_awards')
    } catch (e) {
      awardsCol = null
    }

    if (!awardsCol) {
      awardsCol = new Collection({
        name: 'commission_awards',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.role = 'SUP'",
        fields: [
          { name: 'company', type: 'text', required: true },
          { name: 'branch', type: 'text' },
          { name: 'beneficiary_id', type: 'text', required: true },
          { name: 'beneficiary_code', type: 'text' },
          { name: 'beneficiary_name', type: 'text', required: true },
          { name: 'beneficiary_cpf_cnpj', type: 'text' },
          { name: 'role_name', type: 'text', required: true },
          { name: 'competencia', type: 'text', required: true }, // Formato YYYY-MM
          { name: 'release_date', type: 'text', required: true }, // YYYY-MM-DD
          { name: 'award_type', type: 'text', required: true },
          { name: 'description', type: 'text', required: true },
          { name: 'amount', type: 'number', required: true, min: 0.01 },
          { name: 'campaign_id', type: 'text' },
          { name: 'campaign_name', type: 'text' },
          { name: 'observations', type: 'text' },
          {
            name: 'attachments',
            type: 'file',
            maxSelect: 10,
            maxSize: 15728640,
            mimeTypes: ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'],
          },
          { name: 'responsible_user_id', type: 'text' },
          { name: 'responsible_user_name', type: 'text' },
          {
            name: 'status',
            type: 'select',
            required: true,
            values: ['Pendente', 'Aprovado', 'Rejeitado', 'Cancelado'],
            maxSelect: 1,
          },
          { name: 'approved_by_id', type: 'text' },
          { name: 'approved_by_name', type: 'text' },
          { name: 'approved_at', type: 'text' },
          { name: 'rejected_by_id', type: 'text' },
          { name: 'rejected_by_name', type: 'text' },
          { name: 'rejected_at', type: 'text' },
          { name: 'cancelled_by_id', type: 'text' },
          { name: 'cancelled_by_name', type: 'text' },
          { name: 'cancelled_at', type: 'text' },
          { name: 'justification', type: 'text' },
          { name: 'history', type: 'json' },
          { name: 'hash_duplicidade', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_commission_awards_comp ON commission_awards (competencia)',
          'CREATE INDEX idx_commission_awards_beneficiary ON commission_awards (beneficiary_id, beneficiary_code)',
          'CREATE INDEX idx_commission_awards_status ON commission_awards (status)',
          'CREATE INDEX idx_commission_awards_company ON commission_awards (company)',
        ],
      })
      app.save(awardsCol)
    }

    // 4. Coleção: commission_deductions (Descontos e Deduções)
    let deductionsCol = null
    try {
      deductionsCol = app.findCollectionByNameOrId('commission_deductions')
    } catch (e) {
      deductionsCol = null
    }

    if (!deductionsCol) {
      deductionsCol = new Collection({
        name: 'commission_deductions',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.role = 'SUP'",
        fields: [
          { name: 'company', type: 'text', required: true },
          { name: 'branch', type: 'text' },
          { name: 'beneficiary_id', type: 'text', required: true },
          { name: 'beneficiary_code', type: 'text' },
          { name: 'beneficiary_name', type: 'text', required: true },
          { name: 'beneficiary_cpf_cnpj', type: 'text' },
          { name: 'role_name', type: 'text', required: true },
          { name: 'competencia', type: 'text', required: true }, // Formato YYYY-MM
          { name: 'release_date', type: 'text', required: true }, // YYYY-MM-DD
          { name: 'deduction_type', type: 'text', required: true },
          { name: 'reason', type: 'text', required: true },
          { name: 'description', type: 'text', required: true },
          { name: 'amount', type: 'number', required: true, min: 0.01 },
          { name: 'order_number', type: 'text' },
          { name: 'order_id', type: 'text' },
          { name: 'invoice_number', type: 'text' },
          { name: 'invoice_id', type: 'text' },
          { name: 'client_name', type: 'text' },
          { name: 'client_id', type: 'text' },
          { name: 'devolution_id', type: 'text' },
          { name: 'devolution_number', type: 'text' },
          { name: 'observations', type: 'text' },
          {
            name: 'attachments',
            type: 'file',
            maxSelect: 10,
            maxSize: 15728640,
            mimeTypes: ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'],
          },
          { name: 'responsible_user_id', type: 'text' },
          { name: 'responsible_user_name', type: 'text' },
          {
            name: 'status',
            type: 'select',
            required: true,
            values: ['Pendente', 'Aprovado', 'Rejeitado', 'Cancelado'],
            maxSelect: 1,
          },
          { name: 'approved_by_id', type: 'text' },
          { name: 'approved_by_name', type: 'text' },
          { name: 'approved_at', type: 'text' },
          { name: 'rejected_by_id', type: 'text' },
          { name: 'rejected_by_name', type: 'text' },
          { name: 'rejected_at', type: 'text' },
          { name: 'cancelled_by_id', type: 'text' },
          { name: 'cancelled_by_name', type: 'text' },
          { name: 'cancelled_at', type: 'text' },
          { name: 'justification', type: 'text' },
          { name: 'history', type: 'json' },
          { name: 'hash_duplicidade', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_commission_deductions_comp ON commission_deductions (competencia)',
          'CREATE INDEX idx_commission_deductions_beneficiary ON commission_deductions (beneficiary_id, beneficiary_code)',
          'CREATE INDEX idx_commission_deductions_status ON commission_deductions (status)',
          'CREATE INDEX idx_commission_deductions_devolution ON commission_deductions (devolution_id)',
          'CREATE INDEX idx_commission_deductions_company ON commission_deductions (company)',
        ],
      })
      app.save(deductionsCol)
    }

    // Sementes iniciais para demonstração realista vinculadas à competência 2026-09
    // Maria Aparecida Gomes (RCA 53.215.715)
    try {
      const existingAwards = app.findRecordsByFilter(
        'commission_awards',
        'beneficiary_code = "53.215.715" && competencia = "2026-09"',
        '-created',
        1,
      )
      if (!existingAwards || existingAwards.length === 0) {
        const seedAwards = [
          {
            company: 'Gran Romano / Jetro Matriz',
            branch: 'Matriz - ES',
            beneficiary_id: 'nqs10lxv8096wq6',
            beneficiary_code: '53.215.715',
            beneficiary_name: 'Maria Aparecida Gomes',
            beneficiary_cpf_cnpj: '53.215.715/0001-44',
            role_name: 'Representante Comercial Autônomo (RCA)',
            competencia: '2026-09',
            release_date: '2026-09-25',
            award_type: 'Premiação por Metas Atingidas',
            description: 'Superação de Meta Trimestral Linha Belliz - Bônus Ouro',
            amount: 500.0,
            campaign_name: 'CAMPANHA BELLIZ - MAIO 26',
            observations: 'Premiação concedida pelo comitê comercial por atingir 125% da meta',
            responsible_user_id: 't2ls955cvcpburb',
            responsible_user_name: 'Jetro Admin',
            status: 'Aprovado',
            approved_by_id: 't2ls955cvcpburb',
            approved_by_name: 'Jetro Admin',
            approved_at: '2026-09-26 14:30:00',
            history: [
              {
                acao: 'CRIACAO',
                usuario_nome: 'Jetro Admin',
                data: '2026-09-25 10:00:00',
                detalhes: 'Lançamento inicial criado como Pendente',
              },
              {
                acao: 'APROVACAO',
                usuario_nome: 'Jetro Admin',
                data: '2026-09-26 14:30:00',
                detalhes: 'Lançamento aprovado para compor o fechamento',
              },
            ],
            hash_duplicidade:
              '53.215.715|2026-09|Premiação por Metas Atingidas|500.00|Superação de Meta Trimestral Linha Belliz - Bônus Ouro',
          },
          {
            company: 'Gran Romano / Jetro Matriz',
            branch: 'Matriz - ES',
            beneficiary_id: 'nqs10lxv8096wq6',
            beneficiary_code: '53.215.715',
            beneficiary_name: 'Maria Aparecida Gomes',
            beneficiary_cpf_cnpj: '53.215.715/0001-44',
            role_name: 'Representante Comercial Autônomo (RCA)',
            competencia: '2026-09',
            release_date: '2026-09-28',
            award_type: 'Bonificação por Desempenho',
            description: 'Incentivo Positivação de Novos Clientes Região Vitória',
            amount: 250.0,
            observations: 'Aguardando validação formal de cadastro',
            responsible_user_id: 't2ls955cvcpburb',
            responsible_user_name: 'Jetro Admin',
            status: 'Pendente',
            history: [
              {
                acao: 'CRIACAO',
                usuario_nome: 'Jetro Admin',
                data: '2026-09-28 09:15:00',
                detalhes:
                  'Lançamento registrado como Pendente (não compõe total líquido até aprovação)',
              },
            ],
            hash_duplicidade:
              '53.215.715|2026-09|Bonificação por Desempenho|250.00|Incentivo Positivação de Novos Clientes Região Vitória',
          },
        ]
        for (const item of seedAwards) {
          const rec = new Record(awardsCol, item)
          app.save(rec)
        }
      }
    } catch (e) {
      console.log('Seed awards err:', e)
    }

    try {
      const existingDeductions = app.findRecordsByFilter(
        'commission_deductions',
        'beneficiary_code = "53.215.715" && competencia = "2026-09"',
        '-created',
        1,
      )
      if (!existingDeductions || existingDeductions.length === 0) {
        const seedDeductions = [
          {
            company: 'Gran Romano / Jetro Matriz',
            branch: 'Matriz - ES',
            beneficiary_id: 'nqs10lxv8096wq6',
            beneficiary_code: '53.215.715',
            beneficiary_name: 'Maria Aparecida Gomes',
            beneficiary_cpf_cnpj: '53.215.715/0001-44',
            role_name: 'Representante Comercial Autônomo (RCA)',
            competencia: '2026-09',
            release_date: '2026-09-18',
            deduction_type: 'Ajuste de Pagamentos Anteriores',
            reason: 'Ajuste de Pagamentos Anteriores',
            description: 'Compensação de adiantamento financeiro extraordinário acordado',
            amount: 180.0,
            order_number: '1226456',
            invoice_number: '173299',
            client_name: 'COMERCIAL ALIMENTOS PROGRESSO LTDA',
            observations: 'Desconto aprovado pela diretoria financeira',
            responsible_user_id: 't2ls955cvcpburb',
            responsible_user_name: 'Jetro Admin',
            status: 'Aprovado',
            approved_by_id: 't2ls955cvcpburb',
            approved_by_name: 'Jetro Admin',
            approved_at: '2026-09-19 11:20:00',
            history: [
              {
                acao: 'CRIACAO',
                usuario_nome: 'Jetro Admin',
                data: '2026-09-18 16:45:00',
                detalhes: 'Lançamento registrado como Pendente',
              },
              {
                acao: 'APROVACAO',
                usuario_nome: 'Jetro Admin',
                data: '2026-09-19 11:20:00',
                detalhes: 'Dedução autorizada pela diretoria comercial e financeira',
              },
            ],
            hash_duplicidade:
              '53.215.715|2026-09|Ajuste de Pagamentos Anteriores|180.00|Compensação de adiantamento financeiro extraordinário acordado',
          },
          {
            company: 'Gran Romano / Jetro Matriz',
            branch: 'Matriz - ES',
            beneficiary_id: 'nqs10lxv8096wq6',
            beneficiary_code: '53.215.715',
            beneficiary_name: 'Maria Aparecida Gomes',
            beneficiary_cpf_cnpj: '53.215.715/0001-44',
            role_name: 'Representante Comercial Autônomo (RCA)',
            competencia: '2026-09',
            release_date: '2026-09-29',
            deduction_type: 'Outros Descontos Autorizados',
            reason: 'Outros Descontos Autorizados',
            description: 'Ressarcimento de despesa de transporte emergencial pendente',
            amount: 75.0,
            client_name: 'SUPERMERCADOS MODELO DO BRASIL S/A',
            observations: 'Em conferência pelo departamento comercial',
            responsible_user_id: 't2ls955cvcpburb',
            responsible_user_name: 'Jetro Admin',
            status: 'Pendente',
            history: [
              {
                acao: 'CRIACAO',
                usuario_nome: 'Jetro Admin',
                data: '2026-09-29 08:30:00',
                detalhes: 'Lançamento registrado como Pendente',
              },
            ],
            hash_duplicidade:
              '53.215.715|2026-09|Outros Descontos Autorizados|75.00|Ressarcimento de despesa de transporte emergencial pendente',
          },
        ]
        for (const item of seedDeductions) {
          const rec = new Record(deductionsCol, item)
          app.save(rec)
        }
      }
    } catch (e) {
      console.log('Seed deductions err:', e)
    }
  },
  (app) => {
    // Reverter não destrutivo
  },
)
