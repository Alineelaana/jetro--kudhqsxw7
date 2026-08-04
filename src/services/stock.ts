import pb from '@/lib/pocketbase/client'
import type {
  StockMovement,
  StockInventory,
  StockTransfer,
  StockAdjustment,
  StockBatch,
  StockLocation,
  StockPicking,
  StockChecking,
  StockExpedition,
} from '@/lib/stock-types'

export async function getStockMovements(): Promise<StockMovement[]> {
  return pb.collection('stock_movements').getFullList({ sort: '-created' }) as Promise<
    StockMovement[]
  >
}
export async function createStockMovement(data: Record<string, unknown>): Promise<StockMovement> {
  return pb.collection('stock_movements').create(data) as Promise<StockMovement>
}

export async function getStockInventories(): Promise<StockInventory[]> {
  return pb.collection('stock_inventories').getFullList({ sort: '-created' }) as Promise<
    StockInventory[]
  >
}
export async function createStockInventory(data: Record<string, unknown>): Promise<StockInventory> {
  return pb.collection('stock_inventories').create(data) as Promise<StockInventory>
}
export async function updateStockInventory(
  id: string,
  data: Record<string, unknown>,
): Promise<StockInventory> {
  return pb.collection('stock_inventories').update(id, data) as Promise<StockInventory>
}

export async function getStockTransfers(): Promise<StockTransfer[]> {
  return pb.collection('stock_transfers').getFullList({ sort: '-created' }) as Promise<
    StockTransfer[]
  >
}
export async function createStockTransfer(data: Record<string, unknown>): Promise<StockTransfer> {
  return pb.collection('stock_transfers').create(data) as Promise<StockTransfer>
}
export async function updateStockTransfer(
  id: string,
  data: Record<string, unknown>,
): Promise<StockTransfer> {
  return pb.collection('stock_transfers').update(id, data) as Promise<StockTransfer>
}

export async function getStockAdjustments(): Promise<StockAdjustment[]> {
  return pb.collection('stock_adjustments').getFullList({ sort: '-created' }) as Promise<
    StockAdjustment[]
  >
}
export async function createStockAdjustment(
  data: Record<string, unknown>,
): Promise<StockAdjustment> {
  return pb.collection('stock_adjustments').create(data) as Promise<StockAdjustment>
}
export async function updateStockAdjustment(
  id: string,
  data: Record<string, unknown>,
): Promise<StockAdjustment> {
  return pb.collection('stock_adjustments').update(id, data) as Promise<StockAdjustment>
}

export async function getStockBatches(): Promise<StockBatch[]> {
  return pb.collection('stock_batches').getFullList({ sort: '-created' }) as Promise<StockBatch[]>
}
export async function createStockBatch(data: Record<string, unknown>): Promise<StockBatch> {
  return pb.collection('stock_batches').create(data) as Promise<StockBatch>
}
export async function updateStockBatch(
  id: string,
  data: Record<string, unknown>,
): Promise<StockBatch> {
  return pb.collection('stock_batches').update(id, data) as Promise<StockBatch>
}

export async function getStockLocations(): Promise<StockLocation[]> {
  return pb.collection('stock_locations').getFullList({ sort: '-created' }) as Promise<
    StockLocation[]
  >
}
export async function createStockLocation(data: Record<string, unknown>): Promise<StockLocation> {
  return pb.collection('stock_locations').create(data) as Promise<StockLocation>
}
export async function updateStockLocation(
  id: string,
  data: Record<string, unknown>,
): Promise<StockLocation> {
  return pb.collection('stock_locations').update(id, data) as Promise<StockLocation>
}
export async function deleteStockLocation(id: string): Promise<void> {
  await pb.collection('stock_locations').delete(id)
}

export async function getStockPickings(): Promise<StockPicking[]> {
  return pb.collection('stock_pickings').getFullList({ sort: '-created' }) as Promise<
    StockPicking[]
  >
}
export async function createStockPicking(data: Record<string, unknown>): Promise<StockPicking> {
  return pb.collection('stock_pickings').create(data) as Promise<StockPicking>
}
export async function updateStockPicking(
  id: string,
  data: Record<string, unknown>,
): Promise<StockPicking> {
  return pb.collection('stock_pickings').update(id, data) as Promise<StockPicking>
}

export async function getStockCheckings(): Promise<StockChecking[]> {
  return pb.collection('stock_checkings').getFullList({ sort: '-created' }) as Promise<
    StockChecking[]
  >
}
export async function createStockChecking(data: Record<string, unknown>): Promise<StockChecking> {
  return pb.collection('stock_checkings').create(data) as Promise<StockChecking>
}
export async function updateStockChecking(
  id: string,
  data: Record<string, unknown>,
): Promise<StockChecking> {
  return pb.collection('stock_checkings').update(id, data) as Promise<StockChecking>
}

export async function getStockExpeditions(): Promise<StockExpedition[]> {
  return pb.collection('stock_expeditions').getFullList({ sort: '-created' }) as Promise<
    StockExpedition[]
  >
}
export async function createStockExpedition(
  data: Record<string, unknown>,
): Promise<StockExpedition> {
  return pb.collection('stock_expeditions').create(data) as Promise<StockExpedition>
}
export async function updateStockExpedition(
  id: string,
  data: Record<string, unknown>,
): Promise<StockExpedition> {
  return pb.collection('stock_expeditions').update(id, data) as Promise<StockExpedition>
}

export async function getProductsForStock() {
  return pb.collection('products').getFullList({ sort: '-created' })
}
