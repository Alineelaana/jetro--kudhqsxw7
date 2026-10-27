import pb from '@/lib/pocketbase/client'
import type {
  Product,
  ProductCompanyFiscal,
  ProductUnit,
  SupplierProductRef,
  FiscalCatalogEntry,
} from '@/lib/product-types'

// ==========================================
// 1. PRODUTOS GERAIS
// ==========================================

export async function getProducts(): Promise<Product[]> {
  return pb.collection('products').getFullList<Product>({ sort: '-created' })
}

export async function getProduct(id: string): Promise<Product> {
  return pb.collection('products').getOne<Product>(id)
}

export async function createProduct(data: FormData | Record<string, unknown>): Promise<Product> {
  return pb.collection('products').create<Product>(data)
}

export async function updateProduct(
  id: string,
  data: FormData | Record<string, unknown>,
): Promise<Product> {
  return pb.collection('products').update<Product>(id, data)
}

export async function deleteProduct(id: string): Promise<void> {
  await pb.collection('products').delete(id)
}

export async function toggleProductActive(id: string, active: boolean): Promise<Product> {
  return pb.collection('products').update<Product>(id, { active })
}

export async function getNextProductCode(): Promise<{ number: string; sequence: number }> {
  try {
    return await pb.send('/backend/v1/product-code/next', { method: 'GET' })
  } catch {
    // Fallback seguro caso o hook não responda
    const randomSuffix = Math.floor(1000 + Math.random() * 9000)
    return { number: `PROD-${new Date().getFullYear()}-${randomSuffix}`, sequence: randomSuffix }
  }
}

export function getProductPhotoUrl(recordId: string, filename: string, thumb?: string): string {
  const url = `${import.meta.env.VITE_POCKETBASE_URL}/api/files/products/${recordId}/${filename}`
  return thumb ? `${url}?thumb=${thumb}` : url
}

export function getProductFileUrl(recordId: string, filename: string, thumb?: string): string {
  return getProductPhotoUrl(recordId, filename, thumb)
}

export async function getProductHistory(productId: string) {
  return pb.collection('audit_logs').getList(1, 50, {
    filter: `target_collection = "products" && target_id = "${productId}"`,
    sort: '-created',
  })
}

export interface ProductCostHistoryRecord {
  id: string
  product: string
  date?: string
  calculation_method?: string
  previous_cost?: number
  new_cost?: number
  quantity_in?: number
  balance_before?: number
  balance_after?: number
  reference_type?: string
  reference_id?: string
  cost_composition?: Record<string, unknown> | string
  created: string
  updated: string
}

export async function getProductCostHistory(productId: string) {
  return pb.collection('product_cost_history').getList<ProductCostHistoryRecord>(1, 50, {
    filter: `product = "${productId}"`,
    sort: '-created',
  })
}

// ==========================================
// 2. CONFIGURAÇÕES FISCAIS POR EMPRESA
// ==========================================

export async function getProductCompanyFiscals(productId: string): Promise<ProductCompanyFiscal[]> {
  return pb.collection('product_company_fiscal').getFullList<ProductCompanyFiscal>({
    filter: `product_id = "${productId}"`,
    expand: 'empresa_id',
    sort: 'created',
  })
}

export async function getProductCompanyFiscalByEmpresa(
  productId: string,
  empresaId: string,
): Promise<ProductCompanyFiscal | null> {
  try {
    const list = await pb.collection('product_company_fiscal').getList<ProductCompanyFiscal>(1, 1, {
      filter: `product_id = "${productId}" && empresa_id = "${empresaId}"`,
      expand: 'empresa_id',
    })
    return list.items[0] || null
  } catch {
    return null
  }
}

export async function saveProductCompanyFiscal(
  data: Partial<ProductCompanyFiscal>,
): Promise<ProductCompanyFiscal> {
  if (data.id) {
    return pb.collection('product_company_fiscal').update<ProductCompanyFiscal>(data.id, data)
  }
  return pb.collection('product_company_fiscal').create<ProductCompanyFiscal>(data)
}

export async function deleteProductCompanyFiscal(id: string): Promise<void> {
  await pb.collection('product_company_fiscal').delete(id)
}

// ==========================================
// 3. APRESENTAÇÕES E UNIDADES DE CONVERSÃO
// ==========================================

export async function getProductUnits(productId: string): Promise<ProductUnit[]> {
  return pb.collection('product_units').getFullList<ProductUnit>({
    filter: `product_id = "${productId}"`,
    sort: '-is_taxable_unit,created',
  })
}

export async function saveProductUnit(data: Partial<ProductUnit>): Promise<ProductUnit> {
  if (data.id) {
    return pb.collection('product_units').update<ProductUnit>(data.id, data)
  }
  return pb.collection('product_units').create<ProductUnit>(data)
}

export async function deleteProductUnit(id: string): Promise<void> {
  await pb.collection('product_units').delete(id)
}

// ==========================================
// 4. REFERÊNCIAS DE FORNECEDORES (DE-PARA)
// ==========================================

export async function getSupplierProductRefs(productId: string): Promise<SupplierProductRef[]> {
  return pb.collection('supplier_product_refs').getFullList<SupplierProductRef>({
    filter: `product_id = "${productId}"`,
    sort: 'supplier_name,supplier_product_code',
  })
}

export async function saveSupplierProductRef(
  data: Partial<SupplierProductRef>,
): Promise<SupplierProductRef> {
  if (data.id) {
    return pb.collection('supplier_product_refs').update<SupplierProductRef>(data.id, data)
  }
  return pb.collection('supplier_product_refs').create<SupplierProductRef>(data)
}

export async function deleteSupplierProductRef(id: string): Promise<void> {
  await pb.collection('supplier_product_refs').delete(id)
}

// ==========================================
// 5. CATÁLOGOS FISCAIS (NCM, CEST, CFOP, CST)
// ==========================================

export async function getFiscalCatalogs(domain?: string): Promise<FiscalCatalogEntry[]> {
  const filter = domain ? `domain = "${domain}" && active = true` : 'active = true'
  try {
    return await pb.collection('fiscal_catalogs').getFullList<FiscalCatalogEntry>({
      filter,
      sort: 'code',
    })
  } catch {
    return []
  }
}
