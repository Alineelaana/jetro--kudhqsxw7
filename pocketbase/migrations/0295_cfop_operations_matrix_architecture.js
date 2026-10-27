migrate(
  (app) => {
    var ruleAdminOrAuth = "@request.auth.id != ''"

    // 1. Coleção fiscal_operations (Operações de Negócio / CGO)
    // Camada 2 do Modelo HURAM: Define o processo de negócio e seus efeitos operacionais
    // Vendedor escolhe a operação uma única vez. Variações fiscais NÃO geram nova opção comercial.
    if (!app.hasTable('fiscal_operations')) {
      var opCol = new Collection({
        name: 'fiscal_operations',
        type: 'base',
        listRule: ruleAdminOrAuth,
        viewRule: ruleAdminOrAuth,
        createRule: ruleAdminOrAuth,
        updateRule: ruleAdminOrAuth,
        deleteRule: ruleAdminOrAuth,
        fields: [
          { name: 'codigo', type: 'text', required: true }, // ex: "VENDA_NORMAL", "BONIFICACAO", "TRANSF_SAIDA"
          { name: 'nome', type: 'text', required: true }, // ex: "Venda Normal", "Bonificação"
          {
            name: 'grupo_gerencial',
            type: 'select',
            required: true,
            values: ['vendas', 'devolucoes', 'transferencias', 'perdas', 'remessas', 'outros'],
          },
          { name: 'descricao', type: 'text' },
          { name: 'empresa_id', type: 'text' }, // Vazio = Todas / compartilhada; preenchido = específica de uma empresa
          { name: 'filial_id', type: 'text' },
          // Efeitos operacionais claros (conforme requisitos da arquitetura)
          {
            name: 'efeito_estoque',
            type: 'select',
            values: ['baixa', 'entrada', 'nenhum', 'reserva'],
          },
          {
            name: 'efeito_financeiro',
            type: 'select',
            values: ['gera_receber', 'gera_pagar', 'nenhum'],
          },
          { name: 'efeito_comissao', type: 'bool' }, // se pontua para comissões / remuneração variável
          { name: 'efeito_contabilizacao', type: 'text' }, // 'receita_bruta', 'estorno_custo', 'transferencia_ativo', 'despesa'
          { name: 'movimento_comercial', type: 'bool' }, // true se é venda real (evita duplicar com NF-e e nunca trata transferência como venda)
          { name: 'finalidade_nfe', type: 'select', values: ['1', '2', '3', '4'] }, // 1=Normal, 2=Complementar, 3=Ajuste, 4=Devolucao
          { name: 'ativa', type: 'bool' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_fo_codigo ON fiscal_operations (codigo)',
          'CREATE INDEX idx_fo_grupo ON fiscal_operations (grupo_gerencial)',
          'CREATE INDEX idx_fo_empresa ON fiscal_operations (empresa_id)',
          'CREATE INDEX idx_fo_ativa ON fiscal_operations (ativa)',
        ],
      })
      app.save(opCol)
    }

    // 2. Coleção fiscal_cfop_rules (Matriz Fiscal de Determinação de CFOP por Item)
    // Camada 3: cruza operação + empresa emitente + procedência do item + destino UF + vigência + prioridade
    if (!app.hasTable('fiscal_cfop_rules')) {
      var ruleCol = new Collection({
        name: 'fiscal_cfop_rules',
        type: 'base',
        listRule: ruleAdminOrAuth,
        viewRule: ruleAdminOrAuth,
        createRule: ruleAdminOrAuth,
        updateRule: ruleAdminOrAuth,
        deleteRule: ruleAdminOrAuth,
        fields: [
          { name: 'operacao_codigo', type: 'text', required: true }, // vinculada ao código de fiscal_operations
          { name: 'empresa_id', type: 'text' }, // vazio = modelo compartilhado habilitável; com id = regra estrita da empresa
          { name: 'filial_id', type: 'text' },
          {
            name: 'procedencia_item',
            type: 'select',
            required: true,
            values: ['producao_propria', 'mercadoria_terceiros', 'materia_prima', 'qualquer'],
          },
          {
            name: 'destino_tipo',
            type: 'select',
            required: true,
            values: ['dentro_estado', 'fora_estado', 'exterior', 'qualquer'],
          },
          { name: 'uf_origem', type: 'text' }, // opcional se restrito a uma UF de saída
          { name: 'uf_destino', type: 'text' }, // opcional se restrito a uma UF específica (ex: SP)
          { name: 'cfop_resultado', type: 'text', required: true },
          { name: 'descricao_cfop', type: 'text' },
          { name: 'cst_padrao', type: 'text' },
          { name: 'prioridade', type: 'number' }, // maior prioridade avaliada primeiro (ex: 100 > 10)
          { name: 'vigencia_inicio', type: 'text' }, // formato ISO AAAA-MM-DD
          { name: 'vigencia_fim', type: 'text' },
          { name: 'ativa', type: 'bool' },
          { name: 'versao', type: 'number' }, // histórico de versão da regra (imutabilidade)
          { name: 'explicacao_padrao', type: 'text' }, // Explicação transparente auditável
          { name: 'is_exemplo_didatico', type: 'bool' }, // Destaque obrigatório: exemplo didático a validar pelo fiscal
          { name: 'validado_responsavel_fiscal', type: 'bool' },
          { name: 'validado_por', type: 'text' },
          { name: 'validado_em', type: 'text' },
          { name: 'observacoes', type: 'text' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_fcr_op ON fiscal_cfop_rules (operacao_codigo)',
          'CREATE INDEX idx_fcr_emp ON fiscal_cfop_rules (empresa_id)',
          'CREATE INDEX idx_fcr_proc ON fiscal_cfop_rules (procedencia_item)',
          'CREATE INDEX idx_fcr_dest ON fiscal_cfop_rules (destino_tipo)',
          'CREATE INDEX idx_fcr_prio ON fiscal_cfop_rules (prioridade DESC)',
          'CREATE INDEX idx_fcr_ativa ON fiscal_cfop_rules (ativa)',
        ],
      })
      app.save(ruleCol)
    }

    // 3. Coleção fiscal_rule_exceptions (Auditoria de Exceções Manuais e Aplicação por Documento)
    // Permite registrar alterações manuais restritas a perfil autorizado com justificativa
    if (!app.hasTable('fiscal_rule_exceptions')) {
      var excCol = new Collection({
        name: 'fiscal_rule_exceptions',
        type: 'base',
        listRule: ruleAdminOrAuth,
        viewRule: ruleAdminOrAuth,
        createRule: ruleAdminOrAuth,
        updateRule: ruleAdminOrAuth,
        deleteRule: ruleAdminOrAuth,
        fields: [
          { name: 'documento_tipo', type: 'text', required: true }, // 'nfe_homologacao', 'pedido_venda', 'nfe_emissao', 'simulacao'
          { name: 'documento_id', type: 'text' },
          { name: 'empresa_id', type: 'text', required: true },
          { name: 'item_codigo', type: 'text' },
          { name: 'item_descricao', type: 'text' },
          { name: 'cfop_sugerido_matriz', type: 'text' },
          { name: 'regra_matriz_id', type: 'text' },
          { name: 'regra_versao', type: 'number' },
          { name: 'cfop_aplicado_manual', type: 'text', required: true },
          { name: 'justificativa', type: 'text', required: true },
          { name: 'autorizado_por_id', type: 'text', required: true },
          { name: 'autorizado_por_nome', type: 'text', required: true },
          { name: 'autorizado_por_perfil', type: 'text', required: true },
          { name: 'status', type: 'select', values: ['aprovada', 'pendente_revisao', 'rejeitada'] },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_fre_doc ON fiscal_rule_exceptions (documento_id)',
          'CREATE INDEX idx_fre_emp ON fiscal_rule_exceptions (empresa_id)',
          'CREATE INDEX idx_fre_created ON fiscal_rule_exceptions (created DESC)',
        ],
      })
      app.save(excCol)
    }

    // 4. Semeadura inicial conforme documento de arquitetura HURAM:
    // Camada 1 & 2: Grupos gerenciais e Operações de Negócio básicas
    var opRecords = [
      {
        codigo: 'VENDA_NORMAL',
        nome: 'Venda Normal',
        grupo_gerencial: 'vendas',
        descricao:
          'Venda comercial de produtos acabados ou mercadorias com faturamento mercantil normal.',
        efeito_estoque: 'baixa',
        efeito_financeiro: 'gera_receber',
        efeito_comissao: true,
        efeito_contabilizacao: 'receita_bruta_vendas',
        movimento_comercial: true,
        finalidade_nfe: '1',
        ativa: true,
      },
      {
        codigo: 'BONIFICACAO',
        nome: 'Bonificação ou Brinde',
        grupo_gerencial: 'vendas',
        descricao:
          'Remessa em bonificação, doação ou brinde promocional. Sem geração de contas a receber.',
        efeito_estoque: 'baixa',
        efeito_financeiro: 'nenhum',
        efeito_comissao: false,
        efeito_contabilizacao: 'despesa_promocional',
        movimento_comercial: false,
        finalidade_nfe: '1',
        ativa: true,
      },
      {
        codigo: 'REMESSA_DEMO',
        nome: 'Remessa para Demonstração',
        grupo_gerencial: 'remessas',
        descricao: 'Saída temporária para demonstração ou feira com retorno previsto.',
        efeito_estoque: 'baixa',
        efeito_financeiro: 'nenhum',
        efeito_comissao: false,
        efeito_contabilizacao: 'remessa_demonstracao',
        movimento_comercial: false,
        finalidade_nfe: '1',
        ativa: true,
      },
      {
        codigo: 'DEVOLUCAO_COMPRA',
        nome: 'Devolução de Compra',
        grupo_gerencial: 'devolucoes',
        descricao:
          'Devolução de mercadoria adquirida para fornecedor, estornando estoque e gerando abatimento a pagar.',
        efeito_estoque: 'baixa',
        efeito_financeiro: 'gera_pagar',
        efeito_comissao: false,
        efeito_contabilizacao: 'estorno_custo_aquisicao',
        movimento_comercial: false,
        finalidade_nfe: '4',
        ativa: true,
      },
      {
        codigo: 'DEVOLUCAO_VENDA',
        nome: 'Devolução de Venda',
        grupo_gerencial: 'devolucoes',
        descricao:
          'Retorno de venda devolvida pelo cliente. Estorna receita e devolve itens ao estoque.',
        efeito_estoque: 'entrada',
        efeito_financeiro: 'gera_receber', // estorno
        efeito_comissao: false,
        efeito_contabilizacao: 'estorno_receita_bruta',
        movimento_comercial: false,
        finalidade_nfe: '4',
        ativa: true,
      },
      {
        codigo: 'TRANSFERENCIA_SAIDA',
        nome: 'Transferência entre Estabelecimentos',
        grupo_gerencial: 'transferencias',
        descricao:
          'Transferência entre matriz e filial ou entre empresas do grupo HURAM. Não é venda.',
        efeito_estoque: 'baixa',
        efeito_financeiro: 'nenhum',
        efeito_comissao: false,
        efeito_contabilizacao: 'transferencia_ativo_circulante',
        movimento_comercial: false,
        finalidade_nfe: '1',
        ativa: true,
      },
      {
        codigo: 'ENTREGA_FUTURA',
        nome: 'Venda para Entrega Futura',
        grupo_gerencial: 'vendas',
        descricao: 'Faturamento antecipado para posterior remessa física das mercadorias.',
        efeito_estoque: 'nenhum', // estoque baixa apenas na remessa
        efeito_financeiro: 'gera_receber',
        efeito_comissao: true,
        efeito_contabilizacao: 'adiantamento_faturamento',
        movimento_comercial: true,
        finalidade_nfe: '1',
        ativa: true,
      },
      {
        codigo: 'PERDA_AVARIA',
        nome: 'Baixa por Perda ou Avaria',
        grupo_gerencial: 'perdas',
        descricao: 'Ajuste de estoque por quebra, perda física ou vencimento operacional.',
        efeito_estoque: 'baixa',
        efeito_financeiro: 'nenhum',
        efeito_comissao: false,
        efeito_contabilizacao: 'perda_operacional',
        movimento_comercial: false,
        finalidade_nfe: '3',
        ativa: true,
      },
    ]

    var foCol = app.findCollectionByNameOrId('fiscal_operations')
    for (var i = 0; i < opRecords.length; i++) {
      var itemOp = opRecords[i]
      try {
        var existing = app.findFirstRecordByFilter(
          'fiscal_operations',
          'codigo = "' + itemOp.codigo + '"',
        )
        if (!existing) {
          var recOp = new Record(foCol)
          for (var k in itemOp) {
            recOp.set(k, itemOp[k])
          }
          app.save(recOp)
        }
      } catch (_) {}
    }

    // 5. Semeadura das regras da matriz de CFOP com base no exemplo didático do documento:
    // Venda normal:
    // Produção própria dentro do estado: 5.101
    // Produção própria fora do estado: 6.101
    // Mercadoria de terceiros dentro do estado: 5.102
    // Mercadoria de terceiros fora do estado: 6.102
    // Bonificação: 5.910 (dentro) / 6.910 (fora)
    // Transferência: 5.152 (dentro) / 6.152 (fora)
    // Devolução de compra: 5.202 (dentro) / 6.202 (fora)
    // Marcadas claramente como 'is_exemplo_didatico = true' e 'validado_responsavel_fiscal = false'
    var seedRules = [
      {
        operacao_codigo: 'VENDA_NORMAL',
        empresa_id: '', // compartilhado
        procedencia_item: 'producao_propria',
        destino_tipo: 'dentro_estado',
        cfop_resultado: '5101',
        descricao_cfop: 'Venda de produção do estabelecimento no mesmo estado',
        cst_padrao: '00',
        prioridade: 10,
        vigencia_inicio: '2026-01-01',
        vigencia_fim: '',
        ativa: true,
        versao: 1,
        explicacao_padrao:
          'CFOP 5.101 — Produção do estabelecimento, nesta empresa, destino dentro do estado.',
        is_exemplo_didatico: true,
        validado_responsavel_fiscal: false,
        observacoes: 'Exemplo didático do documento HURAM (necessita validação fiscal).',
      },
      {
        operacao_codigo: 'VENDA_NORMAL',
        empresa_id: '',
        procedencia_item: 'producao_propria',
        destino_tipo: 'fora_estado',
        cfop_resultado: '6101',
        descricao_cfop: 'Venda de produção do estabelecimento para outro estado',
        cst_padrao: '00',
        prioridade: 10,
        vigencia_inicio: '2026-01-01',
        vigencia_fim: '',
        ativa: true,
        versao: 1,
        explicacao_padrao:
          'CFOP 6.101 — Produção do estabelecimento, nesta empresa, destino para outro estado.',
        is_exemplo_didatico: true,
        validado_responsavel_fiscal: false,
        observacoes: 'Exemplo didático do documento HURAM (necessita validação fiscal).',
      },
      {
        operacao_codigo: 'VENDA_NORMAL',
        empresa_id: '',
        procedencia_item: 'mercadoria_terceiros',
        destino_tipo: 'dentro_estado',
        cfop_resultado: '5102',
        descricao_cfop: 'Venda de mercadoria adquirida de terceiros no mesmo estado',
        cst_padrao: '00',
        prioridade: 10,
        vigencia_inicio: '2026-01-01',
        vigencia_fim: '',
        ativa: true,
        versao: 1,
        explicacao_padrao:
          'CFOP 5.102 — Mercadoria de terceiros (revenda), nesta empresa, destino dentro do estado.',
        is_exemplo_didatico: true,
        validado_responsavel_fiscal: false,
        observacoes: 'Exemplo didático do documento HURAM (necessita validação fiscal).',
      },
      {
        operacao_codigo: 'VENDA_NORMAL',
        empresa_id: '',
        procedencia_item: 'mercadoria_terceiros',
        destino_tipo: 'fora_estado',
        cfop_resultado: '6102',
        descricao_cfop: 'Venda de mercadoria adquirida de terceiros para outro estado',
        cst_padrao: '00',
        prioridade: 10,
        vigencia_inicio: '2026-01-01',
        vigencia_fim: '',
        ativa: true,
        versao: 1,
        explicacao_padrao:
          'CFOP 6.102 — Mercadoria de terceiros (revenda), nesta empresa, destino para outro estado.',
        is_exemplo_didatico: true,
        validado_responsavel_fiscal: false,
        observacoes: 'Exemplo didático do documento HURAM (necessita validação fiscal).',
      },
      {
        operacao_codigo: 'BONIFICACAO',
        empresa_id: '',
        procedencia_item: 'qualquer',
        destino_tipo: 'dentro_estado',
        cfop_resultado: '5910',
        descricao_cfop: 'Remessa em bonificação, doação ou brinde no mesmo estado',
        cst_padrao: '41',
        prioridade: 10,
        vigencia_inicio: '2026-01-01',
        vigencia_fim: '',
        ativa: true,
        versao: 1,
        explicacao_padrao: 'CFOP 5.910 — Remessa em bonificação/doação, destino dentro do estado.',
        is_exemplo_didatico: true,
        validado_responsavel_fiscal: false,
        observacoes: 'Exemplo didático do documento HURAM.',
      },
      {
        operacao_codigo: 'BONIFICACAO',
        empresa_id: '',
        procedencia_item: 'qualquer',
        destino_tipo: 'fora_estado',
        cfop_resultado: '6910',
        descricao_cfop: 'Remessa em bonificação, doação ou brinde para outro estado',
        cst_padrao: '41',
        prioridade: 10,
        vigencia_inicio: '2026-01-01',
        vigencia_fim: '',
        ativa: true,
        versao: 1,
        explicacao_padrao: 'CFOP 6.910 — Remessa em bonificação/doação, destino para outro estado.',
        is_exemplo_didatico: true,
        validado_responsavel_fiscal: false,
        observacoes: 'Exemplo didático do documento HURAM.',
      },
      {
        operacao_codigo: 'TRANSFERENCIA_SAIDA',
        empresa_id: '',
        procedencia_item: 'qualquer',
        destino_tipo: 'dentro_estado',
        cfop_resultado: '5152',
        descricao_cfop: 'Transferência de mercadoria adquirida ou recebida de terceiros (interna)',
        cst_padrao: '41',
        prioridade: 10,
        vigencia_inicio: '2026-01-01',
        vigencia_fim: '',
        ativa: true,
        versao: 1,
        explicacao_padrao:
          'CFOP 5.152 — Transferência entre estabelecimentos dentro do mesmo estado.',
        is_exemplo_didatico: true,
        validado_responsavel_fiscal: false,
        observacoes: 'Transferência de mercadoria (não é venda comercial).',
      },
      {
        operacao_codigo: 'TRANSFERENCIA_SAIDA',
        empresa_id: '',
        procedencia_item: 'qualquer',
        destino_tipo: 'fora_estado',
        cfop_resultado: '6152',
        descricao_cfop:
          'Transferência de mercadoria adquirida ou recebida de terceiros (interestadual)',
        cst_padrao: '41',
        prioridade: 10,
        vigencia_inicio: '2026-01-01',
        vigencia_fim: '',
        ativa: true,
        versao: 1,
        explicacao_padrao: 'CFOP 6.152 — Transferência entre estabelecimentos para outro estado.',
        is_exemplo_didatico: true,
        validado_responsavel_fiscal: false,
        observacoes: 'Transferência interestadual (ADC 49 STF / não incidência ICMS).',
      },
      {
        operacao_codigo: 'REMESSA_DEMO',
        empresa_id: '',
        procedencia_item: 'qualquer',
        destino_tipo: 'dentro_estado',
        cfop_resultado: '5912',
        descricao_cfop: 'Remessa de mercadoria ou bem para demonstração (interna)',
        cst_padrao: '41',
        prioridade: 10,
        vigencia_inicio: '2026-01-01',
        vigencia_fim: '',
        ativa: true,
        versao: 1,
        explicacao_padrao: 'CFOP 5.912 — Remessa para demonstração ou feira dentro do estado.',
        is_exemplo_didatico: true,
        validado_responsavel_fiscal: false,
        observacoes: 'Suspensão de ICMS pelo prazo regulamentar.',
      },
      {
        operacao_codigo: 'REMESSA_DEMO',
        empresa_id: '',
        procedencia_item: 'qualquer',
        destino_tipo: 'fora_estado',
        cfop_resultado: '6912',
        descricao_cfop: 'Remessa de mercadoria ou bem para demonstração (interestadual)',
        cst_padrao: '41',
        prioridade: 10,
        vigencia_inicio: '2026-01-01',
        vigencia_fim: '',
        ativa: true,
        versao: 1,
        explicacao_padrao: 'CFOP 6.912 — Remessa para demonstração para outro estado.',
        is_exemplo_didatico: true,
        validado_responsavel_fiscal: false,
        observacoes: 'Suspensão de ICMS pelo prazo regulamentar.',
      },
    ]

    var fcrCol = app.findCollectionByNameOrId('fiscal_cfop_rules')
    for (var j = 0; j < seedRules.length; j++) {
      var sRule = seedRules[j]
      try {
        var ruleExisting = app.findFirstRecordByFilter(
          'fiscal_cfop_rules',
          'operacao_codigo = "' +
            sRule.operacao_codigo +
            '" && procedencia_item = "' +
            sRule.procedencia_item +
            '" && destino_tipo = "' +
            sRule.destino_tipo +
            '" && cfop_resultado = "' +
            sRule.cfop_resultado +
            '"',
        )
        if (!ruleExisting) {
          var recRule = new Record(fcrCol)
          for (var field in sRule) {
            recRule.set(field, sRule[field])
          }
          app.save(recRule)
        }
      } catch (_) {}
    }
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('fiscal_rule_exceptions'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('fiscal_cfop_rules'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('fiscal_operations'))
    } catch (_) {}
  },
)
