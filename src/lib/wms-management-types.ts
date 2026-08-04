export const PALLET_SITUATIONS = [
  'Disponível',
  'Em Recebimento',
  'Em Armazenagem',
  'Armazenado',
  'Em Movimentação',
  'Em Separação',
  'Bloqueado',
  'Vazio',
  'Expedido',
] as const

export const VOLUME_SITUATIONS = [
  'Disponível',
  'Em Recebimento',
  'Armazenado',
  'Em Separação',
  'Expedido',
  'Bloqueado',
] as const

export const COLLECTOR_SITUATIONS = [
  'Disponível',
  'Em Uso',
  'Em Manutenção',
  'Bloqueado',
  'Inativo',
] as const

export const OPERATOR_SITUATIONS = ['Ativo', 'Inativo', 'Em Pausa', 'Desligado'] as const

export interface WmsPallet {
  id: string
  codigo_unico: string
  etiqueta: string
  tipo: string
  produto_id: string
  produto_nome: string
  lote: string
  validade: string
  quantidade: number
  peso: string
  volume: string
  localizacao: string
  situacao: string
  historico: Record<string, unknown>[]
  empresa: string
  filial: string
  deposito: string
  created: string
  updated: string
}

export interface WmsVolume {
  id: string
  codigo: string
  tipo: string
  produto_id: string
  produto_nome: string
  quantidade: number
  lote: string
  validade: string
  peso: string
  dimensoes: string
  pallet_id: string
  localizacao: string
  situacao: string
  empresa: string
  filial: string
  deposito: string
  created: string
  updated: string
}

export interface WmsCollector {
  id: string
  codigo_equipamento: string
  modelo: string
  numero_serie: string
  operador_atual: string
  data_entrega: string
  status: string
  ultima_comunicacao: string
  bateria: number
  observacoes: string
  turno: string
  created: string
  updated: string
}

export interface WmsOperator {
  id: string
  operador: string
  user_id: string
  turno: string
  area: string
  coletor_id: string
  tarefas_pendentes: number
  tarefas_concluidas: number
  produtividade: string
  divergencias: number
  tempo_medio_tarefa: string
  situacao: string
  created: string
  updated: string
}
