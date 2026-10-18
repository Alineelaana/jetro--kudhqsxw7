import pb from '@/lib/pocketbase/client'

export interface JetroOnlineCitation {
  n: number
  chunk_id: string
  source_id: string
  distance?: number
  excerpt: string
}

export interface RecommendedVideo {
  id: string
  titulo: string
  youtube_url: string
  descricao: string
  modulo: string
}

export interface JetroOnlineMessage {
  id?: string
  role: 'user' | 'assistant'
  content: string
  citations?: JetroOnlineCitation[]
  recommended_videos?: RecommendedVideo[]
  created?: string
}

export interface JetroOnlineConversation {
  id: string
  title: string
  created: string
  updated: string
}

export interface JetroOnlineUserContext {
  role?: string
  departamento?: string
  perfil_acesso?: string
}

export interface JetroOnlineConfig {
  id: string
  chave: string
  titulo_assistente: string
  saudacao_principal: string
  texto_auxiliar: string
  mensagem_boas_vindas: string
  mensagem_indisponibilidade: string
  permitir_anexos: boolean
  permitir_voz: boolean
  botao_video_ativo: boolean
  botao_tour_ativo: boolean
  recomendar_universidade_auto: boolean
  max_recomendacoes_video: number
  placeholder_input: string
  tema_cor_primaria: string
  tema_cor_destaque: string
}

export interface JetroUniversidadeVideo {
  id: string
  titulo: string
  youtube_url: string
  youtube_id?: string
  descricao: string
  modulo: string
  assunto?: string
  palavras_chave?: string
  rota_relacionada?: string
  permissao_necessaria?: string
  ordem?: number
  ativo: boolean
  visualizacoes?: number
  recomendacoes_count?: number
  created?: string
  updated?: string
}

export interface JetroOnlineSugestao {
  id: string
  texto: string
  descricao?: string
  modulo?: string
  permissao_necessaria?: string
  ordem?: number
  ativo: boolean
  cliques_count?: number
}

export interface JetroTourStep {
  titulo: string
  texto: string
  seletor?: string
  posicao?: 'top' | 'bottom' | 'left' | 'right'
}

export interface JetroTour {
  id: string
  titulo: string
  descricao?: string
  rota: string
  modulo?: string
  etapas: JetroTourStep[]
  ativo: boolean
  ordem?: number
}

export interface JetroOnlinePergunta {
  id: string
  user_id: string
  user_name?: string
  user_role?: string
  pergunta: string
  resposta_resumo?: string
  modulo?: string
  rota_origem?: string
  status_resposta: 'sucesso' | 'sem_resposta' | 'erro' | 'acesso_restrito'
  conversation_id?: string
  video_recomendado_id?: string
  video_recomendado_titulo?: string
  avaliacao?: number
  created: string
  updated?: string
}

/**
 * Envia uma mensagem para o assistente Jetro On-line
 */
export async function sendJetroOnlineMessage(
  message: string,
  conversationId?: string,
  extra?: { modulo?: string; rota_origem?: string },
): Promise<{
  conversation_id: string
  content: string
  citations?: JetroOnlineCitation[]
  message_id: string
  recommended_videos?: RecommendedVideo[]
  user_context?: JetroOnlineUserContext
}> {
  return pb.send('/backend/v1/jetro-online/chat', {
    method: 'POST',
    body: JSON.stringify({
      message,
      conversation_id: conversationId || null,
      modulo: extra?.modulo,
      rota_origem: extra?.rota_origem,
    }),
    headers: { 'Content-Type': 'application/json' },
  })
}

/**
 * Lista as conversas do usuário atual com o Jetro On-line
 */
export async function getJetroOnlineConversations(): Promise<JetroOnlineConversation[]> {
  return pb.send('/backend/v1/jetro-online/conversations', { method: 'GET' })
}

/**
 * Obtém o histórico de mensagens de uma conversa com o Jetro On-line
 */
export async function getJetroOnlineMessages(
  conversationId: string,
): Promise<{ messages: JetroOnlineMessage[] }> {
  return pb.send(`/backend/v1/jetro-online/conversations/${conversationId}/messages`, {
    method: 'GET',
  })
}

/**
 * Serviços para Universidade Jetro, Configurações, Sugestões e Tours
 */
export async function getJetroOnlineConfig(): Promise<JetroOnlineConfig | null> {
  try {
    const list = await pb.collection('jetro_online_config').getList<JetroOnlineConfig>(1, 1, {
      filter: 'chave = "geral"',
    })
    return list.items[0] || null
  } catch {
    return null
  }
}

export async function updateJetroOnlineConfig(
  id: string,
  data: Partial<JetroOnlineConfig>,
): Promise<JetroOnlineConfig> {
  return pb.collection('jetro_online_config').update<JetroOnlineConfig>(id, data)
}

export async function getJetroUniversidadeVideos(
  filter?: string,
): Promise<JetroUniversidadeVideo[]> {
  try {
    const records = await pb
      .collection('jetro_universidade_videos')
      .getFullList<JetroUniversidadeVideo>({
        sort: 'ordem,titulo',
        filter: filter || '',
      })
    return records
  } catch {
    return []
  }
}

export async function incrementVideoViews(videoId: string): Promise<void> {
  try {
    const record = await pb
      .collection('jetro_universidade_videos')
      .getOne<JetroUniversidadeVideo>(videoId)
    await pb.collection('jetro_universidade_videos').update(videoId, {
      visualizacoes: (record.visualizacoes || 0) + 1,
    })
  } catch {
    /* ignore */
  }
}

export async function getJetroOnlineSugestoes(): Promise<JetroOnlineSugestao[]> {
  try {
    const records = await pb.collection('jetro_online_sugestoes').getFullList<JetroOnlineSugestao>({
      sort: 'ordem',
      filter: 'ativo = true',
    })
    return records
  } catch {
    return []
  }
}

export async function incrementSugestaoClicks(sugestaoId: string): Promise<void> {
  try {
    const record = await pb
      .collection('jetro_online_sugestoes')
      .getOne<JetroOnlineSugestao>(sugestaoId)
    await pb.collection('jetro_online_sugestoes').update(sugestaoId, {
      cliques_count: (record.cliques_count || 0) + 1,
    })
  } catch {
    /* ignore */
  }
}

export async function getJetroTourForRoute(pathname: string): Promise<JetroTour | null> {
  try {
    const list = await pb.collection('jetro_tours').getList<JetroTour>(1, 1, {
      filter: `ativo = true && (rota = "${pathname}" || rota = "${pathname.replace(/\/$/, '')}")`,
      sort: 'ordem',
    })
    return list.items[0] || null
  } catch {
    return null
  }
}
