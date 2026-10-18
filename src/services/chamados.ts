import pb from '@/lib/pocketbase/client'

export type ChamadoPrioridade = 'baixa' | 'normal' | 'alta' | 'urgente'
export type ChamadoStatus = 'novo' | 'andamento' | 'aprovacao' | 'finalizado' | 'cancelado'

export interface Chamado {
  id: string
  numero: string
  assunto: string
  descricao: string
  setor_responsavel: string
  profissional_responsavel?: string
  solicitante: string
  prioridade: ChamadoPrioridade
  status: ChamadoStatus
  aprovador?: string
  participantes?: string[]
  convidados_email?: string[]
  anexos?: string[]
  prazo_atendimento?: string
  prazo_resolucao?: string
  cancelado_justificativa?: string
  created: string
  updated: string
  expand?: {
    setor_responsavel?: { id: string; name: string; code?: string }
    solicitante?: { id: string; name: string; email: string; avatar?: string }
    profissional_responsavel?: { id: string; name: string; email: string; avatar?: string }
    aprovador?: { id: string; name: string; email: string; avatar?: string }
    participantes?: Array<{ id: string; name: string; email: string; avatar?: string }>
  }
}

export interface ChamadoHistorico {
  id: string
  chamado: string
  usuario: string
  status_anterior?: string
  status_novo?: string
  descricao_acao: string
  anexos_acao?: string[]
  video_universidade_url?: string
  video_universidade_titulo?: string
  criado_em?: string
  created: string
  updated: string
  expand?: {
    usuario?: { id: string; name: string; email: string; avatar?: string }
  }
}

export interface ChamadoComunicacao {
  id: string
  chamado: string
  usuario: string
  mensagem: string
  anexos?: string[]
  video_universidade_url?: string
  video_universidade_titulo?: string
  criado_em?: string
  created: string
  updated: string
  expand?: {
    usuario?: { id: string; name: string; email: string; avatar?: string }
  }
}

export interface NovoChamadoPayload {
  assunto: string
  descricao: string
  setor_responsavel: string
  profissional_responsavel?: string
  prioridade: ChamadoPrioridade
  convidados_email?: string[]
  anexos?: File[]
}

export interface AlterarStatusPayload {
  chamadoId: string
  statusNovo: ChamadoStatus
  statusAnterior: ChamadoStatus
  descricaoAcao: string
  canceladoJustificativa?: string
  anexosAcao?: File[]
  videoUniversidadeUrl?: string
  videoUniversidadeTitulo?: string
}

export const STATUS_LABELS: Record<
  ChamadoStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  novo: {
    label: 'Novo Chamado',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800',
  },
  andamento: {
    label: 'Em Andamento',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800',
  },
  aprovacao: {
    label: 'Aguardando Aprovação',
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-200 dark:border-purple-800',
  },
  finalizado: {
    label: 'Finalizado',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800',
  },
  cancelado: {
    label: 'Cancelado',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-800',
  },
}

export const PRIORIDADE_LABELS: Record<ChamadoPrioridade, { label: string; badgeClass: string }> = {
  baixa: { label: 'Baixa', badgeClass: 'bg-slate-100 text-slate-700 border-slate-300' },
  normal: { label: 'Normal', badgeClass: 'bg-blue-100 text-blue-800 border-blue-300' },
  alta: { label: 'Alta', badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 font-semibold' },
  urgente: {
    label: 'Urgente',
    badgeClass: 'bg-rose-100 text-rose-900 border-rose-300 font-bold animate-pulse',
  },
}

export const chamadosService = {
  async getSetores() {
    return pb.collection('rh_departments').getFullList({
      sort: 'name',
    })
  },

  async getProfissionaisPorSetor(departmentId?: string) {
    let filter = "status = 'active'"
    if (departmentId) {
      filter += ` && department = '${departmentId}'`
    }
    const employees = await pb.collection('rh_employees').getFullList({
      filter,
      sort: 'name',
    })
    return employees
  },

  async getUsuariosAtivos() {
    return pb.collection('users').getFullList({
      sort: 'name',
    })
  },

  async criarChamado(payload: NovoChamadoPayload): Promise<Chamado> {
    const authUser = pb.authStore.record
    if (!authUser) throw new Error('Usuário não autenticado.')

    const formData = new FormData()
    formData.append('assunto', payload.assunto.trim())
    formData.append('descricao', payload.descricao.trim())
    formData.append('setor_responsavel', payload.setor_responsavel)
    if (payload.profissional_responsavel) {
      formData.append('profissional_responsavel', payload.profissional_responsavel)
    }
    formData.append('solicitante', authUser.id)
    formData.append('prioridade', payload.prioridade)
    formData.append('status', 'novo')

    if (payload.convidados_email && payload.convidados_email.length > 0) {
      formData.append('convidados_email', JSON.stringify(payload.convidados_email))
    }

    if (payload.anexos && payload.anexos.length > 0) {
      payload.anexos.forEach((file) => {
        formData.append('anexos', file)
      })
    }

    const created = await pb.collection('chamados').create<Chamado>(formData, {
      expand: 'setor_responsavel,solicitante,profissional_responsavel,aprovador',
    })

    return created
  },

  async listarMeusChamados(options?: {
    filter?: string
    sort?: string
    page?: number
    perPage?: number
  }) {
    const authUser = pb.authStore.record
    if (!authUser) return { items: [], totalItems: 0, totalPages: 1 }

    const sort = options?.sort || '-created'
    const page = options?.page || 1
    const perPage = options?.perPage || 30

    // O PocketBase já aplica viewRule/listRule de segurança no backend
    return pb.collection('chamados').getList<Chamado>(page, perPage, {
      filter: options?.filter,
      sort,
      expand: 'setor_responsavel,solicitante,profissional_responsavel,aprovador',
    })
  },

  async obterChamado(id: string): Promise<Chamado> {
    return pb.collection('chamados').getOne<Chamado>(id, {
      expand: 'setor_responsavel,solicitante,profissional_responsavel,aprovador,participantes',
    })
  },

  async listarHistorico(chamadoId: string): Promise<ChamadoHistorico[]> {
    return pb.collection('chamados_historico').getFullList<ChamadoHistorico>({
      filter: `chamado = '${chamadoId}'`,
      sort: '-created',
      expand: 'usuario',
    })
  },

  async listarComunicacao(chamadoId: string): Promise<ChamadoComunicacao[]> {
    return pb.collection('chamados_comunicacao').getFullList<ChamadoComunicacao>({
      filter: `chamado = '${chamadoId}'`,
      sort: 'created',
      expand: 'usuario',
    })
  },

  async enviarMensagem(
    chamadoId: string,
    mensagem: string,
    anexos?: File[],
    videoUniversidadeUrl?: string,
    videoUniversidadeTitulo?: string,
  ): Promise<ChamadoComunicacao> {
    const authUser = pb.authStore.record
    if (!authUser) throw new Error('Usuário não autenticado.')

    const formData = new FormData()
    formData.append('chamado', chamadoId)
    formData.append('usuario', authUser.id)
    formData.append('mensagem', mensagem.trim())
    formData.append('criado_em', new Date().toISOString())
    if (videoUniversidadeUrl) {
      formData.append('video_universidade_url', videoUniversidadeUrl)
    }
    if (videoUniversidadeTitulo) {
      formData.append('video_universidade_titulo', videoUniversidadeTitulo)
    }
    if (anexos && anexos.length > 0) {
      anexos.forEach((file) => formData.append('anexos', file))
    }

    return pb.collection('chamados_comunicacao').create<ChamadoComunicacao>(formData, {
      expand: 'usuario',
    })
  },

  async alterarStatus(payload: AlterarStatusPayload): Promise<Chamado> {
    const authUser = pb.authStore.record
    if (!authUser) throw new Error('Usuário não autenticado.')

    if (!payload.descricaoAcao || payload.descricaoAcao.trim().length < 3) {
      throw new Error('A descrição da ação é estritamente obrigatória (mínimo de 3 caracteres).')
    }

    if (payload.statusNovo === 'cancelado') {
      if (!payload.canceladoJustificativa || payload.canceladoJustificativa.trim().length < 5) {
        throw new Error('É obrigatório informar uma justificativa detalhada para o cancelamento.')
      }
    }

    // 1. Atualizar chamado
    const updateBody: Record<string, any> = {
      status: payload.statusNovo,
    }
    if (payload.canceladoJustificativa) {
      updateBody.cancelado_justificativa = payload.canceladoJustificativa
    }
    if (payload.statusNovo === 'aprovacao') {
      // Se encaminhado para aprovação e não havia aprovador, o próprio solicitante é o aprovador padrão
      // ou permanece o já cadastrado
    }

    const updated = await pb.collection('chamados').update<Chamado>(payload.chamadoId, updateBody, {
      expand: 'setor_responsavel,solicitante,profissional_responsavel,aprovador,participantes',
    })

    // 2. Registrar no histórico com descrição obrigatória
    const histData = new FormData()
    histData.append('chamado', payload.chamadoId)
    histData.append('usuario', authUser.id)
    histData.append('status_anterior', payload.statusAnterior)
    histData.append('status_novo', payload.statusNovo)
    histData.append('descricao_acao', payload.descricaoAcao.trim())
    histData.append('criado_em', new Date().toISOString())

    if (payload.videoUniversidadeUrl) {
      histData.append('video_universidade_url', payload.videoUniversidadeUrl)
    }
    if (payload.videoUniversidadeTitulo) {
      histData.append('video_universidade_titulo', payload.videoUniversidadeTitulo)
    }
    if (payload.anexosAcao && payload.anexosAcao.length > 0) {
      payload.anexosAcao.forEach((file) => histData.append('anexos_acao', file))
    }

    await pb.collection('chamados_historico').create(histData)

    return updated
  },

  async getVideosUniversidadeAtivos() {
    try {
      return await pb.collection('jetro_universidade_videos').getFullList({
        filter: 'ativo = true',
        sort: 'ordem,titulo',
      })
    } catch (_) {
      return []
    }
  },

  getAttachmentUrl(
    record: { id: string; collectionId: string; collectionName: string },
    filename: string,
  ) {
    return pb.files.getURL(record, filename)
  },
}
