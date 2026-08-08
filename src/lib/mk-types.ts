export interface MkMaterial {
  id: string
  name: string
  type: string
  category: string
  brand: string
  product: string
  campaign_id: string
  action_id: string
  year: string
  description: string
  status: string
  responsible_id: string
  responsible_name: string
  supplier: string
  created: string
  updated: string
}

export interface MkRoiCalculation {
  id: string
  campaign_id: string
  action_id: string
  investment: string
  cost: string
  related_sales: string
  incremental_margin: string
  result: string
  roi: string
  attribution_method: 'venda_vinculada' | 'cliente_participante' | 'produto_periodo_regiao'
  evidence: Record<string, unknown>
  period: string
  supplier: string
  created: string
  updated: string
}

export interface MkAccountability {
  id: string
  action_id: string
  campaign_id: string
  verba_id: string
  objective: string
  mechanic: string
  investment: string
  roi: string
  status: string
  supplier: string
  responsible_name: string
  created: string
  updated: string
}

export const ATTRIBUTION_METHODS = [
  { value: 'venda_vinculada', label: 'Venda Vinculada', level: 'Causalidade Forte' },
  { value: 'cliente_participante', label: 'Cliente Participante', level: 'Correlação Controlada' },
  {
    value: 'produto_periodo_regiao',
    label: 'Produto / Período / Região',
    level: 'Correlação Fraca',
  },
] as const

export const MATERIAL_VERSION_STATUS = [
  { value: 'Rascunho', label: 'Rascunho' },
  { value: 'Em Aprovação', label: 'Em Aprovação' },
  { value: 'Aprovado', label: 'Aprovado' },
  { value: 'Reprovado', label: 'Reprovado' },
  { value: 'Obsoleto', label: 'Obsoleto' },
] as const

export const BUDGET_LINE_TYPES = [
  { value: 'forecast', label: 'Previsto' },
  { value: 'approved', label: 'Aprovado' },
  { value: 'committed', label: 'Comprometido' },
  { value: 'realized', label: 'Realizado' },
] as const

export const SOCIAL_CHANNELS = [
  { value: 'Instagram', label: 'Instagram' },
  { value: 'Facebook', label: 'Facebook' },
  { value: 'LinkedIn', label: 'LinkedIn' },
  { value: 'YouTube', label: 'YouTube' },
  { value: 'TikTok', label: 'TikTok' },
  { value: 'Outros', label: 'Outros' },
] as const
