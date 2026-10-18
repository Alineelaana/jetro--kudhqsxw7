export type ThemePreference = 'light' | 'dark' | 'auto'

export type TextSizePreference = 'compact' | 'normal' | 'large' // compact = 90%, normal = 100%, large = 112%

export type SpacingDensityPreference = 'compact' | 'comfortable' | 'spacious'

export type TableDensityPreference = 'compact' | 'comfortable' | 'spacious'

export interface UserPreferences {
  // APARÊNCIA & TEMA
  theme: ThemePreference
  highContrast: boolean

  // LAYOUT
  animationsEnabled: boolean
  fixHeader: boolean
  fixFooter: boolean
  sidebarExpanded: boolean // padrão recolhido (false) para novos usuários
  sidebarWidth: 'compact' | 'normal' // compacta vs normal
  sidebarShowText: boolean // se exibe texto além de ícones no menu expandido
  spacingDensity: SpacingDensityPreference

  // TAMANHO DOS TEXTOS
  textSize: TextSizePreference
  textScaleStep: number // -2, -1, 0, 1, 2 (para controle -/↻/+)

  // PREFERÊNCIAS GLOBAIS DE TABELAS
  tableRowsPerPage: 10 | 25 | 50 | 100
  tableStripedRows: boolean // linhas alternadas (zebra)
  tableStickyHeader: boolean // fixar cabeçalho
  tableDividers: boolean // linhas divisórias
  tableDensity: TableDensityPreference

  // ACESSIBILIDADE
  reducedMotion: boolean // força sem movimento
  focusHighlight: boolean // destaque de foco para navegação por teclado
  largeTouchTargets: boolean // tamanho ampliado de elementos interativos (botões, inputs)

  // JETRO ON-LINE
  jetroOnlineSuggestions: boolean // exibir/ocultar sugestões inteligentes no chat
  jetroOnlineTypingEffect: boolean // efeitos de digitação on/off
  jetroOnlineResponseMode: 'compact' | 'detailed' // respostas compacto/detalhado
  jetroOnlineVisualNotifications: boolean // notificações visuais do assistente (ping/badge)

  // PREFERÊNCIAS DE PERFIL / LOCALIZAÇÃO
  timezone?: string
  fuso_horario?: string
  tratamento?: 'masculino' | 'feminino' | 'neutro'
}

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  theme: 'light',
  highContrast: false,

  animationsEnabled: true,
  fixHeader: true,
  fixFooter: true,
  sidebarExpanded: false, // padrão recolhido para novos usuários
  sidebarWidth: 'normal',
  sidebarShowText: true,
  spacingDensity: 'comfortable',

  textSize: 'normal',
  textScaleStep: 0,

  tableRowsPerPage: 25,
  tableStripedRows: true,
  tableStickyHeader: true,
  tableDividers: true,
  tableDensity: 'comfortable',

  reducedMotion: false,
  focusHighlight: false,
  largeTouchTargets: false,

  jetroOnlineSuggestions: true,
  jetroOnlineTypingEffect: true,
  jetroOnlineResponseMode: 'detailed',
  jetroOnlineVisualNotifications: true,
  timezone: 'America/Sao_Paulo',
  fuso_horario: 'America/Sao_Paulo',
  tratamento: 'neutro',
}
