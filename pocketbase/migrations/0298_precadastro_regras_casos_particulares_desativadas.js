/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    // 0298: Pré-cadastro na Matriz de CFOP (fiscal_cfop_rules) das regras dos casos particulares fiscais.
    // Todas DESATIVADAS (ativa = false), aguardando ativação e homologação pelo responsável fiscal.
    // Campos: is_exemplo_didatico = false, validado_responsavel_fiscal = false.
    // Idempotente: se a regra para a mesma combinação já existir, não duplica.

    var fcrCollection = app.findCollectionByNameOrId('fiscal_cfop_rules')
    if (!fcrCollection) {
      console.log('Migration 0298: Coleção fiscal_cfop_rules não encontrada. Pulando.')
      return
    }

    var rulesToPreRegister = [
      // =========================================================================
      // 1. Substituição Tributária (Vendas ST) - Operação VENDA_NORMAL
      // =========================================================================
      {
        operacao_codigo: 'VENDA_NORMAL',
        procedencia_item: 'producao_propria',
        destino_tipo: 'dentro_estado',
        cfop_resultado: '5401',
        descricao_cfop:
          'Venda de produção do estabelecimento em operação com produto sujeito a substituição tributária (ST)',
        cst_padrao: '10',
        prioridade: 20,
        vigencia_inicio: '2026-01-01',
        ativa: false,
        versao: 1,
        explicacao_padrao:
          'CFOP 5.401 — Venda de produção própria com ICMS-ST retido por substituição tributária no estado.',
        is_exemplo_didatico: false,
        validado_responsavel_fiscal: false,
        observacoes:
          'Caso particular de Substituição Tributária (produção própria, interno). Destinada a operações com mercadoria sujeita a ST. Pré-cadastrada desativada aguardando definição da lista de produtos sujeitos ao regime ST, MVA/pauta e ativação formal pelo responsável fiscal.',
      },
      {
        operacao_codigo: 'VENDA_NORMAL',
        procedencia_item: 'producao_propria',
        destino_tipo: 'fora_estado',
        cfop_resultado: '6401',
        descricao_cfop:
          'Venda de produção do estabelecimento em operação com produto sujeito a ST (interestadual)',
        cst_padrao: '10',
        prioridade: 20,
        vigencia_inicio: '2026-01-01',
        ativa: false,
        versao: 1,
        explicacao_padrao:
          'CFOP 6.401 — Venda interestadual de produção própria com ICMS-ST (convênio/protocolo entre estados).',
        is_exemplo_didatico: false,
        validado_responsavel_fiscal: false,
        observacoes:
          'Caso particular de Substituição Tributária interestadual (produção própria). Destinada a operações com mercadoria sujeita a ST interestadual. Pré-cadastrada desativada aguardando verificação de Protocolos/Convênios ICMS e ativação pelo responsável fiscal.',
      },
      {
        operacao_codigo: 'VENDA_NORMAL',
        procedencia_item: 'mercadoria_terceiros',
        destino_tipo: 'dentro_estado',
        cfop_resultado: '5403',
        descricao_cfop:
          'Venda de mercadoria adquirida de terceiros sujeita a ST, na condição de contribuinte substituto',
        cst_padrao: '10',
        prioridade: 20,
        vigencia_inicio: '2026-01-01',
        ativa: false,
        versao: 1,
        explicacao_padrao:
          'CFOP 5.403 — Venda de mercadoria de terceiros como substituto tributário (retenção própria) no estado.',
        is_exemplo_didatico: false,
        validado_responsavel_fiscal: false,
        observacoes:
          'Caso particular de Substituição Tributária (revenda como substituto tributário interno). Destinada a operações com mercadoria sujeita a ST. Pré-cadastrada desativada aguardando parametrização de regime e ativação pelo responsável fiscal.',
      },
      {
        operacao_codigo: 'VENDA_NORMAL',
        procedencia_item: 'mercadoria_terceiros',
        destino_tipo: 'fora_estado',
        cfop_resultado: '6403',
        descricao_cfop:
          'Venda de mercadoria adquirida de terceiros sujeita a ST, como contribuinte substituto (interestadual)',
        cst_padrao: '10',
        prioridade: 20,
        vigencia_inicio: '2026-01-01',
        ativa: false,
        versao: 1,
        explicacao_padrao:
          'CFOP 6.403 — Venda interestadual de mercadoria de terceiros como contribuinte substituto.',
        is_exemplo_didatico: false,
        validado_responsavel_fiscal: false,
        observacoes:
          'Caso particular de Substituição Tributária interestadual (revenda como substituto). Destinada a operações interestaduais com ST. Pré-cadastrada desativada aguardando validação de protocolos estaduais e ativação pelo responsável fiscal.',
      },
      {
        operacao_codigo: 'VENDA_NORMAL',
        procedencia_item: 'mercadoria_terceiros',
        destino_tipo: 'dentro_estado',
        cfop_resultado: '5405',
        descricao_cfop:
          'Venda de mercadoria adquirida de terceiros em operação com produto sujeito a ST, como contribuinte substituído',
        cst_padrao: '60',
        prioridade: 25,
        vigencia_inicio: '2026-01-01',
        ativa: false,
        versao: 1,
        explicacao_padrao:
          'CFOP 5.405 — Venda de mercadoria com ICMS-ST recolhido anteriormente na cadeia (contribuinte substituído).',
        is_exemplo_didatico: false,
        validado_responsavel_fiscal: false,
        observacoes:
          'Caso particular de Substituição Tributária interna como substituído (ICMS retido anteriormente por fornecedor/indústria). Aplicável a distribuidoras e comércio. Pré-cadastrada desativada aguardando ativação pelo responsável fiscal.',
      },
      {
        operacao_codigo: 'VENDA_NORMAL',
        procedencia_item: 'mercadoria_terceiros',
        destino_tipo: 'fora_estado',
        cfop_resultado: '6404',
        descricao_cfop:
          'Venda de mercadoria sujeita a ST cujo imposto já tenha sido retido anteriormente (interestadual)',
        cst_padrao: '60',
        prioridade: 25,
        vigencia_inicio: '2026-01-01',
        ativa: false,
        versao: 1,
        explicacao_padrao:
          'CFOP 6.404 — Venda interestadual de mercadoria com imposto retido anteriormente.',
        is_exemplo_didatico: false,
        validado_responsavel_fiscal: false,
        observacoes:
          'Caso particular de Substituição Tributária interestadual com imposto recolhido em etapa anterior (ressarcimento de ST ou convênio específico). Pré-cadastrada desativada aguardando decisão do responsável fiscal.',
      },

      // =========================================================================
      // 2. Consumidor Final / Não Contribuinte - Operação VENDA_NORMAL
      // =========================================================================
      {
        operacao_codigo: 'VENDA_NORMAL',
        procedencia_item: 'producao_propria',
        destino_tipo: 'fora_estado',
        cfop_resultado: '6107',
        descricao_cfop: 'Venda de produção do estabelecimento destinada a não contribuinte',
        cst_padrao: '00',
        prioridade: 30,
        vigencia_inicio: '2026-01-01',
        ativa: false,
        versao: 1,
        explicacao_padrao:
          'CFOP 6.107 — Venda interestadual de produção própria destinada a consumidor final não contribuinte (DIFAL EC 87/15).',
        is_exemplo_didatico: false,
        validado_responsavel_fiscal: false,
        observacoes:
          'Caso particular de Consumidor Final Não Contribuinte interestadual (produção própria). Operação sujeita ao diferencial de alíquotas (DIFAL da EC 87/2015). Pré-cadastrada desativada aguardando homologação e ativação pelo responsável fiscal.',
      },
      {
        operacao_codigo: 'VENDA_NORMAL',
        procedencia_item: 'mercadoria_terceiros',
        destino_tipo: 'fora_estado',
        cfop_resultado: '6108',
        descricao_cfop: 'Venda de mercadoria adquirida de terceiros destinada a não contribuinte',
        cst_padrao: '00',
        prioridade: 30,
        vigencia_inicio: '2026-01-01',
        ativa: false,
        versao: 1,
        explicacao_padrao:
          'CFOP 6.108 — Venda interestadual de mercadoria de terceiros destinada a consumidor final não contribuinte (DIFAL EC 87/15).',
        is_exemplo_didatico: false,
        validado_responsavel_fiscal: false,
        observacoes:
          'Caso particular de Consumidor Final Não Contribuinte interestadual (mercadoria adquirida de terceiros). Sujeito ao DIFAL para o estado de destino. Pré-cadastrada desativada aguardando ativação pelo responsável fiscal.',
      },
      {
        operacao_codigo: 'VENDA_NORMAL',
        procedencia_item: 'mercadoria_terceiros',
        destino_tipo: 'dentro_estado',
        cfop_resultado: '5104',
        descricao_cfop:
          'Venda de mercadoria adquirida ou recebida de terceiros, efetuada fora do estabelecimento',
        cst_padrao: '00',
        prioridade: 20,
        vigencia_inicio: '2026-01-01',
        ativa: false,
        versao: 1,
        explicacao_padrao:
          'CFOP 5.104 — Venda presencial ou em feira/ambulante fora do estabelecimento dentro do estado.',
        is_exemplo_didatico: false,
        validado_responsavel_fiscal: false,
        observacoes:
          'Caso particular de venda fora do estabelecimento (feiras, ambulantes, entregas diretas) de mercadoria de terceiros. Pré-cadastrada desativada aguardando decisão do responsável fiscal.',
      },
      {
        operacao_codigo: 'VENDA_NORMAL',
        procedencia_item: 'mercadoria_terceiros',
        destino_tipo: 'fora_estado',
        cfop_resultado: '6104',
        descricao_cfop:
          'Venda de mercadoria adquirida de terceiros, efetuada fora do estabelecimento (interestadual)',
        cst_padrao: '00',
        prioridade: 20,
        vigencia_inicio: '2026-01-01',
        ativa: false,
        versao: 1,
        explicacao_padrao: 'CFOP 6.104 — Venda interestadual efetuada fora do estabelecimento.',
        is_exemplo_didatico: false,
        validado_responsavel_fiscal: false,
        observacoes:
          'Caso particular de venda fora do estabelecimento interestadual de mercadorias de terceiros. Pré-cadastrada desativada aguardando ativação pelo responsável fiscal.',
      },
      {
        operacao_codigo: 'VENDA_NORMAL',
        procedencia_item: 'producao_propria',
        destino_tipo: 'dentro_estado',
        cfop_resultado: '5105',
        descricao_cfop: 'Venda de produção do estabelecimento que não deva por ele transitar',
        cst_padrao: '00',
        prioridade: 20,
        vigencia_inicio: '2026-01-01',
        ativa: false,
        versao: 1,
        explicacao_padrao:
          'CFOP 5.105 — Venda de produção própria entregue diretamente por terceiro/armazém dentro do estado.',
        is_exemplo_didatico: false,
        validado_responsavel_fiscal: false,
        observacoes:
          'Caso particular de venda com entrega direta / trânsito direto por depósito fechado ou operador logístico (produção própria, interno). Pré-cadastrada desativada aguardando decisão e ativação pelo responsável fiscal.',
      },
      {
        operacao_codigo: 'VENDA_NORMAL',
        procedencia_item: 'producao_propria',
        destino_tipo: 'fora_estado',
        cfop_resultado: '6105',
        descricao_cfop:
          'Venda de produção do estabelecimento que não deva por ele transitar (interestadual)',
        cst_padrao: '00',
        prioridade: 20,
        vigencia_inicio: '2026-01-01',
        ativa: false,
        versao: 1,
        explicacao_padrao:
          'CFOP 6.105 — Venda de produção própria entregue diretamente sem transitar pelo estabelecimento emitente (interestadual).',
        is_exemplo_didatico: false,
        validado_responsavel_fiscal: false,
        observacoes:
          'Caso particular de venda interestadual com entrega direta sem trânsito físico pelo estabelecimento (produção própria). Pré-cadastrada desativada aguardando validação do responsável fiscal.',
      },

      // =========================================================================
      // 3. Remessas e Outras Saídas - Operações REMESSA_DEMO e OUTRAS
      // =========================================================================
      {
        operacao_codigo: 'REMESSA_DEMO',
        procedencia_item: 'qualquer',
        destino_tipo: 'dentro_estado',
        cfop_resultado: '5915',
        descricao_cfop: 'Remessa de mercadoria ou bem para conserto ou reparo',
        cst_padrao: '41',
        prioridade: 15,
        vigencia_inicio: '2026-01-01',
        ativa: false,
        versao: 1,
        explicacao_padrao:
          'CFOP 5.915 — Remessa para conserto ou reparo no mesmo estado (não incidência de ICMS).',
        is_exemplo_didatico: false,
        validado_responsavel_fiscal: false,
        observacoes:
          'Caso particular de remessa para conserto ou reparo de bens/máquinas ou mercadorias (interno). Pré-cadastrada desativada aguardando homologação pelo responsável fiscal.',
      },
      {
        operacao_codigo: 'REMESSA_DEMO',
        procedencia_item: 'qualquer',
        destino_tipo: 'fora_estado',
        cfop_resultado: '6915',
        descricao_cfop: 'Remessa de mercadoria ou bem para conserto ou reparo (interestadual)',
        cst_padrao: '41',
        prioridade: 15,
        vigencia_inicio: '2026-01-01',
        ativa: false,
        versao: 1,
        explicacao_padrao:
          'CFOP 6.915 — Remessa para conserto ou reparo para outro estado (não incidência de ICMS).',
        is_exemplo_didatico: false,
        validado_responsavel_fiscal: false,
        observacoes:
          'Caso particular de remessa interestadual para conserto ou reparo. Pré-cadastrada desativada aguardando ativação pelo responsável fiscal.',
      },
      {
        operacao_codigo: 'REMESSA_DEMO',
        procedencia_item: 'qualquer',
        destino_tipo: 'dentro_estado',
        cfop_resultado: '5901',
        descricao_cfop: 'Remessa para industrialização por encomenda',
        cst_padrao: '41',
        prioridade: 15,
        vigencia_inicio: '2026-01-01',
        ativa: false,
        versao: 1,
        explicacao_padrao:
          'CFOP 5.901 — Remessa de insumos para industrialização por encomenda em terceiro no mesmo estado.',
        is_exemplo_didatico: false,
        validado_responsavel_fiscal: false,
        observacoes:
          'Caso particular de remessa para industrialização por conta e ordem de terceiros (interno). Pré-cadastrada desativada aguardando ativação pelo responsável fiscal.',
      },
      {
        operacao_codigo: 'REMESSA_DEMO',
        procedencia_item: 'qualquer',
        destino_tipo: 'fora_estado',
        cfop_resultado: '6901',
        descricao_cfop: 'Remessa para industrialização por encomenda (interestadual)',
        cst_padrao: '41',
        prioridade: 15,
        vigencia_inicio: '2026-01-01',
        ativa: false,
        versao: 1,
        explicacao_padrao:
          'CFOP 6.901 — Remessa para industrialização em estabelecimento de outro estado.',
        is_exemplo_didatico: false,
        validado_responsavel_fiscal: false,
        observacoes:
          'Caso particular de remessa interestadual para industrialização por terceiros. Pré-cadastrada desativada aguardando validação do responsável fiscal.',
      },
      {
        operacao_codigo: 'REMESSA_DEMO',
        procedencia_item: 'qualquer',
        destino_tipo: 'dentro_estado',
        cfop_resultado: '5949',
        descricao_cfop: 'Outra saída de mercadoria ou prestação de serviço não especificado',
        cst_padrao: '41',
        prioridade: 5,
        vigencia_inicio: '2026-01-01',
        ativa: false,
        versao: 1,
        explicacao_padrao: 'CFOP 5.949 — Outras saídas não especificadas dentro do estado.',
        is_exemplo_didatico: false,
        validado_responsavel_fiscal: false,
        observacoes:
          'Caso particular residual de saída não especificada (interno). Uso excepcional condicionado a parecer e ativação pelo responsável fiscal.',
      },
      {
        operacao_codigo: 'REMESSA_DEMO',
        procedencia_item: 'qualquer',
        destino_tipo: 'fora_estado',
        cfop_resultado: '6949',
        descricao_cfop:
          'Outra saída de mercadoria ou prestação de serviço não especificado (interestadual)',
        cst_padrao: '41',
        prioridade: 5,
        vigencia_inicio: '2026-01-01',
        ativa: false,
        versao: 1,
        explicacao_padrao: 'CFOP 6.949 — Outras saídas não especificadas para outro estado.',
        is_exemplo_didatico: false,
        validado_responsavel_fiscal: false,
        observacoes:
          'Caso particular residual de saída interestadual não especificada. Requer autorização explícita e ativação pelo responsável fiscal.',
      },

      // =========================================================================
      // 4. Transferências - Operação TRANSFERENCIA_SAIDA
      // =========================================================================
      {
        operacao_codigo: 'TRANSFERENCIA_SAIDA',
        procedencia_item: 'producao_propria',
        destino_tipo: 'dentro_estado',
        cfop_resultado: '5151',
        descricao_cfop: 'Transferência de produção do estabelecimento',
        cst_padrao: '41',
        prioridade: 15,
        vigencia_inicio: '2026-01-01',
        ativa: false,
        versao: 1,
        explicacao_padrao:
          'CFOP 5.151 — Transferência de produção própria para filial/estabelecimento no mesmo estado.',
        is_exemplo_didatico: false,
        validado_responsavel_fiscal: false,
        observacoes:
          'Caso particular de transferência de produção própria entre estabelecimentos da mesma empresa dentro do estado. ADC 49 STF (não incidência ICMS). Pré-cadastrada desativada aguardando ativação pelo responsável fiscal.',
      },
      {
        operacao_codigo: 'TRANSFERENCIA_SAIDA',
        procedencia_item: 'producao_propria',
        destino_tipo: 'fora_estado',
        cfop_resultado: '6151',
        descricao_cfop: 'Transferência de produção do estabelecimento para outro estado',
        cst_padrao: '41',
        prioridade: 15,
        vigencia_inicio: '2026-01-01',
        ativa: false,
        versao: 1,
        explicacao_padrao:
          'CFOP 6.151 — Transferência de produção própria para filial em outro estado.',
        is_exemplo_didatico: false,
        validado_responsavel_fiscal: false,
        observacoes:
          'Caso particular de transferência interestadual de produção própria entre filiais. Alinhado ao Convênio ICMS 178/2023 (transferência de créditos). Pré-cadastrada desativada aguardando decisão do responsável fiscal.',
      },
      {
        operacao_codigo: 'TRANSFERENCIA_SAIDA',
        procedencia_item: 'mercadoria_terceiros',
        destino_tipo: 'dentro_estado',
        cfop_resultado: '5152',
        descricao_cfop: 'Transferência de mercadoria adquirida ou recebida de terceiros',
        cst_padrao: '41',
        prioridade: 15,
        vigencia_inicio: '2026-01-01',
        ativa: false,
        versao: 1,
        explicacao_padrao:
          'CFOP 5.152 — Transferência de mercadorias adquiridas de terceiros entre estabelecimentos no estado.',
        is_exemplo_didatico: false,
        validado_responsavel_fiscal: false,
        observacoes:
          'Caso particular de transferência interna de revenda/terceiros para filial da mesma empresa. Pré-cadastrada desativada aguardando ativação pelo responsável fiscal.',
      },
      {
        operacao_codigo: 'TRANSFERENCIA_SAIDA',
        procedencia_item: 'mercadoria_terceiros',
        destino_tipo: 'fora_estado',
        cfop_resultado: '6152',
        descricao_cfop:
          'Transferência de mercadoria adquirida ou recebida de terceiros para outro estado',
        cst_padrao: '41',
        prioridade: 15,
        vigencia_inicio: '2026-01-01',
        ativa: false,
        versao: 1,
        explicacao_padrao:
          'CFOP 6.152 — Transferência interestadual de mercadorias adquiridas de terceiros para filial da mesma empresa.',
        is_exemplo_didatico: false,
        validado_responsavel_fiscal: false,
        observacoes:
          'Caso particular de transferência interestadual de revenda entre filiais. Pré-cadastrada desativada aguardando ativação pelo responsável fiscal.',
      },

      // =========================================================================
      // 5. Devoluções de Venda - Operação DEVOLUCAO_VENDA
      // =========================================================================
      {
        operacao_codigo: 'DEVOLUCAO_VENDA',
        procedencia_item: 'producao_propria',
        destino_tipo: 'dentro_estado',
        cfop_resultado: '5201',
        descricao_cfop: 'Devolução de compra para industrialização ou produção rural',
        cst_padrao: '00',
        prioridade: 10,
        vigencia_inicio: '2026-01-01',
        ativa: false,
        versao: 1,
        explicacao_padrao:
          'CFOP 5.201 — Devolução/retorno de insumos para industrialização dentro do estado.',
        is_exemplo_didatico: false,
        validado_responsavel_fiscal: false,
        observacoes:
          'Caso particular de devolução no fluxo de industrialização/produção própria (interno). Pré-cadastrada desativada aguardando integração e ativação pelo responsável fiscal.',
      },
      {
        operacao_codigo: 'DEVOLUCAO_VENDA',
        procedencia_item: 'producao_propria',
        destino_tipo: 'fora_estado',
        cfop_resultado: '6201',
        descricao_cfop:
          'Devolução de compra para industrialização ou produção rural (interestadual)',
        cst_padrao: '00',
        prioridade: 10,
        vigencia_inicio: '2026-01-01',
        ativa: false,
        versao: 1,
        explicacao_padrao:
          'CFOP 6.201 — Devolução de insumos de industrialização para outro estado.',
        is_exemplo_didatico: false,
        validado_responsavel_fiscal: false,
        observacoes:
          'Caso particular de devolução interestadual vinculada à produção própria/insumos industriais. Pré-cadastrada desativada aguardando ativação pelo responsável fiscal.',
      },
      {
        operacao_codigo: 'DEVOLUCAO_VENDA',
        procedencia_item: 'mercadoria_terceiros',
        destino_tipo: 'dentro_estado',
        cfop_resultado: '5202',
        descricao_cfop: 'Devolução de compra para comercialização',
        cst_padrao: '00',
        prioridade: 10,
        vigencia_inicio: '2026-01-01',
        ativa: false,
        versao: 1,
        explicacao_padrao:
          'CFOP 5.202 — Devolução de mercadoria para comercialização dentro do estado.',
        is_exemplo_didatico: false,
        validado_responsavel_fiscal: false,
        observacoes:
          'Caso particular de devolução de mercadoria adquirida de terceiros (interno). Pré-cadastrada desativada aguardando ativação pelo responsável fiscal.',
      },
      {
        operacao_codigo: 'DEVOLUCAO_VENDA',
        procedencia_item: 'mercadoria_terceiros',
        destino_tipo: 'fora_estado',
        cfop_resultado: '6202',
        descricao_cfop: 'Devolução de compra para comercialização (interestadual)',
        cst_padrao: '00',
        prioridade: 10,
        vigencia_inicio: '2026-01-01',
        ativa: false,
        versao: 1,
        explicacao_padrao: 'CFOP 6.202 — Devolução interestadual de mercadoria de terceiros.',
        is_exemplo_didatico: false,
        validado_responsavel_fiscal: false,
        observacoes:
          'Caso particular de devolução interestadual de mercadoria adquirida de terceiros. Pré-cadastrada desativada aguardando ativação pelo responsável fiscal.',
      },
    ]

    var inseridas = 0
    var jaExistentes = 0

    for (var i = 0; i < rulesToPreRegister.length; i++) {
      var item = rulesToPreRegister[i]
      try {
        // Checagem de idempotência: busca regra com mesma operacao, procedencia, destino e cfop
        var existing = null
        try {
          existing = app.findFirstRecordByFilter(
            'fiscal_cfop_rules',
            'operacao_codigo = {:op} && procedencia_item = {:proc} && destino_tipo = {:dest} && cfop_resultado = {:cfop}',
            {
              op: item.operacao_codigo,
              proc: item.procedencia_item,
              dest: item.destino_tipo,
              cfop: item.cfop_resultado,
            },
          )
        } catch (_) {}

        if (existing) {
          jaExistentes++
          continue
        }

        var newRec = new Record(fcrCollection)
        for (var key in item) {
          newRec.set(key, item[key])
        }
        app.save(newRec)
        inseridas++
      } catch (err) {
        console.log(
          'Migration 0298: Erro ao pré-cadastrar regra CFOP ' + item.cfop_resultado + ':',
          err,
        )
      }
    }

    console.log(
      'Migration 0298 concluída: ' +
        inseridas +
        ' regras desativadas pré-cadastradas, ' +
        jaExistentes +
        ' já existentes.',
    )
  },
  (app) => {
    // Rollback: remove as regras pré-cadastradas desativadas criadas por esta migração
    try {
      var cfopsToRemove = [
        '5401',
        '6401',
        '5403',
        '6403',
        '5405',
        '6404',
        '6107',
        '6108',
        '5104',
        '6104',
        '5105',
        '6105',
        '5915',
        '6915',
        '5901',
        '6901',
        '5949',
        '6949',
        '5151',
        '6151',
        '5201',
        '6201',
        '5202',
        '6202',
      ]
      var cfopFilter = cfopsToRemove
        .map(function (c) {
          return 'cfop_resultado = "' + c + '"'
        })
        .join(' || ')
      var records = app.findRecordsByFilter(
        'fiscal_cfop_rules',
        'ativa = false && (' + cfopFilter + ')',
        '',
        100,
        0,
      )
      for (var i = 0; i < records.length; i++) {
        try {
          app.delete(records[i])
        } catch (_) {}
      }
    } catch (_) {}
  },
)
