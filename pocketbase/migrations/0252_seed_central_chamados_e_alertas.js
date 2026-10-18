/// <reference path="../pb_data/types.d.ts" />

migrate(
  (app) => {
    // 1. Adicionar campos de controle de alertas em 'chamados' para deduplicação limpa
    try {
      const chamadosCol = app.findCollectionByNameOrId('chamados')
      if (chamadosCol) {
        let changed = false
        if (!chamadosCol.fields.getByName('ultimo_alerta_em')) {
          chamadosCol.fields.add(
            new DateField({
              name: 'ultimo_alerta_em',
              required: false,
            }),
          )
          changed = true
        }
        if (!chamadosCol.fields.getByName('ultimo_alerta_tipo')) {
          chamadosCol.fields.add(
            new TextField({
              name: 'ultimo_alerta_tipo',
              required: false,
            }),
          )
          changed = true
        }
        if (changed) {
          app.save(chamadosCol)
        }
      }
    } catch (errAdd) {
      console.log('Aviso ao adicionar campos de alerta em chamados:', errAdd)
    }

    // 2. Localizar usuários e departamentos reais existentes
    const chamadosCol = app.findCollectionByNameOrId('chamados')
    const histCol = app.findCollectionByNameOrId('chamados_historico')
    const comCol = app.findCollectionByNameOrId('chamados_comunicacao')

    let allUsers = []
    try {
      allUsers = app.findRecordsByFilter('users', 'active = true', 'created', 10, 0)
      if (!allUsers || allUsers.length === 0) {
        allUsers = app.findRecordsByFilter('users', '', 'created', 10, 0)
      }
    } catch (_) {}

    let allDepts = []
    try {
      allDepts = app.findRecordsByFilter('rh_departments', 'situacao = "Ativo"', 'code', 10, 0)
      if (!allDepts || allDepts.length === 0) {
        allDepts = app.findRecordsByFilter('rh_departments', '', 'code', 10, 0)
      }
    } catch (_) {}

    if (!allUsers || allUsers.length === 0 || !allDepts || allDepts.length === 0) {
      console.log('Não há usuários ou departamentos cadastrados para seed de chamados.')
      return
    }

    // Mapear usuários reais
    // Esperado: Rogerio (7h8lo69uin2wyrf), Alef (joxe7xqo5mgopno), Jetro Admin (t2ls955cvcpburb)
    const userIds = allUsers.map((u) => u.id)
    const deptIds = allDepts.map((d) => d.id)

    const adminUser = allUsers.find((u) => u.getString('role') === 'SUP') || allUsers[0]
    const uAdminId = adminUser.id
    const uRogerioId =
      allUsers.find((u) => (u.getString('email') || '').includes('rogerio'))?.id || userIds[0]
    const uAlefId =
      allUsers.find((u) => (u.getString('email') || '').includes('alef'))?.id ||
      userIds[userIds.length > 1 ? 1 : 0]

    const deptAdminId =
      allDepts.find((d) => (d.getString('name') || '').toLowerCase().includes('admin'))?.id ||
      deptIds[0]
    const deptOpId =
      allDepts.find((d) => (d.getString('name') || '').toLowerCase().includes('opera'))?.id ||
      deptIds[deptIds.length > 1 ? 1 : 0]
    const deptComId =
      allDepts.find((d) => (d.getString('name') || '').toLowerCase().includes('comer'))?.id ||
      deptIds[deptIds.length > 2 ? 2 : 0]

    // Obter sequencial inicial
    const year = new Date().getFullYear()
    const prefix = 'CH-' + year + '-'
    let nextSeq = 2 // CH-2026-000001 já existe
    try {
      const lastRecs = app.findRecordsByFilter(
        'chamados',
        'numero ~ "' + prefix + '"',
        '-numero',
        1,
        0,
      )
      if (lastRecs && lastRecs.length > 0) {
        const lastNum = lastRecs[0].getString('numero') || ''
        const parts = lastNum.split('-')
        if (parts.length === 3) {
          const parsed = parseInt(parts[2], 10)
          if (!isNaN(parsed) && parsed >= 1) nextSeq = parsed + 1
        }
      }
    } catch (_) {}

    const nowMs = Date.now()
    const HOUR = 3600 * 1000
    const DAY = 24 * HOUR

    // Conjunto de chamados de teste realistas cobrindo:
    // status: novo, andamento, aprovacao, finalizado, cancelado
    // prioridades: baixa, normal, alta, urgente
    // datas de abertura espalhadas nos últimos dias/semanas
    // atrasados, próximos do vencimento, no prazo, finalizados no prazo e fora do prazo
    const seedsChamados = [
      {
        identificador: '[TESTE] Lentidão intermitente no faturamento e emissão de NF-e',
        diasAtras: 14,
        prioridade: 'alta',
        status: 'finalizado',
        setor: deptOpId,
        solicitante: uAlefId,
        responsavel: uRogerioId,
        aprovador: uAdminId,
        prazoHoras: 24, // SLA alta = 24h
        concluidoEmHorasDepois: 18, // concluído no prazo (18h < 24h)
        descricao:
          '<p>Faturamento apresentando lentidão nos horários de pico durante a emissão síncrona de notas fiscais na filial Vitória.</p>',
        acoes: [
          {
            horasDepois: 0,
            statusAnt: '',
            statusNovo: 'novo',
            user: uAlefId,
            desc: 'Chamado aberto no sistema',
          },
          {
            horasDepois: 2,
            statusAnt: 'novo',
            statusNovo: 'andamento',
            user: uRogerioId,
            desc: 'Iniciada análise das tabelas de auditoria e conexões de banco de dados.',
          },
          {
            horasDepois: 18,
            statusAnt: 'andamento',
            statusNovo: 'finalizado',
            user: uRogerioId,
            desc: 'Otimizados índices das consultas fiscais e normalizado tempo de resposta para menos de 400ms.',
          },
        ],
        mensagens: [
          {
            horasDepois: 3,
            user: uRogerioId,
            msg: 'Alef, verificamos que os pools de conexão estavam esgotando durante o fechamento de lotes. Estamos aplicando patch no servidor.',
          },
          {
            horasDepois: 5,
            user: uAlefId,
            msg: 'Perfeito Rogério, monitorando aqui na expedição.',
          },
        ],
      },
      {
        identificador: '[TESTE] Bloqueio indevido de limite de crédito para cliente VIP',
        diasAtras: 10,
        prioridade: 'urgente',
        status: 'finalizado',
        setor: deptComId,
        solicitante: uAlefId,
        responsavel: uAdminId,
        aprovador: uRogerioId,
        prazoHoras: 8, // SLA urgente = 8h
        concluidoEmHorasDepois: 14, // concluído fora do prazo (14h > 8h) -> atrasado histórico
        descricao:
          '<p>Pedido de venda 4820 travado no checkout por inconsistência no cálculo da margem de garantia cadastrada.</p>',
        acoes: [
          {
            horasDepois: 0,
            statusAnt: '',
            statusNovo: 'novo',
            user: uAlefId,
            desc: 'Chamado aberto com prioridade máxima',
          },
          {
            horasDepois: 1,
            statusAnt: 'novo',
            statusNovo: 'andamento',
            user: uAdminId,
            desc: 'Ajustada régua de validação de duplicatas em aberto no módulo financeiro.',
          },
          {
            horasDepois: 14,
            statusAnt: 'andamento',
            statusNovo: 'finalizado',
            user: uAdminId,
            desc: 'Liberação emergencial concedida e pedido despachado.',
          },
        ],
        mensagens: [
          {
            horasDepois: 1,
            user: uAlefId,
            msg: 'O cliente está com o caminhão parado aguardando o carregamento.',
          },
          {
            horasDepois: 2,
            user: uAdminId,
            msg: 'Concluindo verificação das garantias bancárias.',
          },
        ],
      },
      {
        identificador: '[TESTE] Solicitação de aprovação para desconto comercial extraordinário',
        diasAtras: 7,
        prioridade: 'normal',
        status: 'cancelado',
        setor: deptComId,
        solicitante: uRogerioId,
        responsavel: uAdminId,
        aprovador: uAdminId,
        prazoHoras: 48,
        canceladoJustificativa:
          'Cliente optou por rever o mix de produtos e desistiu da bonificação.',
        descricao:
          '<p>Solicitação de aprovação de 8,5% de desconto para proposta de fornecimento trimestral da rede parceira.</p>',
        acoes: [
          {
            horasDepois: 0,
            statusAnt: '',
            statusNovo: 'novo',
            user: uRogerioId,
            desc: 'Chamado aberto para aprovação da diretoria',
          },
          {
            horasDepois: 12,
            statusAnt: 'novo',
            statusNovo: 'cancelado',
            user: uRogerioId,
            desc: 'Chamado cancelado a pedido da área comercial: cliente optou por rever o mix de produtos.',
          },
        ],
        mensagens: [],
      },
      {
        identificador: '[TESTE] Falha crítica de sincronização do WMS com coletor de dados',
        diasAtras: 2, // aberto há 48h, prazo urgente de 8h -> ATRASADO crítico!
        prioridade: 'urgente',
        status: 'andamento',
        setor: deptOpId,
        solicitante: uAlefId,
        responsavel: uRogerioId,
        aprovador: uAdminId,
        prazoHoras: 8,
        descricao:
          '<p>Coletores RF da doca 03 não estão confirmando tarefas de separação de picking após atualização de firmware.</p>',
        acoes: [
          {
            horasDepois: 0,
            statusAnt: '',
            statusNovo: 'novo',
            user: uAlefId,
            desc: 'Chamado urgente aberto pela equipe da doca',
          },
          {
            horasDepois: 1,
            statusAnt: 'novo',
            statusNovo: 'andamento',
            user: uRogerioId,
            desc: 'Coletando logs de rede dos access points e homologando pacote de correção.',
          },
        ],
        mensagens: [
          {
            horasDepois: 2,
            user: uRogerioId,
            msg: 'Identificamos timeout no protocolo websocket. Estamos subindo servidor proxy temporário.',
          },
          {
            horasDepois: 4,
            user: uAlefId,
            msg: 'Operação usando separação manual assistida enquanto não restabelece.',
          },
        ],
      },
      {
        identificador: '[TESTE] Liberação de alçada de crédito para expansão de frota',
        diasAtras: 1, // aberto há 24h
        prioridade: 'alta',
        status: 'aprovacao',
        setor: deptAdminId,
        solicitante: uRogerioId,
        responsavel: uAdminId,
        aprovador: uAdminId,
        prazoHoras: 28, // vence daqui a 4h -> PRÓXIMO DO VENCIMENTO!
        descricao:
          '<p>Requisição de investimento para aditivo contratual e seguro de três novos cavalos mecânicos.</p>',
        acoes: [
          {
            horasDepois: 0,
            statusAnt: '',
            statusNovo: 'novo',
            user: uRogerioId,
            desc: 'Chamado aberto com parecer da controladoria anexado',
          },
          {
            horasDepois: 4,
            statusAnt: 'novo',
            statusNovo: 'aprovacao',
            user: uAdminId,
            desc: 'Encaminhado para validação da diretoria executiva.',
          },
        ],
        mensagens: [
          {
            horasDepois: 5,
            user: uRogerioId,
            msg: 'Documentação do consórcio validada pelo jurídico.',
          },
        ],
      },
      {
        identificador: '[TESTE] Configuração de novo layout de etiquetas térmicas Zebra',
        diasAtras: 1, // aberto há 12h
        prioridade: 'normal',
        status: 'novo',
        setor: deptOpId,
        solicitante: uAlefId,
        responsavel: uRogerioId,
        aprovador: '',
        prazoHoras: 48, // vence daqui a 36h -> DENTRO DO PRAZO
        descricao:
          '<p>Necessário adequar a etiqueta com código Datamatrix e logomarca Jetro conforme exigência da ANVISA.</p>',
        acoes: [
          {
            horasDepois: 0,
            statusAnt: '',
            statusNovo: 'novo',
            user: uAlefId,
            desc: 'Chamado aberto com modelo ZPL anexado',
          },
        ],
        mensagens: [],
      },
      {
        identificador: '[TESTE] Atualização periódica da tabela de fretes interestadual',
        diasAtras: 3,
        prioridade: 'baixa',
        status: 'andamento',
        setor: deptAdminId,
        solicitante: uAdminId,
        responsavel: uAlefId,
        aprovador: '',
        prazoHoras: 72, // vence em breve -> DENTRO DO PRAZO / PROXIMO DO VENCIMENTO
        descricao:
          '<p>Importar planilha de reajuste ANTT para rotas Espírito Santo x São Paulo e Minas Gerais.</p>',
        acoes: [
          {
            horasDepois: 0,
            statusAnt: '',
            statusNovo: 'novo',
            user: uAdminId,
            desc: 'Chamado aberto com tabela de reajuste',
          },
          {
            horasDepois: 6,
            statusAnt: 'novo',
            statusNovo: 'andamento',
            user: uAlefId,
            desc: 'Importando planilhas no simulador de custos de frete.',
          },
        ],
        mensagens: [
          {
            horasDepois: 8,
            user: uAlefId,
            msg: 'Simulações iniciais concluídas, validando impacto de margem.',
          },
        ],
      },
      {
        identificador: '[TESTE] Manutenção preventiva no servidor de banco de dados',
        diasAtras: 5,
        prioridade: 'alta',
        status: 'finalizado',
        setor: deptAdminId,
        solicitante: uAdminId,
        responsavel: uRogerioId,
        aprovador: uAdminId,
        prazoHoras: 24,
        concluidoEmHorasDepois: 20, // no prazo
        descricao:
          '<p>Execução de VACUUM ANALYZE, reindexação das tabelas operacionais e checagem de integridade dos volumes SSD.</p>',
        acoes: [
          {
            horasDepois: 0,
            statusAnt: '',
            statusNovo: 'novo',
            user: uAdminId,
            desc: 'Janela de manutenção autorizada',
          },
          {
            horasDepois: 2,
            statusAnt: 'novo',
            statusNovo: 'andamento',
            user: uRogerioId,
            desc: 'Iniciada rotina em ambiente de espelho antes do commit de produção.',
          },
          {
            horasDepois: 20,
            statusAnt: 'andamento',
            statusNovo: 'finalizado',
            user: uRogerioId,
            desc: 'Manutenção concluída sem indisponibilidade de serviços.',
          },
        ],
        mensagens: [],
      },
    ]

    for (let i = 0; i < seedsChamados.length; i++) {
      const item = seedsChamados[i]

      // Checagem de idempotência: verificar se já existe chamado com este assunto
      try {
        const exist = app.findRecordsByFilter(
          'chamados',
          'assunto = "' + item.identificador + '"',
          '-created',
          1,
          0,
        )
        if (exist && exist.length > 0) {
          continue
        }
      } catch (_) {}

      const padded = ('000000' + nextSeq).slice(-6)
      const numeroFinal = prefix + padded
      nextSeq++

      const dataAberturaMs = nowMs - item.diasAtras * DAY
      const dtAbertura = new Date(dataAberturaMs)
      const dtAtendimento = new Date(dataAberturaMs + Math.round(item.prazoHoras * 0.25) * HOUR)
      const dtResolucao = new Date(dataAberturaMs + item.prazoHoras * HOUR)

      let dtConclusao = ''
      if (item.status === 'finalizado') {
        const hFim = item.concluidoEmHorasDepois || item.prazoHoras
        dtConclusao = new Date(dataAberturaMs + hFim * HOUR).toISOString()
      } else if (item.status === 'cancelado') {
        dtConclusao = new Date(dataAberturaMs + 12 * HOUR).toISOString()
      }

      const rec = new Record(chamadosCol)
      rec.set('numero', numeroFinal)
      rec.set('assunto', item.identificador)
      rec.set('descricao', item.descricao)
      rec.set('setor_responsavel', item.setor)
      rec.set('profissional_responsavel', item.responsavel)
      rec.set('solicitante', item.solicitante)
      rec.set('prioridade', item.prioridade)
      rec.set('status', item.status)
      if (item.aprovador) rec.set('aprovador', item.aprovador)
      if (item.canceladoJustificativa)
        rec.set('cancelado_justificativa', item.canceladoJustificativa)
      if (dtConclusao) rec.set('data_conclusao', dtConclusao)

      rec.set('prazo_atendimento', dtAtendimento.toISOString())
      rec.set('prazo_resolucao', dtResolucao.toISOString())
      rec.set('created', dtAbertura.toISOString())
      rec.set('updated', dtConclusao || new Date(dataAberturaMs + 2 * HOUR).toISOString())

      app.save(rec)

      // Criar histórico coerente
      for (let h = 0; h < item.acoes.length; h++) {
        const acao = item.acoes[h]
        const dtAcao = new Date(dataAberturaMs + acao.horasDepois * HOUR).toISOString()
        try {
          const hist = new Record(histCol)
          hist.set('chamado', rec.id)
          hist.set('usuario', acao.user)
          hist.set('status_anterior', acao.statusAnt)
          hist.set('status_novo', acao.statusNovo)
          hist.set('descricao_acao', acao.desc)
          hist.set('criado_em', dtAcao)
          hist.set('created', dtAcao)
          hist.set('updated', dtAcao)
          app.save(hist)
        } catch (errH) {
          console.log('Falha ao gravar historico de seed:', errH)
        }
      }

      // Criar mensagens de comunicação
      for (let m = 0; m < item.mensagens.length; m++) {
        const msg = item.mensagens[m]
        const dtMsg = new Date(dataAberturaMs + msg.horasDepois * HOUR).toISOString()
        try {
          const com = new Record(comCol)
          com.set('chamado', rec.id)
          com.set('usuario', msg.user)
          com.set('mensagem', msg.msg)
          com.set('criado_em', dtMsg)
          com.set('created', dtMsg)
          com.set('updated', dtMsg)
          app.save(com)
        } catch (errM) {
          console.log('Falha ao gravar comunicacao de seed:', errM)
        }
      }
    }
  },
  (app) => {
    // Reverter seeds de teste criados nesta migração se necessário
    try {
      const chamados = app.findRecordsByFilter(
        'chamados',
        'assunto ~ "[TESTE]" && numero != "CH-2026-000001"',
        '',
        100,
        0,
      )
      for (let i = 0; i < chamados.length; i++) {
        app.delete(chamados[i])
      }
    } catch (_) {}
  },
)
