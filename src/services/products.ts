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
