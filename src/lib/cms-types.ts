export type CmsStatus = 'draft' | 'pending' | 'published' | 'archived'

export interface CmsContent {
  id: string
  section_key: string
  draft_data: Record<string, unknown>
  published_data: Record<string, unknown>
  status: CmsStatus
  updated_by: string
  created: string
  updated: string
}

export interface CmsVersion {
  id: string
  section_key: string
  version_data: Record<string, unknown>
  version_number: number
  published_by: string
  published_at: string
  label: string
  created: string
}

export interface CmsHistoryEntry {
  id: string
  section_key: string
  field_name: string
  old_value: string
  new_value: string
  changed_by: string
  action: string
  created: string
}

export interface CmsMedia {
  id: string
  name: string
  file: string
  type: string
  dimensions: string
  size: number
  alt_text: string
  caption: string
  folder: string
  usage_locations: Record<string, unknown>
  uploaded_by: string
  created: string
}

export interface CmsPublication {
  id: string
  status: CmsStatus
  last_published_at: string
  last_published_by: string
  pending_changes: number
  scheduled_at: string
  created: string
  updated: string
}

export const CMS_PERMISSION_PROFILES = [
  { id: 'SUP', label: 'Administrador (SUP) — Gestão', access: true },
  { id: 'ADMIN', label: 'Administrador', access: false },
  { id: 'MARKETING', label: 'Marketing', access: false },
  { id: 'EDITOR', label: 'Editor', access: false },
  { id: 'REVISOR', label: 'Revisor', access: false },
  { id: 'READONLY', label: 'Usuário somente leitura', access: false },
]

export const SECTION_TEMPLATES = [
  'Texto e imagem',
  'Imagem e texto',
  'Banner',
  'Cards',
  'Lista de serviços',
  'Benefícios',
  'Números e indicadores',
  'Depoimentos',
  'Perguntas frequentes',
  'Chamada para ação',
  'Formulário',
  'Galeria',
  'Vídeo',
  'Logos de parceiros',
  'Mapa',
  'Texto simples',
  'Espaçamento',
  'Linha divisória',
]

export const LINK_TYPES = [
  'Página interna',
  'URL externa',
  'WhatsApp',
  'E-mail',
  'Telefone',
  'Download de arquivo',
  'Âncora dentro da página',
  'Login',
  'Formulário',
]

export const DEVICE_TABS = [
  { id: 'desktop', label: 'Desktop' },
  { id: 'tablet', label: 'Tablet' },
  { id: 'mobile', label: 'Celular' },
] as const
