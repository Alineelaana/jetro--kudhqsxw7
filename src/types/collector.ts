export type CollectorOpType =
  | 'recebimento'
  | 'putaway'
  | 'separacao'
  | 'conferencia_expedicao'
  | 'inventario'
  | 'transferencia'

export type CollectorShiftStatus = 'aberto' | 'fechado' | 'pausado' | 'cancelado'

export type CollectorOpStatus = 'concluido' | 'divergente' | 'cancelado' | 'pendente_sync'

export interface CollectorShift {
  id: string
  operador_id: string
  operador_nome?: string
  dispositivo_id?: string
  dispositivo_codigo?: string
  turno_nome?: string
  data_inicio: string
  data_fim?: string
  status: CollectorShiftStatus
  observacoes?: string
  bateria_inicial?: number
  bateria_final?: number
  empresa_id?: string
  filial_id?: string
  created: string
  updated: string
}

export interface CollectorOperation {
  id?: string
  tipo: CollectorOpType
  shift_id?: string
  dispositivo_codigo?: string
  operador_id: string
  operador_nome?: string
  documento_referencia?: string
  produto_id?: string
  produto_codigo?: string
  produto_nome?: string
  codigo_barras_lido?: string
  lote?: string
  validade?: string
  endereco_origem?: string
  endereco_destino?: string
  quantidade_esperada?: number
  quantidade_executada: number
  divergencia?: number
  motivo_divergencia?: string
  status: CollectorOpStatus
  idempotency_key: string
  metadata?: Record<string, unknown>
  empresa_id?: string
  filial_id?: string
  created?: string
  updated?: string
}

export interface CollectorSyncBatchResult {
  ok: boolean
  total: number
  synced: number
  deduplicated: number
  errors: number
  results: Array<{
    index: number
    idempotency_key: string
    id?: string
    status?: string
    success: boolean
    error?: string
  }>
}
