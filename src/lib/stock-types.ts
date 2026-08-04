export const MOVEMENT_TYPES = [
  'Entrada por Compra',
  'Entrada Manual',
  'Entrada por Devolução',
  'Saída por Venda',
  'Saída Manual',
  'Saída por Devolução ao Fornecedor',
  'Transferência',
  'Ajuste Positivo',
  'Ajuste Negativo',
  'Reserva',
  'Liberação de Reserva',
  'Separação',
  'Cancelamento',
  'Perda',
  'Avaria',
  'Vencimento',
] as const

export const INVENTORY_TYPES = [
  'Geral',
  'Parcial',
  'Por Produto',
  'Por Categoria',
  'Por Marca',
  'Por Localização',
  'Por Lote',
  'Rotativo',
] as const

export const INVENTORY_STATUS = [
  'Em Preparação',
  'Em Contagem',
  'Aguardando Recontagem',
  'Aguardando Aprovação',
  'Finalizado',
  'Cancelado',
] as const

export const TRANSFER_STATUS = [
  'Rascunho',
  'Aguardando Aprovação',
  'Aprovada',
  'Em Separação',
  'Em Trânsito',
  'Recebida',
  'Cancelada',
] as const

export const ADJUSTMENT_TYPES = [
  'Entrada',
  'Saída',
  'Perda',
  'Avaria',
  'Quebra',
  'Vencimento',
  'Correção de Inventário',
  'Outros',
] as const

export const ADJUSTMENT_STATUS = ['Pendente', 'Aprovado', 'Reprovado', 'Aplicado'] as const

export const BATCH_SITUATIONS = [
  'Disponível',
  'Reservado',
  'Bloqueado',
  'Em Análise',
  'Vencido',
  'Esgotado',
] as const

export const LOCATION_TYPES = [
  'Recebimento',
  'Armazenagem',
  'Separação',
  'Conferência',
  'Expedição',
  'Avaria',
  'Quarentena',
  'Devolução',
] as const

export const PICKING_STATUS = [
  'Aguardando Separação',
  'Em Separação',
  'Separação Parcial',
  'Separada',
  'Com Divergência',
  'Cancelada',
] as const

export const CHECKING_TYPES = [
  'Conferência de Entrada',
  'Conferência de Saída',
  'Conferência de Transferência',
  'Conferência de Devolução',
] as const

export const CHECKING_STATUS = [
  'Aguardando Conferência',
  'Em Conferência',
  'Conferida',
  'Com Divergência',
  'Reprovada',
  'Cancelada',
] as const

export const EXPEDITION_STATUS = [
  'Aguardando Expedição',
  'Em Preparação',
  'Liberada',
  'Coletada',
  'Em Transporte',
  'Entregue',
  'Cancelada',
] as const

export const PRIORITY_OPTIONS = ['Baixa', 'Normal', 'Alta', 'Urgente'] as const

export const EXPIRY_RANGES = [
  { key: 'expired', label: 'Vencido', minDays: -9999, maxDays: 0, color: '#ef4444' },
  { key: '30', label: 'Vence em até 30 dias', minDays: 1, maxDays: 30, color: '#f59e0b' },
  { key: '60', label: 'Vence entre 31 e 60 dias', minDays: 31, maxDays: 60, color: '#eab308' },
  { key: '90', label: 'Vence entre 61 e 90 dias', minDays: 61, maxDays: 90, color: '#06b6d4' },
  { key: 'safe', label: 'Acima de 90 dias', minDays: 91, maxDays: 9999, color: '#22c55e' },
]

export interface StockMovement {
  id: string
  produto_id: string
  produto_nome: string
  produto_codigo: string
  tipo_movimentacao: string
  documento_origem: string
  documento_tipo: string
  lote: string
  validade: string
  quantidade: number
  unidade: string
  localizacao_origem: string
  localizacao_destino: string
  saldo_anterior: number
  saldo_atual: number
  empresa: string
  filial: string
  deposito: string
  localizacao: string
  motivo: string
  responsavel: string
  observacoes: string
  custo_unitario: string
  custo_total: string
  created: string
  updated: string
}

export interface StockInventory {
  id: string
  numero_inventario: string
  empresa: string
  filial: string
  deposito: string
  localizacao: string
  data_abertura: string
  responsavel: string
  tipo_inventario: string
  observacoes: string
  status: string
  itens: unknown[]
  data_fechamento: string
  aprovador: string
  created: string
  updated: string
}

export interface StockTransfer {
  id: string
  numero_transferencia: string
  data: string
  empresa_origem: string
  filial_origem: string
  deposito_origem: string
  localizacao_origem: string
  empresa_destino: string
  filial_destino: string
  deposito_destino: string
  localizacao_destino: string
  responsavel: string
  motivo: string
  observacoes: string
  status: string
  itens: unknown[]
  fiscal_integrado: boolean
  created: string
  updated: string
}

export interface StockAdjustment {
  id: string
  numero_ajuste: string
  data: string
  empresa: string
  filial: string
  deposito: string
  produto_id: string
  produto_nome: string
  produto_codigo: string
  lote: string
  validade: string
  localizacao: string
  tipo_ajuste: string
  quantidade: number
  motivo: string
  documento_referencia: string
  observacoes: string
  status: string
  saldo_anterior: number
  saldo_atual: number
  responsavel: string
  aprovador: string
  created: string
  updated: string
}

export interface StockBatch {
  id: string
  produto_id: string
  produto_nome: string
  produto_codigo: string
  numero_lote: string
  data_fabricacao: string
  data_validade: string
  fornecedor: string
  nota_fiscal_entrada: string
  quantidade_recebida: number
  quantidade_disponivel: number
  quantidade_reservada: number
  localizacao: string
  situacao: string
  empresa: string
  filial: string
  deposito: string
  historico: unknown[]
  created: string
  updated: string
}

export interface StockLocation {
  id: string
  codigo: string
  descricao: string
  empresa: string
  filial: string
  deposito: string
  setor: string
  rua: string
  coluna: string
  nivel: string
  posicao: string
  tipo: string
  capacidade: number
  permite_mistura_produtos: boolean
  permite_mistura_lotes: boolean
  situacao: string
  produtos_armazenados: unknown[]
  created: string
  updated: string
}

export interface StockPicking {
  id: string
  numero_separacao: string
  documento_origem: string
  documento_tipo: string
  cliente_destino: string
  data: string
  prioridade: string
  quantidade_itens: number
  responsavel: string
  status: string
  itens: unknown[]
  empresa: string
  filial: string
  deposito: string
  created: string
  updated: string
}

export interface StockChecking {
  id: string
  documento: string
  tipo_conferencia: string
  produto_id: string
  produto_nome: string
  codigo_barras: string
  lote: string
  validade: string
  quantidade_esperada: number
  quantidade_conferida: number
  diferenca: number
  situacao: string
  motivo_divergencia: string
  responsavel: string
  observacao: string
  status: string
  empresa: string
  filial: string
  deposito: string
  created: string
  updated: string
}

export interface StockExpedition {
  id: string
  numero_expedicao: string
  pedido: string
  cliente: string
  transportadora: string
  motorista: string
  veiculo: string
  data: string
  quantidade_volumes: number
  peso_bruto: string
  peso_liquido: string
  status: string
  responsavel: string
  romaneio: string
  observacoes: string
  historico: unknown[]
  empresa: string
  filial: string
  deposito: string
  comprovante: string
  data_saida: string
  data_entrega_real: string
  codigo_rastreamento: string
  created: string
  updated: string
}

export interface InventoryItem {
  produto_id: string
  produto_codigo: string
  produto_nome: string
  lote: string
  validade: string
  localizacao: string
  quantidade_sistema: number
  quantidade_contada: number
  diferenca: number
  motivo_diferenca: string
}

export interface TransferItem {
  produto_id: string
  produto_codigo: string
  produto_nome: string
  lote: string
  validade: string
  quantidade_disponivel: number
  quantidade_transferir: number
}
export function daysUntilExpiry(validade: string): number {
  if (!validade) return 9999
  const d = new Date(validade)
  if (isNaN(d.getTime())) return 9999
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  d.setHours(0, 0, 0, 0)
  return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

export function getExpiryRange(days: number) {
  return EXPIRY_RANGES.find((r) => days >= r.minDays && days <= r.maxDays) || EXPIRY_RANGES[4]
}
