export const AGREEMENT_TYPES = [
  { value: 'rebate', label: 'Rebate' },
  { value: 'verba_mercado', label: 'Verba de Mercado' },
  { value: 'coop', label: 'Cooperação' },
  { value: 'bonificacao', label: 'Bonificação' },
  { value: 'outros', label: 'Outros' },
] as const

export const AGREEMENT_STATUS = [
  { value: 'rascunho', label: 'Rascunho' },
  { value: 'ativo', label: 'Ativo' },
  { value: 'pausado', label: 'Pausado' },
  { value: 'encerrado', label: 'Encerrado' },
  { value: 'cancelado', label: 'Cancelado' },
] as const

export const MOVEMENT_TYPES = [
  { value: 'apuracao', label: 'Apuração' },
  { value: 'apropriacao', label: 'Apropriação' },
  { value: 'consumo', label: 'Consumo' },
  { value: 'lancamento', label: 'Lançamento' },
  { value: 'estorno', label: 'Estorno' },
  { value: 'ajuste', label: 'Ajuste' },
] as const

export const DIRECTIONS = [
  { value: 'credito', label: 'Crédito' },
  { value: 'debito', label: 'Débito' },
] as const

export const ACCRUAL_STATUS = [
  { value: 'rascunho', label: 'Rascunho' },
  { value: 'pendente', label: 'Pendente' },
  { value: 'aprovado', label: 'Aprovado' },
  { value: 'rejeitado', label: 'Rejeitado' },
  { value: 'liquidado', label: 'Liquidado' },
] as const

export const SETTLEMENT_TYPES = [
  { value: 'credito', label: 'Crédito' },
  { value: 'abatimento', label: 'Abatimento' },
  { value: 'nota_credito', label: 'Nota de Crédito' },
  { value: 'pagamento', label: 'Pagamento' },
] as const

export const SETTLEMENT_STATUS = [
  { value: 'rascunho', label: 'Rascunho' },
  { value: 'pendente', label: 'Pendente' },
  { value: 'aprovado', label: 'Aprovado' },
  { value: 'rejeitado', label: 'Rejeitado' },
  { value: 'liquidado', label: 'Liquidado' },
  { value: 'cancelado', label: 'Cancelado' },
] as const

export const SA_TABS = [
  { id: 'agreements', label: 'Acordos de Verba' },
  { id: 'accounts', label: 'Conta Corrente' },
  { id: 'movements', label: 'Movimentações' },
  { id: 'accruals', label: 'Apurações' },
  { id: 'appropriations', label: 'Apropriações' },
  { id: 'consumptions', label: 'Consumo' },
  { id: 'settlements', label: 'Liquidações' },
  { id: 'cockpit', label: 'Cockpit Executivo' },
  { id: 'reports', label: 'Relatórios' },
  { id: 'configuracoes', label: 'Configurações' },
] as const

export function formatBRL(v: string | number | undefined | null): string {
  const n = typeof v === 'number' ? v : parseFloat(String(v || '0'))
  return isNaN(n)
    ? '0,00'
    : n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
