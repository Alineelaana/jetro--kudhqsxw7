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

export const DIVERGENCE_DECISIONS = [
  'Aceitar Divergência',
  'Rejeitar Divergência',
  'Solicitar Reenvio',
  'Acordo Comercial',
] as const

export const SEPARATION_STRATEGIES = [
  'Pedido por Pedido',
  'Consolidada',
  'Por Rota',
  'Por Onda',
  'Batch Picking',
  'Zone Picking',
] as const

export const SHIPPING_STATUS = [
  'Aguardando Expedição',
  'Em Preparação',
  'Aguardando Veículo',
  'Em Carregamento',
  'Liberada',
  'Coletada',
  'Em Transporte',
  'Entregue',
  'Cancelada',
] as const

export interface WmsReceiptCheck {
  id: string
  numero_conferencia: string
  receipt_id: string
  produto_id: string
  produto_nome: string
  produto_codigo: string
  codigo_barras: string
  lote: string
  data_fabricacao: string
  data_validade: string
  quantidade_esperada: number
  quantidade_recebida: number
  quantidade_conferida: number
  diferenca: number
  situacao: string
  motivo_divergencia: string
  decisao: string
  responsavel: string
  observacao: string
  status: string
  created: string
  updated: string
}

export interface WmsSeparation {
  id: string
  numero_separacao: string
  wave_id: string
  pedido: string
  cliente: string
  rota: string
  produto_id: string
  produto_nome: string
  produto_codigo: string
  localizacao: string
  lote: string
  validade: string
  quantidade_solicitada: number
  quantidade_separada: number
  operador: string
  prioridade: string
  estrategia: string
  status: string
  created: string
  updated: string
}

export interface WmsExpeditionCheck {
  id: string
  numero_conferencia: string
  pedido: string
  cliente: string
  produto_id: string
  produto_nome: string
  codigo_barras: string
  lote: string
  validade: string
  quantidade_separada: number
  quantidade_conferida: number
  diferenca: number
  volume: string
  situacao: string
  motivo_divergencia: string
  responsavel: string
  status: string
  created: string
  updated: string
}

export interface WmsShipping {
  id: string
  numero_expedicao: string
  pedido: string
  nota_fiscal: string
  cliente: string
  transportadora: string
  motorista: string
  veiculo: string
  rota: string
  doca: string
  quantidade_volumes: number
  peso_bruto: string
  peso_liquido: string
  romaneio_id: string
  status: string
  responsavel: string
  created: string
  updated: string
}

export interface WmsRomaneio {
  id: string
  numero_romaneio: string
  data: string
  rota: string
  transportadora: string
  motorista: string
  veiculo: string
  pedidos: string[]
  clientes: string[]
  notas_fiscais: string[]
  quantidade_volumes: number
  peso_total: string
  observacoes: string
  status: string
  responsavel: string
  created: string
  updated: string
}

export interface WmsBlindCount {
  id: string
  numero_contagem: string
  inventario_id?: string
  produto_id?: string
  produto_nome: string
  produto_codigo?: string
  localizacao?: string
  lote?: string
  validade?: string
  quantidade_contada?: number
  primeira_contagem?: number
  segunda_contagem?: number
  operador_primeira?: string
  operador_segunda?: string
  divergencia?: boolean
  status: string
  created: string
  updated: string
}
