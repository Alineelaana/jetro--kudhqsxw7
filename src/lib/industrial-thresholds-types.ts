export interface IndustrialThreshold {
  id: string
  key: string
  label: string
  value: string
  unit: string
  description: string
  category: 'quality' | 'capacity' | 'cost' | 'stock' | 'production' | 'planning'
  active: boolean
  created: string
  updated: string
}

export type ThresholdCategory = IndustrialThreshold['category']

export const CATEGORY_LABELS: Record<ThresholdCategory, string> = {
  quality: 'Qualidade',
  capacity: 'Capacidade',
  cost: 'Custos',
  stock: 'Estoque',
  production: 'Produção',
  planning: 'Planejamento',
}

export const CATEGORY_COLORS: Record<ThresholdCategory, string> = {
  quality: 'bg-purple-100 text-purple-700',
  capacity: 'bg-blue-100 text-blue-700',
  cost: 'bg-emerald-100 text-emerald-700',
  stock: 'bg-amber-100 text-amber-700',
  production: 'bg-cyan-100 text-cyan-700',
  planning: 'bg-orange-100 text-orange-700',
}
