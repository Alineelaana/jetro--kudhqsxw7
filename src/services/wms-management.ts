import pb from '@/lib/pocketbase/client'
import type { WmsPallet, WmsVolume, WmsCollector, WmsOperator } from '@/lib/wms-management-types'

export const getWmsPallets = (): Promise<WmsPallet[]> =>
  pb.collection('wms_pallets').getFullList({ sort: '-created' })
export const createWmsPallet = (data: Record<string, unknown>): Promise<WmsPallet> =>
  pb.collection('wms_pallets').create(data)
export const updateWmsPallet = (id: string, data: Record<string, unknown>): Promise<WmsPallet> =>
  pb.collection('wms_pallets').update(id, data)
export const deleteWmsPallet = (id: string): Promise<void> =>
  pb.collection('wms_pallets').delete(id)

export const getWmsVolumes = (): Promise<WmsVolume[]> =>
  pb.collection('wms_volumes').getFullList({ sort: '-created' })
export const createWmsVolume = (data: Record<string, unknown>): Promise<WmsVolume> =>
  pb.collection('wms_volumes').create(data)
export const updateWmsVolume = (id: string, data: Record<string, unknown>): Promise<WmsVolume> =>
  pb.collection('wms_volumes').update(id, data)
export const deleteWmsVolume = (id: string): Promise<void> =>
  pb.collection('wms_volumes').delete(id)

export const getWmsCollectors = (): Promise<WmsCollector[]> =>
  pb.collection('wms_collectors').getFullList({ sort: '-created' })
export const createWmsCollector = (data: Record<string, unknown>): Promise<WmsCollector> =>
  pb.collection('wms_collectors').create(data)
export const updateWmsCollector = (
  id: string,
  data: Record<string, unknown>,
): Promise<WmsCollector> => pb.collection('wms_collectors').update(id, data)
export const deleteWmsCollector = (id: string): Promise<void> =>
  pb.collection('wms_collectors').delete(id)

export const getWmsOperators = (): Promise<WmsOperator[]> =>
  pb.collection('wms_operators').getFullList({ sort: '-created' })
export const createWmsOperator = (data: Record<string, unknown>): Promise<WmsOperator> =>
  pb.collection('wms_operators').create(data)
export const updateWmsOperator = (
  id: string,
  data: Record<string, unknown>,
): Promise<WmsOperator> => pb.collection('wms_operators').update(id, data)
export const deleteWmsOperator = (id: string): Promise<void> =>
  pb.collection('wms_operators').delete(id)
