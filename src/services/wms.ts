import pb from '@/lib/pocketbase/client'
import type { WmsReceipt, WmsPutawayTask, WmsWave, WmsReplenishment } from '@/lib/wms-types'

export const getWmsReceipts = (): Promise<WmsReceipt[]> =>
  pb.collection('wms_receipts').getFullList({ sort: '-created' })
export const createWmsReceipt = (data: Record<string, unknown>): Promise<WmsReceipt> =>
  pb.collection('wms_receipts').create(data)
export const updateWmsReceipt = (id: string, data: Record<string, unknown>): Promise<WmsReceipt> =>
  pb.collection('wms_receipts').update(id, data)

export const getWmsPutawayTasks = (): Promise<WmsPutawayTask[]> =>
  pb.collection('wms_putaway_tasks').getFullList({ sort: '-created' })
export const createWmsPutawayTask = (data: Record<string, unknown>): Promise<WmsPutawayTask> =>
  pb.collection('wms_putaway_tasks').create(data)
export const updateWmsPutawayTask = (
  id: string,
  data: Record<string, unknown>,
): Promise<WmsPutawayTask> => pb.collection('wms_putaway_tasks').update(id, data)

export const getWmsWaves = (): Promise<WmsWave[]> =>
  pb.collection('wms_waves').getFullList({ sort: '-created' })
export const createWmsWave = (data: Record<string, unknown>): Promise<WmsWave> =>
  pb.collection('wms_waves').create(data)
export const updateWmsWave = (id: string, data: Record<string, unknown>): Promise<WmsWave> =>
  pb.collection('wms_waves').update(id, data)

export const getWmsReplenishments = (): Promise<WmsReplenishment[]> =>
  pb.collection('wms_replenishments').getFullList({ sort: '-created' })
export const createWmsReplenishment = (data: Record<string, unknown>): Promise<WmsReplenishment> =>
  pb.collection('wms_replenishments').create(data)
export const updateWmsReplenishment = (
  id: string,
  data: Record<string, unknown>,
): Promise<WmsReplenishment> => pb.collection('wms_replenishments').update(id, data)

export const getWmsReceiptChecks = (): Promise<Record<string, unknown>[]> =>
  pb.collection('wms_receipt_checks').getFullList({ sort: '-created' })
export const updateWmsReceiptCheck = (id: string, data: Record<string, unknown>) =>
  pb.collection('wms_receipt_checks').update(id, data)

export const getWmsSeparations = (): Promise<Record<string, unknown>[]> =>
  pb.collection('wms_separations').getFullList({ sort: '-created' })
export const createWmsSeparation = (data: Record<string, unknown>) =>
  pb.collection('wms_separations').create(data)
export const updateWmsSeparation = (id: string, data: Record<string, unknown>) =>
  pb.collection('wms_separations').update(id, data)

export const getWmsExpeditionChecks = (): Promise<Record<string, unknown>[]> =>
  pb.collection('wms_expedition_checks').getFullList({ sort: '-created' })
export const updateWmsExpeditionCheck = (id: string, data: Record<string, unknown>) =>
  pb.collection('wms_expedition_checks').update(id, data)

export const getWmsShippings = (): Promise<Record<string, unknown>[]> =>
  pb.collection('wms_shippings').getFullList({ sort: '-created' })
export const createWmsShipping = (data: Record<string, unknown>) =>
  pb.collection('wms_shippings').create(data)
export const updateWmsShipping = (id: string, data: Record<string, unknown>) =>
  pb.collection('wms_shippings').update(id, data)

export const getWmsRomaneios = (): Promise<Record<string, unknown>[]> =>
  pb.collection('wms_romaneios').getFullList({ sort: '-created' })
export const createWmsRomaneio = (data: Record<string, unknown>) =>
  pb.collection('wms_romaneios').create(data)
export const updateWmsRomaneio = (id: string, data: Record<string, unknown>) =>
  pb.collection('wms_romaneios').update(id, data)

export const getWmsBlindCounts = (): Promise<Record<string, unknown>[]> =>
  pb.collection('wms_blind_counts').getFullList({ sort: '-created' })

export const getWmsOperationalAlerts = (filter?: string): Promise<Record<string, unknown>[]> =>
  pb.collection('wms_operational_alerts').getFullList({ sort: '-created', filter })
export const updateWmsOperationalAlert = (id: string, data: Record<string, unknown>) =>
  pb.collection('wms_operational_alerts').update(id, data)
export const scanWmsAlerts = (): Promise<{ created: number }> =>
  pb.send('/backend/v1/wms/alerts/scan', { method: 'POST' })
