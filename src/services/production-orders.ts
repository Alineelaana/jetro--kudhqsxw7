import pb from '@/lib/pocketbase/client'

export interface ProductionOrder {
  id: string
  order_number: string
  status: string
  product_id: string
  bom_version_id: string
  route_id: string
  quantity: string
  unit: string
  lot_number: string
  start_date: string
  end_date: string
  responsible: string
  company: string
  branch: string
  observations: string
  history: unknown
  created: string
  updated: string
  expand?: {
    product_id?: { id: string; name: string }
    bom_version_id?: { id: string; version: number }
    route_id?: { id: string; name: string }
  }
}

export const getProductionOrders = () =>
  pb.collection('production_orders').getFullList({
    sort: '-created',
    expand: 'product_id,bom_version_id,route_id',
  }) as Promise<ProductionOrder[]>

export const createProductionOrder = (data: Partial<ProductionOrder>) =>
  pb.collection('production_orders').create(data) as Promise<ProductionOrder>

export const updateProductionOrder = (id: string, data: Partial<ProductionOrder>) =>
  pb.collection('production_orders').update(id, data) as Promise<ProductionOrder>

export const deleteProductionOrder = (id: string) => pb.collection('production_orders').delete(id)

export async function getNextProductionOrderNumber(): Promise<string> {
  const result = await pb.send('/backend/v1/production-order-number/next', { method: 'GET' })
  return result.number as string
}
