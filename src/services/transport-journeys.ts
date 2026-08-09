import pb from '@/lib/pocketbase/client'

export interface TransportJourney {
  id: string
  numero_viagem: string
  status: string
  rota: string
  veiculo: string
  motorista: string
  transportadora: string
  romaneio_id: string
  numero_romaneio: string
  origem: string
  destino: string
  data_prevista_saida: string
  data_prevista_chegada: string
  data_saida: string
  data_chegada: string
  peso_total: string
  volume_total: string
  quantidade_entregas: number
  valor_frete: string
  custo_total: string
  tipo_transporte: string
  empresa: string
  filial: string
  responsavel: string
  observacoes: string
  entregas: unknown[]
  documentos: unknown[]
  ocorrencias: unknown[]
  rastreamento: unknown[]
  comprovantes: unknown[]
  historico: unknown[]
  created: string
  updated: string
}

export const JOURNEY_STATUS = [
  'Planejada',
  'Aguardando Carregamento',
  'Em Carregamento',
  'Liberada',
  'Em Trânsito',
  'Em Entrega',
  'Finalizada',
  'Com Ocorrência',
  'Cancelada',
] as const

export const JOURNEY_NEXT_STATUS: Record<string, string> = {
  Planejada: 'Aguardando Carregamento',
  'Aguardando Carregamento': 'Em Carregamento',
  'Em Carregamento': 'Liberada',
  Liberada: 'Em Trânsito',
  'Em Trânsito': 'Em Entrega',
  'Em Entrega': 'Finalizada',
}

export const getJourneys = (): Promise<TransportJourney[]> =>
  pb.collection('transport_journeys').getFullList({ sort: '-created' })

export const getJourney = (id: string): Promise<TransportJourney> =>
  pb.collection('transport_journeys').getOne(id)

export const createJourney = (data: Record<string, unknown>): Promise<TransportJourney> =>
  pb.collection('transport_journeys').create(data)

export const updateJourney = (
  id: string,
  data: Record<string, unknown>,
): Promise<TransportJourney> => pb.collection('transport_journeys').update(id, data)
