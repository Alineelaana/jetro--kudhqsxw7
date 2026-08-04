export const RECEIPT_STATUS = [
  'Pendente',
  'Em Recebimento',
  'Recebido',
  'Com Divergência',
  'Cancelado',
] as const
export const PUTAWAY_STATUS = ['Pendente', 'Em Andamento', 'Concluído', 'Cancelado'] as const
export const WAVE_STATUS = [
  'Rascunho',
  'Liberada',
  'Em Separação',
  'Concluída',
  'Cancelada',
] as const
export const WAVE_TYPES = ['Separação', 'Reabastecimento', 'Consolidado'] as const
export const REPLENISHMENT_STATUS = ['Pendente', 'Em Andamento', 'Concluído', 'Cancelado'] as const

export interface WmsReceipt {
  id: string
  numero_recebimento: string
  fornecedor: string
  nota_fiscal: string
  data_prevista: string
  data_recebida: string
  status: string
  itens: WmsReceiptItem[]
  responsavel: string
  observacoes: string
  empresa: string
  filial: string
  deposito: string
  created: string
  updated: string
}

export interface WmsReceiptItem {
  produto_id: string
  produto_nome: string
  produto_codigo: string
  quantidade_esperada: number
  quantidade_recebida: number
  lote: string
  validade: string
  divergencia: number
}

export interface WmsPutawayTask {
  id: string
  numero_task: string
  receipt_id: string
  produto_id: string
  produto_nome: string
  produto_codigo: string
  quantidade: number
  localizacao_origem: string
  localizacao_destino: string
  lote: string
  validade: string
  status: string
  operador: string
  prioridade: string
  empresa: string
  filial: string
  deposito: string
  created: string
  updated: string
}

export interface WmsWave {
  id: string
  numero_wave: string
  tipo: string
  status: string
  prioridade: string
  operador: string
  itens: WmsWaveItem[]
  data_liberacao: string
  data_conclusao: string
  total_itens: number
  itens_separados: number
  empresa: string
  filial: string
  deposito: string
  created: string
  updated: string
}

export interface WmsWaveItem {
  produto_id: string
  produto_nome: string
  produto_codigo: string
  quantidade: number
  localizacao: string
  lote: string
  pedido: string
  cliente: string
  separado: boolean
}

export interface WmsReplenishment {
  id: string
  numero_reabastecimento: string
  produto_id: string
  produto_nome: string
  produto_codigo: string
  quantidade: number
  localizacao_origem: string
  localizacao_destino: string
  status: string
  operador: string
  motivo: string
  prioridade: string
  empresa: string
  filial: string
  deposito: string
  created: string
  updated: string
}
