export const MK_REQUEST_TYPES = [
  { value: 'campanha', label: 'Campanha' },
  { value: 'arte', label: 'Arte' },
  { value: 'material', label: 'Material' },
  { value: 'evento', label: 'Evento' },
  { value: 'midia', label: 'Mídia' },
  { value: 'comunicacao', label: 'Comunicação' },
  { value: 'conteudo', label: 'Conteúdo' },
  { value: 'landing_page', label: 'Landing Page' },
  { value: 'acao_promocional', label: 'Ação Promocional' },
  { value: 'apoio_comercial', label: 'Apoio Comercial' },
  { value: 'acao_interna', label: 'Ação Interna' },
  { value: 'acao_marca', label: 'Ação de Marca' },
] as const

export const MK_REQUEST_STATUS = [
  { value: 'rascunho', label: 'Rascunho' },
  { value: 'em_analise', label: 'Em Análise' },
  { value: 'briefing', label: 'Briefing' },
  { value: 'planejamento', label: 'Planejamento' },
  { value: 'aprovacao', label: 'Aprovação' },
  { value: 'producao', label: 'Produção' },
  { value: 'execucao', label: 'Execução' },
  { value: 'resultado', label: 'Resultado' },
  { value: 'encerrado', label: 'Encerrado' },
  { value: 'cancelado', label: 'Cancelado' },
] as const

export const MK_JOB_TYPES = [
  { value: 'arte', label: 'Criação de Arte' },
  { value: 'video', label: 'Vídeo' },
  { value: 'fotografia', label: 'Fotografia' },
  { value: 'landing_page', label: 'Landing Page' },
  { value: 'email', label: 'E-mail' },
  { value: 'midia', label: 'Mídia' },
  { value: 'impressao', label: 'Impressão' },
  { value: 'evento', label: 'Evento' },
  { value: 'material_pdv', label: 'Material de PDV' },
  { value: 'conteudo_social', label: 'Conteúdo Social' },
] as const

export const MK_JOB_STATUS = [
  { value: 'briefing', label: 'Briefing' },
  { value: 'producao', label: 'Produção' },
  { value: 'revisao', label: 'Revisão' },
  { value: 'aprovacao', label: 'Aprovação' },
  { value: 'programacao', label: 'Programação' },
  { value: 'publicacao', label: 'Publicação' },
  { value: 'resultado', label: 'Resultado' },
  { value: 'encerrado', label: 'Encerrado' },
  { value: 'cancelado', label: 'Cancelado' },
] as const

export const MK_PIECE_TYPES = [
  { value: 'post', label: 'Post' },
  { value: 'video', label: 'Vídeo' },
  { value: 'banner', label: 'Banner' },
  { value: 'anuncio', label: 'Anúncio' },
  { value: 'email', label: 'E-mail' },
  { value: 'apresentacao', label: 'Apresentação' },
  { value: 'folder', label: 'Folder' },
  { value: 'catalogo', label: 'Catálogo' },
  { value: 'landing_page', label: 'Landing Page' },
  { value: 'material_pdv', label: 'Material de PDV' },
] as const

export const MK_PIECE_STATUS = [
  { value: 'criacao', label: 'Criação' },
  { value: 'revisao_marketing', label: 'Revisão Marketing' },
  { value: 'compliance', label: 'Compliance/Jurídico' },
  { value: 'gestor', label: 'Gestor' },
  { value: 'aprovado', label: 'Aprovado' },
  { value: 'publicado', label: 'Publicado' },
  { value: 'reprovado', label: 'Reprovado' },
] as const

export const MK_MEDIA_CHANNELS = [
  { value: 'google', label: 'Google Ads' },
  { value: 'meta', label: 'Meta (Facebook/Instagram)' },
  { value: 'linkedin', label: 'LinkedIn Ads' },
  { value: 'tiktok', label: 'TikTok Ads' },
  { value: 'youtube', label: 'YouTube Ads' },
  { value: 'outros', label: 'Outros' },
] as const

export const MK_BRAND_CATEGORIES = [
  { value: 'logo', label: 'Logo' },
  { value: 'manual', label: 'Manual de Marca' },
  { value: 'guideline', label: 'Guidelines' },
  { value: 'cor', label: 'Paleta de Cores' },
  { value: 'template', label: 'Template' },
  { value: 'apresentacao', label: 'Apresentação' },
  { value: 'foto', label: 'Foto' },
  { value: 'video', label: 'Vídeo' },
  { value: 'catalogo', label: 'Catálogo' },
  { value: 'arte_anterior', label: 'Arte Anterior' },
] as const

export const MK_SUPPLIER_CATEGORIES = [
  'agencia',
  'grafica',
  'audiovisual',
  'midia',
  'eventos',
  'brindes',
  'producao',
] as const

export const MK_DEFAULT_CHECKLIST = [
  'Briefing aprovado',
  'Orçamento aprovado',
  'Arte aprovada',
  'Fornecedor contratado',
  'Material produzido',
  'Campanha programada',
  'Links testados',
  'Evidências registradas',
] as const

export const MK_STATUS_COLORS: Record<string, string> = {
  rascunho: 'bg-gray-100 text-gray-700',
  em_analise: 'bg-blue-100 text-blue-700',
  briefing: 'bg-cyan-100 text-cyan-700',
  planejamento: 'bg-purple-100 text-purple-700',
  aprovacao: 'bg-amber-100 text-amber-700',
  producao: 'bg-indigo-100 text-indigo-700',
  execucao: 'bg-orange-100 text-orange-700',
  resultado: 'bg-teal-100 text-teal-700',
  encerrado: 'bg-green-100 text-green-700',
  cancelado: 'bg-red-100 text-red-700',
  criacao: 'bg-gray-100 text-gray-700',
  revisao_marketing: 'bg-blue-100 text-blue-700',
  compliance: 'bg-amber-100 text-amber-700',
  gestor: 'bg-purple-100 text-purple-700',
  aprovado: 'bg-green-100 text-green-700',
  publicado: 'bg-emerald-100 text-emerald-700',
  reprovado: 'bg-red-100 text-red-700',
}

export interface MkRequest {
  id: string
  request_number: string
  title: string
  type: string
  requester: string
  requester_id: string
  area: string
  company: string
  branch: string
  objective: string
  briefing: string
  priority: string
  deadline: string
  budget: string
  audience: string
  channel: string
  responsible_id: string
  responsible_name: string
  status: string
  campaign_id: string
  job_id: string
  created: string
  updated: string
}

export interface MkJob {
  id: string
  job_number: string
  title: string
  campaign_id: string
  request_id: string
  type: string
  description: string
  responsible_name: string
  deadline: string
  priority: string
  status: string
  version: number
  cost: string
  created: string
  updated: string
}

export interface MkContentPiece {
  id: string
  title: string
  job_id: string
  campaign_id: string
  type: string
  status: string
  current_version: number
  channel: string
  responsible_name: string
  needs_compliance: boolean
  approver_name: string
  approved_at: string
  published_at: string
  rejection_reason: string
  description: string
  created: string
  updated: string
}

export interface MkMediaCampaign {
  id: string
  name: string
  campaign_id: string
  channel: string
  type: string
  budget: string
  investment: string
  start_date: string
  end_date: string
  agency: string
  objective: string
  impressions: number
  clicks: number
  leads: number
  conversions: number
  cost: string
  roi: string
  created: string
}

export interface MkBrandAsset {
  id: string
  name: string
  brand: string
  category: string
  version: string
  validity: string
  responsible_name: string
  tags: string[]
  file_url: string
  description: string
  active: boolean
  created: string
}

export interface MkResultAttribution {
  id: string
  campaign_id: string
  campaign_name: string
  source: string
  channel: string
  lead_id: string
  lead_name: string
  order_number: string
  revenue: string
  attribution_method: string
  period: string
  created: string
}

export interface MkBriefingTemplate {
  id: string
  name: string
  type: string
  objective: string
  audience: string
  message: string
  product: string
  brand: string
  campaign: string
  channel: string
  region: string
  period: string
  budget: string
  deliverables: string[]
  references: string[]
  restrictions: string
  approvers: string[]
  active: boolean
  created: string
  updated: string
}
