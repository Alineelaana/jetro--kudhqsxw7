import pb from '@/lib/pocketbase/client'
import type {
  SolicitacaoClienteRecord,
  ClienteOficialRecord,
  AprovacaoCreditoRecord,
  SolicitacaoStatus,
  SituacaoCredito,
} from '@/lib/client-workflow-types'

export interface RcaHierarchy {
  rcaId: string
  rcaNome: string
  rcaCodigo: string
  gerenteId: string
  gerenteNome: string
  gerenteCodigo: string
  inconsistente: boolean
  motivoInconsistencia?: string
}

/**
 * Consulta a hierarquia organizacional do RCA autenticado:
 * Busca na coleção 'representantes' ou 'vendedores' ou 'users'.
 * O RCA principal e o Gerente Comercial são determinados a partir dos cadastros oficiais.
 */
export async function getRcaHierarchy(userId: string, userName?: string): Promise<RcaHierarchy> {
  try {
    // 1. Tentar encontrar representante vinculado pelo email ou nome do usuário
    const user = await pb.collection('users').getOne(userId)
    const userEmail = (user.email || '').trim().toLowerCase()
    const uName = (user.name || userName || '').trim()

    // Buscar em representantes
    let repRecord = null
    try {
      const repList = await pb.collection('representantes').getFullList({
        filter: `active = true && (email ~ "${userEmail}" || name ~ "${uName}")`,
        sort: '-created',
      })
      if (repList.length > 0) repRecord = repList[0]
    } catch {
      /* intentionally ignored */
    }

    // Se não encontrou, buscar em vendedores
    let vendRecord = null
    if (!repRecord) {
      try {
        const vendList = await pb.collection('vendedores').getFullList({
          filter: `active = true && (email ~ "${userEmail}" || name ~ "${uName}")`,
          sort: '-created',
        })
        if (vendList.length > 0) vendRecord = vendList[0]
      } catch {
        /* intentionally ignored */
      }
    }

    const rcaRecord = repRecord || vendRecord

    if (rcaRecord) {
      const supervisorName = rcaRecord.supervisor || 'Gerência Comercial Geral'
      return {
        rcaId: rcaRecord.id,
        rcaNome: rcaRecord.name || uName,
        rcaCodigo: rcaRecord.code || rcaRecord.id,
        gerenteId:
          'ger-' +
          (rcaRecord.supervisor
            ? rcaRecord.supervisor.toLowerCase().replace(/\s+/g, '-')
            : 'comercial'),
        gerenteNome: supervisorName,
        gerenteCodigo: 'GER-COM',
        inconsistente: !rcaRecord.supervisor,
        motivoInconsistencia: !rcaRecord.supervisor
          ? 'RCA ativo localizado, porém supervisor/gerente não está cadastrado em seu registro oficial.'
          : undefined,
      }
    }

    // Se o usuário tem perfil administrativo/SUP/COMERCIAL
    const role = user.role || ''
    if (['SUP', 'COMERCIAL'].includes(role)) {
      // Carregar primeiro representante ativo cadastrado como referência oficial
      const fallbackReps = await pb.collection('representantes').getFullList({
        filter: 'active = true',
        sort: 'name',
      })
      if (fallbackReps.length > 0) {
        const first = fallbackReps[0]
        return {
          rcaId: first.id,
          rcaNome: first.name,
          rcaCodigo: first.code || first.id,
          gerenteId: 'ger-01',
          gerenteNome: first.supervisor || 'Carlos Roberto (Gerente Comercial)',
          gerenteCodigo: 'GER-01',
          inconsistente: false,
        }
      }
    }

    return {
      rcaId: user.id,
      rcaNome: uName || 'Usuário Solicitante',
      rcaCodigo: user.id.slice(0, 6).toUpperCase(),
      gerenteId: '',
      gerenteNome: '',
      gerenteCodigo: '',
      inconsistente: true,
      motivoInconsistencia:
        'Usuário atual não possui vínculo ativo de RCA oficial nem Gerente Comercial cadastrado na hierarquia.',
    }
  } catch (err: any) {
    return {
      rcaId: userId,
      rcaNome: userName || 'Usuário',
      rcaCodigo: 'PEND',
      gerenteId: '',
      gerenteNome: '',
      gerenteCodigo: '',
      inconsistente: true,
      motivoInconsistencia: 'Falha ao consultar hierarquia organizacional: ' + (err?.message || ''),
    }
  }
}

/**
 * Validação de duplicidade de CPF ou CNPJ em clientes oficiais e solicitações
 */
export async function checkDocumentDuplicity(
  cpfCnpj: string,
  excludeSolicitacaoId?: string,
): Promise<{
  isDuplicate: boolean
  tipo?: 'cliente_oficial' | 'solicitacao_andamento'
  codigo?: string
  nome?: string
  status?: string
}> {
  const cleanDoc = cpfCnpj.replace(/\D/g, '')
  if (!cleanDoc) return { isDuplicate: false }

  // 1. Checar em clientes oficiais (partners com partner_type = 'Cliente')
  try {
    const clients = await pb.collection('partners').getFullList({
      filter: `partner_type = "Cliente" && (cnpj ~ "${cleanDoc}" || cpf ~ "${cleanDoc}")`,
      sort: '-created',
    })
    if (clients.length > 0) {
      const c = clients[0]
      return {
        isDuplicate: true,
        tipo: 'cliente_oficial',
        codigo: c.codigo_oficial || c.id,
        nome: c.trade_name || c.company_name || c.full_name || '',
        status: c.active !== false ? 'Ativo' : 'Inativo',
      }
    }
  } catch {
    /* intentionally ignored */
  }

  // 2. Checar em solicitações em andamento
  try {
    const filter = excludeSolicitacaoId
      ? `id != "${excludeSolicitacaoId}" && cpf_cnpj ~ "${cleanDoc}" && status != "concluido" && status != "cancelado" && status != "rejeitado"`
      : `cpf_cnpj ~ "${cleanDoc}" && status != "concluido" && status != "cancelado" && status != "rejeitado"`

    const solics = await pb.collection('solicitacoes_clientes').getFullList({
      filter,
      sort: '-created',
    })
    if (solics.length > 0) {
      const s = solics[0]
      return {
        isDuplicate: true,
        tipo: 'solicitacao_andamento',
        codigo: s.numero || s.id,
        nome: s.nome_fantasia || s.razao_social || '',
        status: s.status,
      }
    }
  } catch {
    /* intentionally ignored */
  }

  return { isDuplicate: false }
}

/**
 * Operações com Pré-Cadastros (solicitacoes_clientes)
 */
export async function listSolicitacoes(
  filter?: string,
  sort = '-created',
): Promise<SolicitacaoClienteRecord[]> {
  try {
    const records = await pb.collection('solicitacoes_clientes').getFullList({
      filter: filter || '',
      sort,
    })
    return records as unknown as SolicitacaoClienteRecord[]
  } catch (err) {
    console.warn('Erro ao listar solicitações:', err)
    return []
  }
}

export async function getSolicitacaoById(id: string): Promise<SolicitacaoClienteRecord | null> {
  try {
    const record = await pb.collection('solicitacoes_clientes').getOne(id)
    return record as unknown as SolicitacaoClienteRecord
  } catch {
    return null
  }
}

export async function createSolicitacao(
  data: Partial<SolicitacaoClienteRecord>,
): Promise<SolicitacaoClienteRecord> {
  const record = await pb.collection('solicitacoes_clientes').create(data)
  return record as unknown as SolicitacaoClienteRecord
}

export async function updateSolicitacao(
  id: string,
  data: Partial<SolicitacaoClienteRecord>,
): Promise<SolicitacaoClienteRecord> {
  const record = await pb.collection('solicitacoes_clientes').update(id, data)
  return record as unknown as SolicitacaoClienteRecord
}

/**
 * Conclusão do cadastro oficial pelo Comercial:
 * Cria o registro oficial em 'partners' com código gerado, atualiza a solicitação para 'concluido'
 * e, se exigir análise de crédito, cria automaticamente a solicitação na fila Financeiro → Aprovações.
 */
export async function concluirCadastroOficial(params: {
  solicitacaoId?: string
  dadosCliente: Partial<ClienteOficialRecord>
  usuarioConclusao: { id: string; nome: string }
  exigeAnaliseCredito: boolean
  limitePretendido?: string
  condicaoPagamentoSolicitada?: string
  observacoesComerciais?: string
}): Promise<{ cliente: ClienteOficialRecord; aprovacao?: AprovacaoCreditoRecord }> {
  const {
    solicitacaoId,
    dadosCliente,
    usuarioConclusao,
    exigeAnaliseCredito,
    limitePretendido,
    condicaoPagamentoSolicitada,
    observacoesComerciais,
  } = params

  // 1. Salvar cliente em partners (o hook client_workflow_hooks gera CLI-ANO-XXXXXX atomicamente)
  const novoClientePayload: Record<string, any> = {
    ...dadosCliente,
    partner_type: 'Cliente',
    active: true,
    blocked: false,
    financial_restriction: false,
    situacao_credito: exigeAnaliseCredito ? 'Pendente de análise' : 'Aprovado',
    limite_credito: exigeAnaliseCredito ? '0.00' : limitePretendido || '0.00',
    limite_credito_disponivel: exigeAnaliseCredito ? '0.00' : limitePretendido || '0.00',
    bloqueio_vendas_prazo: exigeAnaliseCredito, // Bloqueia venda a prazo enquanto pendente de análise financeira
    solicitacao_origem_id: solicitacaoId || '',
    observacoes_comerciais: observacoesComerciais || '',
  }

  // Garantir histórico de eventos inicial
  const hist = [
    {
      data_hora: new Date().toISOString(),
      usuario_id: usuarioConclusao.id,
      usuario_nome: usuarioConclusao.nome,
      acao: 'Cadastro oficial concluído e validado pelo Comercial',
      detalhes: `Código sequencial atribuído. Situação de crédito inicial: ${novoClientePayload.situacao_credito}.`,
    },
  ]
  novoClientePayload.historico_eventos = hist

  const clienteCriado = (await pb
    .collection('partners')
    .create(novoClientePayload)) as unknown as ClienteOficialRecord

  // 2. Se vinculado a uma solicitação de pré-cadastro, marcar como concluído
  if (solicitacaoId) {
    try {
      const sol = await getSolicitacaoById(solicitacaoId)
      const histSol = sol?.historico || []
      histSol.push({
        data_hora: new Date().toISOString(),
        usuario_id: usuarioConclusao.id,
        usuario_nome: usuarioConclusao.nome,
        acao: 'Cadastro oficial efetivado no sistema',
        status: 'concluido',
        detalhes: `Cliente gerado: ${clienteCriado.codigo_oficial || clienteCriado.id}`,
      })

      await pb.collection('solicitacoes_clientes').update(solicitacaoId, {
        status: 'concluido',
        cliente_gerado_id: clienteCriado.id,
        cliente_gerado_codigo: clienteCriado.codigo_oficial || clienteCriado.id,
        data_conclusao: new Date().toISOString(),
        historico: histSol,
      })
    } catch (err) {
      console.warn('Erro ao atualizar solicitação vinculada:', err)
    }
  }

  // 3. Encaminhamento automático para Financeiro → Aprovações se exigir análise de crédito
  let aprovacaoGerada: AprovacaoCreditoRecord | undefined
  if (exigeAnaliseCredito) {
    try {
      const doc = clienteCriado.cnpj || clienteCriado.cpf || ''
      const nomeCli =
        clienteCriado.trade_name || clienteCriado.company_name || clienteCriado.full_name || ''

      const aprovPayload = {
        tipo_solicitacao: 'Crédito de Clientes',
        categoria: 'Crédito de Clientes',
        solicitante: usuarioConclusao.nome,
        data_hora: new Date().toISOString().split('T')[0],
        valor: limitePretendido || '0.00',
        status: 'Pendente de análise',
        motivo: `Análise cadastral de crédito para novo cliente ${clienteCriado.codigo_oficial || clienteCriado.id}. Condição solicitada: ${condicaoPagamentoSolicitada || 'A combinar'}.`,
        justificativa: 'Encaminhamento automático após validação comercial do cadastro oficial.',
        documento_relacionado: clienteCriado.codigo_oficial || clienteCriado.id,
        client_id: clienteCriado.id,
        client_codigo: clienteCriado.codigo_oficial || clienteCriado.id,
        client_nome: nomeCli,
        cnpj_cpf: doc,
        rca_nome: clienteCriado.rca_nome || '',
        gerente_nome: clienteCriado.gerente_comercial_nome || '',
        limite_solicitado: limitePretendido || '0.00',
        limite_aprovado: '0.00',
        condicoes_autorizadas: condicaoPagamentoSolicitada || '',
        bloquear_prazo: true,
        historico_analise: [
          {
            data_hora: new Date().toISOString(),
            usuario_id: usuarioConclusao.id,
            usuario_nome: usuarioConclusao.nome,
            acao: 'Solicitação de crédito encaminhada automaticamente pelo Comercial',
            status: 'Pendente de análise',
          },
        ],
      }

      aprovacaoGerada = (await pb
        .collection('financial_approvals')
        .create(aprovPayload)) as unknown as AprovacaoCreditoRecord
    } catch (errAppr) {
      console.warn('Erro ao criar aprovação financeira automática:', errAppr)
    }
  }

  return { cliente: clienteCriado, aprovacao: aprovacaoGerada }
}

/**
 * Atualização da Decisão Financeira de Crédito
 */
export async function aplicarDecisaoFinanceira(params: {
  aprovacaoId: string
  clientId: string
  decisao: SituacaoCredito
  limiteAprovado: string
  condicoesAutorizadas?: string
  validadeRevisao?: string
  motivoDecisao: string
  bloquearPrazo: boolean
  motivoBloqueio?: string
  analista: { id: string; nome: string }
}): Promise<void> {
  const {
    aprovacaoId,
    clientId,
    decisao,
    limiteAprovado,
    condicoesAutorizadas,
    validadeRevisao,
    motivoDecisao,
    bloquearPrazo,
    motivoBloqueio,
    analista,
  } = params

  const nowIso = new Date().toISOString()

  // 1. Atualizar registro em financial_approvals
  try {
    const appr = await pb.collection('financial_approvals').getOne(aprovacaoId)
    const hist = appr.historico_analise || []
    hist.push({
      data_hora: nowIso,
      usuario_id: analista.id,
      usuario_nome: analista.nome,
      acao: `Decisão de crédito: ${decisao}`,
      status: decisao,
      detalhes: `Limite aprovado: R$ ${limiteAprovado}. Bloqueio a prazo: ${bloquearPrazo ? 'SIM' : 'NÃO'}. Motivo: ${motivoDecisao}`,
    })

    await pb.collection('financial_approvals').update(aprovacaoId, {
      status: decisao,
      aprovador: analista.nome,
      limite_aprovado: limiteAprovado,
      condicoes_autorizadas: condicoesAutorizadas || '',
      validade_revisao: validadeRevisao || '',
      motivo_decisao: motivoDecisao,
      bloquear_prazo: bloquearPrazo,
      motivo_bloqueio: motivoBloqueio || '',
      historico_analise: hist,
    })
  } catch (err) {
    console.warn('Erro ao atualizar financial_approvals:', err)
  }

  // 2. Atualizar situação de crédito no cadastro oficial em partners
  try {
    const client = await pb.collection('partners').getOne(clientId)
    const histClient = client.historico_eventos || []
    histClient.push({
      data_hora: nowIso,
      usuario_id: analista.id,
      usuario_nome: analista.nome,
      acao: `Análise Financeira de Crédito: ${decisao}`,
      detalhes: `Limite: R$ ${limiteAprovado}. Bloqueio para vendas a prazo: ${bloquearPrazo ? 'ATIVADO' : 'LIBERADO'}.`,
    })

    await pb.collection('partners').update(clientId, {
      situacao_credito: decisao,
      limite_credito: limiteAprovado,
      limite_credito_disponivel: limiteAprovado,
      bloqueio_vendas_prazo: bloquearPrazo,
      motivo_bloqueio: bloquearPrazo ? motivoBloqueio || motivoDecisao : '',
      data_bloqueio: bloquearPrazo ? nowIso.split('T')[0] : '',
      historico_eventos: histClient,
    })
  } catch (errCli) {
    console.warn('Erro ao atualizar partners com decisão financeira:', errCli)
  }
}
