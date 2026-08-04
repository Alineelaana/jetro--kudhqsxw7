import pb from '@/lib/pocketbase/client'
import type { Product } from '@/lib/product-types'

export async function getProducts(): Promise<Product[]> {
  return pb.collection('products').getFullList({ sort: '-created' })
}

export async function getProduct(id: string): Promise<Product> {
  return pb.collection('products').getOne(id)
}

export async function createProduct(data: FormData | Record<string, unknown>): Promise<Product> {
  return pb.collection('products').create(data)
}

export async function updateProduct(
  id: string,
  data: FormData | Record<string, unknown>,
): Promise<Product> {
  return pb.collection('products').update(id, data)
}

export async function deleteProduct(id: string): Promise<void> {
  await pb.collection('products').delete(id)
}

export async function toggleProductActive(id: string, active: boolean): Promise<Product> {
  return pb.collection('products').update(id, { active })
}

export async function getNextProductCode(): Promise<{ number: string; sequence: number }> {
  return pb.send('/backend/v1/product-code/next', { method: 'GET' })
}

export function getProductPhotoUrl(recordId: string, filename: string, thumb?: string): string {
  const url = `${import.meta.env.VITE_POCKETBASE_URL}/api/files/products/${recordId}/${filename}`
  return thumb ? `${url}?thumb=${thumb}` : url
}

export function getProductFileUrl(recordId: string, filename: string, thumb?: string): string {
  return getProductPhotoUrl(recordId, filename, thumb)
}

export async function duplicateProduct(id: string): Promise<Product> {
  const original = await getProduct(id)
  const { number } = await getNextProductCode()
  const formData = new FormData()
  const textFields: (keyof Product)[] = [
    'name',
    'description',
    'ean',
    'manufacturer_code',
    'brand',
    'category',
    'subcategory',
    'unit',
    'cost_price',
    'price',
    'profit_margin',
    'commission',
    'max_discount',
    'ncm',
    'cest',
    'cfop',
    'origin',
    'cst_csosn',
    'icms_aliquot',
    'ipi',
    'pis',
    'cofins',
    'location',
    'lot',
    'validity',
    'main_supplier',
    'supplier_product_code',
    'last_cost',
    'last_purchase',
    'replenishment_time',
    'internal_observations',
  ]
  for (const f of textFields) {
    const v = original[f]
    if (v !== undefined && v !== null) formData.append(f, String(v))
  }
  formData.append('code', number)
  formData.append('active', 'true')
  formData.append('stock', String(original.stock ?? 0))
  formData.append('min_stock', String(original.min_stock ?? 0))
  formData.append('max_stock', String(original.max_stock ?? 0))
  formData.append('allow_lot_control', String(original.allow_lot_control || false))
  formData.append('allow_validity_control', String(original.allow_validity_control || false))
  formData.append('allow_serial_number', String(original.allow_serial_number || false))
  if (original.variations) formData.append('variations', JSON.stringify(original.variations))
  return pb.collection('products').create(formData)
}

export async function getProductHistory(productId: string) {
  return pb.collection('audit_logs').getList(1, 50, {
    filter: `target_collection = "products" && target_id = "${productId}"`,
    sort: '-created',
  })
}
