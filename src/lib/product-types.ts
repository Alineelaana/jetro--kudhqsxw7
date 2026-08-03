export interface ProductVariation {
  size: string
  color: string
  price: string
}

export interface FormVariation extends ProductVariation {
  id: string
}

export interface Product {
  id: string
  name: string
  description: string
  ncm: string
  ean: string
  code: string
  unit: string
  price: string
  brand: string
  category: string
  active: boolean
  stock: number
  min_stock: number
  variations: ProductVariation[]
  photos: string[]
  created: string
  updated: string
}
