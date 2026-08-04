import pb from '@/lib/pocketbase/client'

export interface CollectorReceivingCheckPayload {
  receipt_id: string
  produto_codigo: string
  produto_nome?: string
  lote?: string
  validade?: string
  quantidade_esperada?: number
  quantidade_conferida: number
  codigo_barras?: string
}

export interface CollectorPutawayPayload {
  task_id: string
  localizacao_destino: string
  quantidade?: number
  codigo_barras?: string
}

export interface CollectorSeparationPayload {
  separation_id: string
  quantidade_separada: number
  lote?: string
  localizacao?: string
  codigo_barras?: string
}

export interface CollectorExpeditionCheckPayload {
  check_id: string
  quantidade_conferida: number
  codigo_barras?: string
}

export interface CollectorTransferPayload {
  produto_id: string
  quantidade: number
  localizacao_origem: string
  localizacao_destino: string
  lote?: string
  validade?: string
  codigo_barras?: string
}

export const collectorReceivingCheck = (data: CollectorReceivingCheckPayload) =>
  pb.send('/backend/v1/collector/receiving-check', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  })

export const collectorPutawayConfirm = (data: CollectorPutawayPayload) =>
  pb.send('/backend/v1/collector/putaway-confirm', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  })

export const collectorSeparation = (data: CollectorSeparationPayload) =>
  pb.send('/backend/v1/collector/separation', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  })

export const collectorExpeditionCheck = (data: CollectorExpeditionCheckPayload) =>
  pb.send('/backend/v1/collector/expedition-check', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  })

export const collectorTransfer = (data: CollectorTransferPayload) =>
  pb.send('/backend/v1/collector/transfer', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  })

export const generateRomaneioFromExpeditions = (expeditionIds: string[]) =>
  pb.send('/backend/v1/wms/romaneio/generate', {
    method: 'POST',
    body: JSON.stringify({ expedition_ids: expeditionIds }),
    headers: { 'Content-Type': 'application/json' },
  })
