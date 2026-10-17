export type VitrineType =
  | 'banner_principal'
  | 'banner_interno'
  | 'campanha_promocional'
  | 'destaque_servico'
  | 'chamada_orcamento'
  | 'imagem_texto'
  | 'bloco_promocional'
  | 'aviso'
  | 'banner_full'
export type VitrineDisplayPage =
  | 'home_banner'
  | 'home_middle'
  | 'home_footer'
  | 'services_page'
  | 'institutional_page'
  | 'specific_page'
  | 'all_pages'
export type VitrineClickDestination =
  | 'service_page'
  | 'budget_form'
  | 'internal_page'
  | 'external_link'
  | 'whatsapp'
  | 'client_area'
export type VitrineStatus = 'rascunho' | 'agendada' | 'publicada' | 'inativa' | 'encerrada'

export interface VitrineItem {
  id: string
  name: string
  type: VitrineType
  title: string
  subtitle: string
  description: string
  image_desktop: string
  image_mobile: string
  image_alt: string
  button_text: string
  button_link: string
  text_color: string
  bg_color: string
  overlay_color: string
  opacity: number
  text_position: 'left' | 'center' | 'right'
  display_page: VitrineDisplayPage
  specific_page_url: string
  display_order: number
  start_date: string
  end_date: string
  active: boolean
  linked_services: string[]
  click_destination: VitrineClickDestination
  status: VitrineStatus
  has_publish_history: boolean
  created: string
  updated: string
}

export const VITRINE_TYPES = [
  { id: 'banner_principal', label: 'Banner Principal' },
  { id: 'banner_interno', label: 'Banner Interno' },
  { id: 'campanha_promocional', label: 'Campanha Promocional' },
  { id: 'destaque_servico', label: 'Destaque de Serviço' },
  { id: 'chamada_orcamento', label: 'Chamada para Orçamento' },
  { id: 'imagem_texto', label: 'Imagem com Texto' },
  { id: 'bloco_promocional', label: 'Bloco Promocional' },
  { id: 'aviso', label: 'Aviso ou Comunicado' },
] as const

export const VITRINE_DISPLAY_PAGES = [
  { id: 'home_banner', label: 'Banner principal da página inicial' },
  { id: 'home_middle', label: 'Meio da página' },
  { id: 'home_footer', label: 'Próximo ao rodapé' },
  { id: 'services_page', label: 'Página de serviços' },
  { id: 'institutional_page', label: 'Página institucional' },
  { id: 'specific_page', label: 'Página específica' },
  { id: 'all_pages', label: 'Todas as páginas' },
] as const

export const VITRINE_CLICK_DESTINATIONS = [
  { id: 'service_page', label: 'Página do serviço' },
  { id: 'budget_form', label: 'Formulário de orçamento' },
  { id: 'internal_page', label: 'Página interna do site' },
  { id: 'external_link', label: 'Link externo' },
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'client_area', label: 'Área do cliente' },
] as const

export const VITRINE_STATUSES = [
  { id: 'rascunho', label: 'Rascunho', color: 'bg-gray-100 text-gray-700' },
  { id: 'agendada', label: 'Agendada', color: 'bg-blue-100 text-blue-700' },
  { id: 'publicada', label: 'Publicada', color: 'bg-green-100 text-green-700' },
  { id: 'inativa', label: 'Inativa', color: 'bg-orange-100 text-orange-700' },
  { id: 'encerrada', label: 'Encerrada', color: 'bg-red-100 text-red-700' },
] as const

export const VITRINE_TEXT_POSITIONS = [
  { id: 'left', label: 'Esquerda' },
  { id: 'center', label: 'Centro' },
  { id: 'right', label: 'Direita' },
] as const
