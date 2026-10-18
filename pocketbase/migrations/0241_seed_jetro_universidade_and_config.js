/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    // 1. Seed de Configuração Padrão do Jetro On-line
    const configCol = app.findCollectionByNameOrId('jetro_online_config')
    let existingConfig = null
    try {
      const records = app.findRecordsByFilter(
        'jetro_online_config',
        'chave = "geral"',
        '-created',
        1,
        0,
      )
      if (records && records.length > 0) existingConfig = records[0]
    } catch (_) {}

    if (!existingConfig) {
      const r = new Record(configCol)
      r.set('chave', 'geral')
      r.set('titulo_assistente', 'Jetro On-line')
      r.set('saudacao_principal', 'Como posso ajudar?')
      r.set(
        'texto_auxiliar',
        'Faça uma pergunta, peça uma análise ou explore as informações disponíveis.',
      )
      r.set(
        'mensagem_boas_vindas',
        'Olá! Sou o Jetro On-line, seu assistente operacional integrado aos dados reais do ERP.',
      )
      r.set(
        'mensagem_indisponibilidade',
        'O assistente Jetro On-line está temporariamente indisponível. Tente novamente em instantes.',
      )
      r.set('permitir_anexos', false)
      r.set('permitir_voz', false)
      r.set('botao_video_ativo', true)
      r.set('botao_tour_ativo', true)
      r.set('recomendar_universidade_auto', true)
      r.set('max_recomendacoes_video', 2)
      r.set('placeholder_input', 'Digite sua mensagem...')
      r.set('tema_cor_primaria', '#005B2E')
      r.set('tema_cor_destaque', '#C9A227')
      app.save(r)
    }

    // 2. Seed de Sugestões Inteligentes (conforme referência visual e ERP)
    const sugestoesCol = app.findCollectionByNameOrId('jetro_online_sugestoes')
    const sugestoesSeed = [
      {
        texto: 'Giro do Distribuidor',
        descricao: 'Análise de giro e movimentação de estoques por distribuidor e parceiro',
        modulo: 'Comercial',
        ordem: 1,
        ativo: true,
      },
      {
        texto: 'Quais clientes não compram há mais de 30 dias?',
        descricao: 'Lista auditada de clientes com última venda há mais de um mês',
        modulo: 'Comercial',
        ordem: 2,
        ativo: true,
      },
      {
        texto: 'Quanto vendi para cada cliente?',
        descricao: 'Faturamento acumulado faturado por cliente no período recente',
        modulo: 'Comercial',
        ordem: 3,
        ativo: true,
      },
      {
        texto: 'Faturamento total do mês atual',
        descricao: 'Soma dos pedidos válidos e faturados da competência corrente',
        modulo: 'Comercial',
        ordem: 4,
        ativo: true,
      },
      {
        texto: 'Quais títulos vencidos a receber temos?',
        descricao: 'Títulos em atraso na carteira de cobrança financeira',
        modulo: 'Financeiro',
        ordem: 5,
        ativo: true,
      },
      {
        texto: 'Quais produtos estão com estoque baixo?',
        descricao: 'Itens com saldo inferior ao estoque mínimo estipulado',
        modulo: 'Estoque',
        ordem: 6,
        ativo: true,
      },
    ]

    for (let i = 0; i < sugestoesSeed.length; i++) {
      const s = sugestoesSeed[i]
      let found = false
      try {
        const records = app.findRecordsByFilter(
          'jetro_online_sugestoes',
          'texto = "' + s.texto.replace(/"/g, '\\"') + '"',
          '-created',
          1,
          0,
        )
        if (records && records.length > 0) found = true
      } catch (_) {}

      if (!found) {
        const rec = new Record(sugestoesCol)
        rec.set('texto', s.texto)
        rec.set('descricao', s.descricao)
        rec.set('modulo', s.modulo)
        rec.set('ordem', s.ordem)
        rec.set('ativo', s.ativo)
        rec.set('cliques_count', 0)
        app.save(rec)
      }
    }

    // 3. Seed de Vídeos da Universidade Jetro (exemplos citados expressamente pelo usuário)
    const videoCol = app.findCollectionByNameOrId('jetro_universidade_videos')
    const videosSeed = [
      {
        titulo: 'Como cadastrar clientes',
        youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        youtube_id: 'dQw4w9WgXcQ',
        descricao:
          'Passo a passo completo para cadastrar clientes PF e PJ, limites de crédito, vínculos com RCAs e validações de CNPJ.',
        modulo: 'Cadastros',
        assunto: 'Cadastro de Clientes',
        palavras_chave:
          'cadastrar cliente, novo cliente, parceiro, cnpj, cpf, limite de credito, rca',
        rota_relacionada: '/admin/cadastros/clientes',
        ordem: 1,
        ativo: true,
      },
      {
        titulo: 'Como consultar pedidos',
        youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        youtube_id: 'dQw4w9WgXcQ',
        descricao:
          'Tutorial ensinando como filtrar pedidos de vendas, verificar status de aprovação, saldos parciais e faturamento.',
        modulo: 'Comercial',
        assunto: 'Consulta e Gestão de Pedidos',
        palavras_chave:
          'consultar pedido, pedido de venda, status pedido, faturamento, saldo, vendedor',
        rota_relacionada: '/admin/vendas/pedidos',
        ordem: 2,
        ativo: true,
      },
      {
        titulo: 'Como emitir relatórios',
        youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        youtube_id: 'dQw4w9WgXcQ',
        descricao:
          'Aprenda a gerar relatórios executivos em PDF/Excel, agendar envios periódicos e customizar colunas.',
        modulo: 'Administração',
        assunto: 'Relatórios e Agendamentos',
        palavras_chave: 'emitir relatorio, exportar excel, pdf, agendamento, bi, indicadores',
        rota_relacionada: '/admin/agendamento-relatorios',
        ordem: 3,
        ativo: true,
      },
      {
        titulo: 'Como utilizar o Jetro On-line',
        youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        youtube_id: 'dQw4w9WgXcQ',
        descricao:
          'Guia do assistente inteligente do ERP Jetro: consultas em linguagem natural, atalhos, gráficos e auditoria.',
        modulo: 'Geral',
        assunto: 'Assistente Inteligente',
        palavras_chave: 'jetro online, chat, ia, assistente, ajuda, como usar, perguntas',
        rota_relacionada: '/admin',
        ordem: 4,
        ativo: true,
      },
      {
        titulo: 'Como configurar permissões',
        youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        youtube_id: 'dQw4w9WgXcQ',
        descricao:
          'Gestão de perfis de acesso, matriz RBAC, permissões por departamento e segurança da informação.',
        modulo: 'Administração',
        assunto: 'Segurança e Permissões',
        palavras_chave: 'configurar permissoes, rbac, perfil de acesso, usuarios, seguranca, roles',
        rota_relacionada: '/admin/cadastros/perfis-permissoes',
        ordem: 5,
        ativo: true,
      },
      {
        titulo: 'Como utilizar o módulo financeiro',
        youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        youtube_id: 'dQw4w9WgXcQ',
        descricao:
          'Operações de contas a receber, contas a pagar, conciliação bancária, emissão de boletos e fluxo de caixa.',
        modulo: 'Financeiro',
        assunto: 'Gestão Financeira',
        palavras_chave:
          'financeiro, contas a receber, contas a pagar, fluxo de caixa, conciliacao, titulos',
        rota_relacionada: '/admin/financeiro',
        ordem: 6,
        ativo: true,
      },
      {
        titulo: 'Como trabalhar com Planilhas Convertidas',
        youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        youtube_id: 'dQw4w9WgXcQ',
        descricao:
          'Importação e parametrização de planilhas de precificação, comparativo de margens GR e fórmulas dinâmicas.',
        modulo: 'Controladoria',
        assunto: 'Planilhas e Margens GR',
        palavras_chave:
          'planilhas convertidas, margens gr, tabela mae, formulas, precos, simulacao',
        rota_relacionada: '/admin/planilhas-convertidas',
        ordem: 7,
        ativo: true,
      },
    ]

    for (let i = 0; i < videosSeed.length; i++) {
      const v = videosSeed[i]
      let found = false
      try {
        const records = app.findRecordsByFilter(
          'jetro_universidade_videos',
          'titulo = "' + v.titulo.replace(/"/g, '\\"') + '"',
          '-created',
          1,
          0,
        )
        if (records && records.length > 0) found = true
      } catch (_) {}

      if (!found) {
        const rec = new Record(videoCol)
        rec.set('titulo', v.titulo)
        rec.set('youtube_url', v.youtube_url)
        rec.set('youtube_id', v.youtube_id)
        rec.set('descricao', v.descricao)
        rec.set('modulo', v.modulo)
        rec.set('assunto', v.assunto)
        rec.set('palavras_chave', v.palavras_chave)
        rec.set('rota_relacionada', v.rota_relacionada)
        rec.set('ordem', v.ordem)
        rec.set('ativo', v.ativo)
        rec.set('visualizacoes', 0)
        rec.set('recomendacoes_count', 0)
        app.save(rec)
      }
    }

    // 4. Seed de Tours Guiados iniciais
    const tourCol = app.findCollectionByNameOrId('jetro_tours')
    const toursSeed = [
      {
        titulo: 'Tour da Tela Inicial Inteligente',
        descricao:
          'Conheça os principais atalhos, cartões de indicadores e o assistente Jetro On-line.',
        rota: '/admin',
        modulo: 'Geral',
        ativo: true,
        ordem: 1,
        etapas: [
          {
            titulo: 'Bem-vindo ao Jetro ERP',
            texto:
              'Esta é sua visão geral corporativa unificada, com dados em tempo real dos seus módulos autorizados.',
            seletor: '#admin-main-content',
            posicao: 'bottom',
          },
          {
            titulo: 'Busca Global',
            texto:
              'Encontre telas, cadastros e relatórios rapidamente usando a barra de busca ou Ctrl+K.',
            seletor: 'input[placeholder*="Buscar"]',
            posicao: 'bottom',
          },
          {
            titulo: 'Jetro On-line',
            texto:
              'Clique no botão flutuante a qualquer momento para abrir o assistente operacional e consultar dados reais.',
            seletor: '#floating-chat-trigger',
            posicao: 'left',
          },
        ],
      },
      {
        titulo: 'Tour de Cadastro de Clientes',
        descricao:
          'Entenda os campos essenciais, limites de crédito e regras de negócio para parceiros.',
        rota: '/admin/cadastros/clientes',
        modulo: 'Cadastros',
        ativo: true,
        ordem: 2,
        etapas: [
          {
            titulo: 'Gestão de Clientes',
            texto:
              'Consulte a carteira de parceiros comerciais, situação cadastral e dados fiscais.',
            seletor: '#admin-main-content',
            posicao: 'bottom',
          },
        ],
      },
    ]

    for (let i = 0; i < toursSeed.length; i++) {
      const tr = toursSeed[i]
      let found = false
      try {
        const records = app.findRecordsByFilter(
          'jetro_tours',
          'rota = "' + tr.rota.replace(/"/g, '\\"') + '"',
          '-created',
          1,
          0,
        )
        if (records && records.length > 0) found = true
      } catch (_) {}

      if (!found) {
        const rec = new Record(tourCol)
        rec.set('titulo', tr.titulo)
        rec.set('descricao', tr.descricao)
        rec.set('rota', tr.rota)
        rec.set('modulo', tr.modulo)
        rec.set('etapas', tr.etapas)
        rec.set('ativo', tr.ativo)
        rec.set('ordem', tr.ordem)
        app.save(rec)
      }
    }
  },
  (app) => {
    // Reversão opcional
  },
)
