export const CALC_TYPES = [
  { value: 'percent', label: 'Percentual' },
  { value: 'fixed', label: 'Valor Fixo' },
  { value: 'per_unit', label: 'Valor por Unidade' },
  { value: 'progressive', label: 'Faixa Progressiva' },
  { value: 'regressive', label: 'Faixa Regressiva' },
  { value: 'min_commission', label: 'Comissão Mínima' },
  { value: 'max_commission', label: 'Comissão Máxima' },
  { value: 'bonus', label: 'Bônus' },
  { value: 'award', label: 'Premiação' },
  { value: 'campaign_temp', label: 'Campanha Temporária' },
  { value: 'cashback', label: 'Cashback' },
  { value: 'special_incentive', label: 'Incentivo Especial' },
  { value: 'margin_based', label: 'Comissão sobre Margem' },
  { value: 'profit_based', label: 'Comissão sobre Lucro' },
  { value: 'net_sale_based', label: 'Comissão sobre Venda Líquida' },
  { value: 'gross_sale_based', label: 'Comissão sobre Venda Bruta' },
  { value: 'positivation', label: 'Comissão por Positivação' },
  { value: 'mix', label: 'Comissão por Mix' },
  { value: 'strategic_product', label: 'Produto Estratégico' },
  { value: 'industry', label: 'Comissão por Indústria' },
  { value: 'campaign', label: 'Comissão por Campanha' },
  { value: 'goal_based', label: 'Comissão por Meta' },
] as const

export const GOAL_TYPES = [
  { value: 'faturamento', label: 'Faturamento' },
  { value: 'venda_liquida', label: 'Venda Líquida' },
  { value: 'margem', label: 'Margem' },
  { value: 'positivacao', label: 'Positivação' },
  { value: 'mix', label: 'Mix' },
  { value: 'quantidade', label: 'Quantidade' },
  { value: 'ticket_medio', label: 'Ticket Médio' },
  { value: 'industria_foco', label: 'Indústria Foco' },
  { value: 'marca_foco', label: 'Marca Foco' },
  { value: 'produto_foco', label: 'Produto Foco' },
  { value: 'categoria_foco', label: 'Categoria Foco' },
  { value: 'novos_clientes', label: 'Novos Clientes' },
  { value: 'reativacao', label: 'Reativação de Clientes' },
  { value: 'crescimento', label: 'Crescimento Percentual' },
  { value: 'composta', label: 'Meta Composta' },
] as const

export const AWARD_TYPES = [
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'pix', label: 'PIX' },
  { value: 'vale_presente', label: 'Vale-Presente' },
  { value: 'produto', label: 'Produto' },
  { value: 'viagem', label: 'Viagem' },
  { value: 'premio_fisico', label: 'Prêmio Físico' },
  { value: 'bonus', label: 'Bônus' },
  { value: 'cashback', label: 'Cashback' },
  { value: 'comissao_adicional', label: 'Comissão Adicional' },
  { value: 'folga', label: 'Folga' },
  { value: 'pontuacao', label: 'Pontuação' },
  { value: 'outro', label: 'Outro' },
] as const

export const APURATION_STATUS = [
  'apurada',
  'aprovada',
  'paga',
  'pendente',
  'bloqueada',
  'cancelada',
  'contestada',
] as const

export const CAMPAIGN_STATUS = ['rascunho', 'ativa', 'encerrada', 'cancelada'] as const
export const GOAL_STATUS = ['rascunho', 'ativa', 'encerrada', 'concluida', 'cancelada'] as const
export const CONTEST_REASONS = [
  'pedido_nao_entrou',
  'cliente_devolveu',
  'valor_incorreto',
  'meta_nao_considerada',
  'produto_estrategico_nao_contabilizado',
  'outro',
] as const

export const VR_TABS = [
  { id: 'dashboard', label: 'Dashboard Executivo' },
  { id: 'rules', label: 'Regras de Comissão' },
  { id: 'apuration', label: 'Apuração' },
  { id: 'simulator', label: 'Simulador' },
  { id: 'approvals', label: 'Aprovações' },
  { id: 'history', label: 'Histórico' },
  { id: 'contests', label: 'Contestação' },
  { id: 'campaigns', label: 'Campanhas' },
  { id: 'ranking', label: 'Ranking' },
  { id: 'goals', label: 'Metas & Premiações' },
] as const

export interface VRFieldDef {
  name: string
  label: string
  type: 'text' | 'number' | 'date' | 'select' | 'textarea'
  required?: boolean
  options?: readonly string[]
  span?: 1 | 2
}

export function parseNum(v: string | undefined | null): number {
  if (!v) return 0
  const n = parseFloat(String(v).replace(',', '.'))
  return isNaN(n) ? 0 : n
}

export function formatCurrency(v: string | number): string {
  const n = typeof v === 'number' ? v : parseNum(v)
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function getGoalStatusVisual(
  target: number,
  realized: number,
  daysRemaining: number,
  totalDays: number,
): { color: string; label: string; icon: string } {
  const pct = target > 0 ? (realized / target) * 100 : 0
  const timePct = totalDays > 0 ? ((totalDays - daysRemaining) / totalDays) * 100 : 100
  if (pct >= 100) return { color: 'text-emerald-600', label: 'Meta superada', icon: '🏆' }
  if (pct >= timePct) return { color: 'text-emerald-600', label: 'Acima da projeção', icon: '🟢' }
  if (pct >= timePct * 0.7)
    return { color: 'text-amber-600', label: 'Dentro da projeção', icon: '🟡' }
  return { color: 'text-red-600', label: 'Abaixo da projeção', icon: '🔴' }
}

export function calcProjection(
  realized: number,
  daysElapsed: number,
  daysRemaining: number,
): { dailyAvg: number; projected: number; probablePct: number } {
  const dailyAvg = daysElapsed > 0 ? realized / daysElapsed : 0
  const projected = realized + dailyAvg * daysRemaining
  return { dailyAvg, projected, probablePct: 0 }
}
