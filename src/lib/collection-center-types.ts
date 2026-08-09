export const AGING_BUCKETS = [
  { key: 'vencido_hoje', label: 'Vencido hoje', min: 0, max: 0 },
  { key: '1_7', label: '1-7 dias', min: 1, max: 7 },
  { key: '8_15', label: '8-15 dias', min: 8, max: 15 },
  { key: '16_30', label: '16-30 dias', min: 16, max: 30 },
  { key: '31_60', label: '31-60 dias', min: 31, max: 60 },
  { key: '61_90', label: '61-90 dias', min: 61, max: 90 },
  { key: '90_plus', label: 'Acima de 90', min: 91, max: 999999 },
] as const

export const RISK_CLASSIFICATIONS = [
  { key: 'baixo', label: 'Baixo', emoji: '🟢', className: 'bg-green-100 text-green-700' },
  { key: 'medio', label: 'Médio', emoji: '🟡', className: 'bg-yellow-100 text-yellow-700' },
  { key: 'alto', label: 'Alto', emoji: '🟠', className: 'bg-orange-100 text-orange-700' },
  { key: 'critico', label: 'Crítico', emoji: '🔴', className: 'bg-red-100 text-red-700' },
] as const

export const CONTACT_CHANNELS = [
  'Telefone',
  'WhatsApp',
  'E-mail',
  'Presencial',
  'Vendedor',
  'Outro',
] as const
export const CONTACT_RESULTS = [
  'Não atendeu',
  'Contato realizado',
  'Solicitar retorno',
  'Pagamento confirmado',
  'Promessa realizada',
  'Divergência informada',
  'Negociação solicitada',
  'Encaminhado ao vendedor',
  'Encaminhado ao gerente',
  'Sem sucesso',
] as const
export const PROMISE_STATUSES = [
  'Pendente',
  'Cumprida',
  'Parcialmente cumprida',
  'Quebrada',
  'Cancelada',
] as const
export const DISPUTE_REASONS = [
  'Mercadoria não entregue',
  'Divergência de preço',
  'Devolução',
  'NF incorreta',
  'Crédito pendente',
  'Bonificação',
  'Problema logístico',
  'Outro',
] as const
export const DISPUTE_STATUSES = ['Aberta', 'Em análise', 'Resolvida', 'Cancelada'] as const
export const NEXT_ACTION_TYPES = [
  'Ligar',
  'WhatsApp',
  'Enviar boleto',
  'Falar com vendedor',
  'Revisar disputa',
  'Cobrar promessa',
  'Encaminhar gerente',
  'Jurídico',
] as const
export const PRIORITIES = ['Baixa', 'Média', 'Alta', 'Urgente'] as const
export const PAYMENT_METHODS = ['Boleto', 'PIX', 'Transferência', 'Dinheiro', 'Cartão'] as const

export const SORT_OPTIONS = [
  { key: 'maior_valor', label: 'Maior valor' },
  { key: 'maior_atraso', label: 'Maior atraso' },
  { key: 'promessa_quebrada', label: 'Promessa quebrada' },
  { key: 'maior_risco', label: 'Maior risco' },
  { key: 'prioridade', label: 'Prioridade' },
  { key: 'mais_antigo_sem_contato', label: 'Mais antigo sem contato' },
  { key: 'proxima_acao', label: 'Próxima ação' },
  { key: 'vendedor', label: 'Vendedor' },
  { key: 'gerente', label: 'Gerente' },
] as const

export const QUICK_ACTIONS = [
  { key: 'contact', label: 'Registrar Contato' },
  { key: 'promise', label: 'Registrar Promessa' },
  { key: 'negotiate', label: 'Negociar' },
  { key: 'send', label: 'Enviar Cobrança' },
  { key: 'whatsapp', label: 'WhatsApp' },
  { key: 'email', label: 'E-mail' },
  { key: 'second_copy', label: 'Segunda Via' },
  { key: 'copy_pix', label: 'Copiar PIX' },
  { key: 'dispute', label: 'Abrir Disputa' },
  { key: 'task', label: 'Criar Tarefa' },
  { key: 'escalate', label: 'Escalar' },
  { key: 'history', label: 'Ver Histórico' },
] as const

export interface QueueItem {
  cliente: string
  clientId: string
  valorVencido: number
  diasAtraso: number
  quantidadeTitulos: number
  risco: string
  prioridade: string
  ultimoContato: string
  proximaAcao: string
  promessaExistente: string
  receivables: any[]
  collectionRecord: any | null
  vendedor: string
  gerente: string
  cidade: string
  uf: string
  regiao: string
  supervisor: string
  cnpj_cpf: string
  cobrador: string
  networkId: string
  networkName: string
  networkOverdueTotal: number
  networkRestrictedCount: number
  networkRegularCount: number
  networkRestrictionStatus: string
  networkRestrictionOriginName: string
  networkRestrictionOriginCnpj: string
  networkRestrictionOriginAmount: string
  networkRestrictionOriginDays: string
}

export interface FilterOptions {
  vendedores: string[]
  gerentes: string[]
  supervisores: string[]
  cidades: string[]
  regioes: string[]
  ufs: string[]
  cobradores: string[]
  statuses: string[]
  redes: { value: string; label: string }[]
}

export interface AlcadaProfile {
  percent: number
  valor: number
}

export interface AlcadasConfig {
  cobrador: AlcadaProfile
  supervisor: AlcadaProfile
  gerente: AlcadaProfile
}

export interface PriorizacaoRule {
  key: string
  label: string
  weight: number
  order: number
}

export interface PriorizacaoConfig {
  rules: PriorizacaoRule[]
}

export interface ExecutiveStats {
  totalVencido: number
  clientesInadimplentes: number
  quantidadeTitulos: number
  vencidoHoje: number
  faixa17: number
  faixa815: number
  faixa1630: number
  faixa3160: number
  faixa6190: number
  faixa90Plus: number
  promessasHoje: number
  promessasQuebradas: number
  recuperadoHoje: number
  recuperadoMes: number
}

export function computeSaldo(r: any): number {
  return parseFloat(r.valor_original || '0') - parseFloat(r.valor_recebido || '0')
}

export function computeAgingDays(dueDate: string): number {
  if (!dueDate) return 0
  const diff = Math.floor((Date.now() - new Date(dueDate).getTime()) / 86400000)
  return diff > 0 ? diff : 0
}

export function computeTotalAtualizado(r: any): number {
  const orig = parseFloat(r.valor_original || '0')
  const juros = parseFloat(r.juros || '0')
  const multa = parseFloat(r.multa || '0')
  const desc = parseFloat(r.desconto || '0')
  const recv = parseFloat(r.valor_recebido || '0')
  return orig + juros + multa - desc - recv
}

export function getAgingBucket(days: number): string {
  if (days === 0) return 'vencido_hoje'
  if (days <= 7) return '1_7'
  if (days <= 15) return '8_15'
  if (days <= 30) return '16_30'
  if (days <= 60) return '31_60'
  if (days <= 90) return '61_90'
  return '90_plus'
}

export function computeRisk(dias: number, valor: number): string {
  if (dias > 60 || valor > 50000) return 'critico'
  if (dias > 30 || valor > 20000) return 'alto'
  if (dias > 15 || valor > 5000) return 'medio'
  return 'baixo'
}

export function computePriority(dias: number, valor: number): string {
  if (dias > 60 || valor > 50000) return 'Urgente'
  if (dias > 30 || valor > 20000) return 'Alta'
  if (dias > 15 || valor > 5000) return 'Média'
  return 'Baixa'
}

export function formatCurrency(v: number): string {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function riskOrder(risco: string): number {
  const order: Record<string, number> = { critico: 4, alto: 3, medio: 2, baixo: 1 }
  return order[risco] || 0
}

export function priorityOrder(p: string): number {
  const order: Record<string, number> = { Urgente: 4, Alta: 3, Média: 2, Baixa: 1 }
  return order[p] || 0
}
