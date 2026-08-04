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
  manufacturer_code: string
  subcategory: string
  cost_price: string
  profit_margin: string
  commission: string
  max_discount: string
  cest: string
  cfop: string
  origin: string
  cst_csosn: string
  icms_aliquot: string
  ipi: string
  pis: string
  cofins: string
  max_stock: number
  location: string
  lot: string
  validity: string
  allow_lot_control: boolean
  allow_validity_control: boolean
  allow_serial_number: boolean
  main_supplier: string
  supplier_product_code: string
  last_cost: string
  last_purchase: string
  replenishment_time: string
  main_photo: string
  technical_sheet: string
  documents: string[]
  internal_observations: string
}

export interface ProductFormState {
  code: string
  ean: string
  manufacturer_code: string
  name: string
  description: string
  brand: string
  category: string
  subcategory: string
  unit: string
  active: boolean
  cost_price: string
  price: string
  profit_margin: string
  commission: string
  max_discount: string
  ncm: string
  cest: string
  cfop: string
  origin: string
  cst_csosn: string
  icms_aliquot: string
  ipi: string
  pis: string
  cofins: string
  stock: string
  min_stock: string
  max_stock: string
  location: string
  lot: string
  validity: string
  allow_lot_control: boolean
  allow_validity_control: boolean
  allow_serial_number: boolean
  main_supplier: string
  supplier_product_code: string
  last_cost: string
  last_purchase: string
  replenishment_time: string
  internal_observations: string
}

export interface ProductFileState {
  mainPhoto: File | null
  newPhotos: File[]
  removedPhotos: string[]
  technicalSheet: File | null
  removedTechnicalSheet: boolean
  newDocuments: File[]
  removedDocuments: string[]
}

export interface ProductTabProps {
  form: ProductFormState
  setField: (field: keyof ProductFormState, value: string | boolean) => void
  errors?: Record<string, string>
}

export function getInitialFormState(product?: Product | null): ProductFormState {
  return {
    code: product?.code || '',
    ean: product?.ean || '',
    manufacturer_code: product?.manufacturer_code || '',
    name: product?.name || '',
    description: product?.description || '',
    brand: product?.brand || '',
    category: product?.category || '',
    subcategory: product?.subcategory || '',
    unit: product?.unit || '',
    active: product?.active !== false,
    cost_price: product?.cost_price || '',
    price: product?.price || '',
    profit_margin: product?.profit_margin || '',
    commission: product?.commission || '',
    max_discount: product?.max_discount || '',
    ncm: product?.ncm || '',
    cest: product?.cest || '',
    cfop: product?.cfop || '',
    origin: product?.origin || '',
    cst_csosn: product?.cst_csosn || '',
    icms_aliquot: product?.icms_aliquot || '',
    ipi: product?.ipi || '',
    pis: product?.pis || '',
    cofins: product?.cofins || '',
    stock: String(product?.stock ?? 0),
    min_stock: String(product?.min_stock ?? 0),
    max_stock: String(product?.max_stock ?? 0),
    location: product?.location || '',
    lot: product?.lot || '',
    validity: product?.validity || '',
    allow_lot_control: product?.allow_lot_control || false,
    allow_validity_control: product?.allow_validity_control || false,
    allow_serial_number: product?.allow_serial_number || false,
    main_supplier: product?.main_supplier || '',
    supplier_product_code: product?.supplier_product_code || '',
    last_cost: product?.last_cost || '',
    last_purchase: product?.last_purchase || '',
    replenishment_time: product?.replenishment_time || '',
    internal_observations: product?.internal_observations || '',
  }
}

export function getInitialFileState(): ProductFileState {
  return {
    mainPhoto: null,
    newPhotos: [],
    removedPhotos: [],
    technicalSheet: null,
    removedTechnicalSheet: false,
    newDocuments: [],
    removedDocuments: [],
  }
}
