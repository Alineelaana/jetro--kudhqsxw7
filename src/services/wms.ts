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
