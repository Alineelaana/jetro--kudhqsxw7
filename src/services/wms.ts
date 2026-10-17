import pb from '@/lib/pocketbase/client'
import type {
  WmsReceipt,
  WmsPutawayTask,
  WmsWave,
  WmsReplenishment,
  WmsReceiptCheck,
  WmsSeparation,
  WmsExpeditionCheck,
  WmsShipping,
  WmsRomaneio,
  WmsBlindCount,
} from '@/lib/wms-types'

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

export const getWmsReceiptChecks = (): Promise<WmsReceiptCheck[]> =>
  pb.collection('wms_receipt_checks').getFullList<WmsReceiptCheck>({ sort: '-created' })
export const createWmsReceiptCheck = (data: Record<string, unknown>): Promise<WmsReceiptCheck> =>
  pb.collection('wms_receipt_checks').create<WmsReceiptCheck>(data)
export const updateWmsReceiptCheck = (
  id: string,
  data: Record<string, unknown>,
): Promise<WmsReceiptCheck> => pb.collection('wms_receipt_checks').update<WmsReceiptCheck>(id, data)

export const getWmsSeparations = (): Promise<WmsSeparation[]> =>
  pb.collection('wms_separations').getFullList<WmsSeparation>({ sort: '-created' })
export const createWmsSeparation = (data: Record<string, unknown>): Promise<WmsSeparation> =>
  pb.collection('wms_separations').create<WmsSeparation>(data)
export const updateWmsSeparation = (
  id: string,
  data: Record<string, unknown>,
): Promise<WmsSeparation> => pb.collection('wms_separations').update<WmsSeparation>(id, data)

export const getWmsExpeditionChecks = (): Promise<WmsExpeditionCheck[]> =>
  pb.collection('wms_expedition_checks').getFullList<WmsExpeditionCheck>({ sort: '-created' })
export const createWmsExpeditionCheck = (
  data: Record<string, unknown>,
): Promise<WmsExpeditionCheck> =>
  pb.collection('wms_expedition_checks').create<WmsExpeditionCheck>(data)
export const updateWmsExpeditionCheck = (
  id: string,
  data: Record<string, unknown>,
): Promise<WmsExpeditionCheck> =>
  pb.collection('wms_expedition_checks').update<WmsExpeditionCheck>(id, data)

export const getWmsShippings = (): Promise<WmsShipping[]> =>
  pb.collection('wms_shippings').getFullList<WmsShipping>({ sort: '-created' })
export const createWmsShipping = (data: Record<string, unknown>): Promise<WmsShipping> =>
  pb.collection('wms_shippings').create<WmsShipping>(data)
export const updateWmsShipping = (
  id: string,
  data: Record<string, unknown>,
): Promise<WmsShipping> => pb.collection('wms_shippings').update<WmsShipping>(id, data)

export const getWmsRomaneios = (): Promise<WmsRomaneio[]> =>
  pb.collection('wms_romaneios').getFullList<WmsRomaneio>({ sort: '-created' })
export const createWmsRomaneio = (data: Record<string, unknown>): Promise<WmsRomaneio> =>
  pb.collection('wms_romaneios').create<WmsRomaneio>(data)
export const updateWmsRomaneio = (
  id: string,
  data: Record<string, unknown>,
): Promise<WmsRomaneio> => pb.collection('wms_romaneios').update<WmsRomaneio>(id, data)

export const getWmsBlindCounts = (): Promise<WmsBlindCount[]> =>
  pb.collection('wms_blind_counts').getFullList<WmsBlindCount>({ sort: '-created' })
export const createWmsBlindCount = (data: Record<string, unknown>): Promise<WmsBlindCount> =>
  pb.collection('wms_blind_counts').create<WmsBlindCount>(data)
export const updateWmsBlindCount = (
  id: string,
  data: Record<string, unknown>,
): Promise<WmsBlindCount> => pb.collection('wms_blind_counts').update<WmsBlindCount>(id, data)

export const getWmsOperationalAlerts = (filter?: string): Promise<Record<string, unknown>[]> =>
  pb.collection('wms_operational_alerts').getFullList({ sort: '-created', filter })
export const updateWmsOperationalAlert = (id: string, data: Record<string, unknown>) =>
  pb.collection('wms_operational_alerts').update(id, data)
export const scanWmsAlerts = (): Promise<{ created: number }> =>
  pb.send('/backend/v1/wms/alerts/scan', { method: 'POST' })
