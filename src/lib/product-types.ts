/**
 * Tipos Oficiais da Arquitetura de Produtos e Fiscalidade — ERP Huram (Skip Cloud)
 * Baseado no Roteiro de Implementação de Produtos, Entrada e NF-e (DEC Eldorado e Gran Romano)
 */

export interface ProductVariation {
  size: string
  color: string
  price: string
}

export interface FormVariation extends ProductVariation {
  id: string
}

export interface ProductTabProps {
  form: ProductFormState
  setField: (field: keyof ProductFormState, value: unknown) => void
  errors?: Record<string, string>
}

export type ProductFiscalStatus = 'rascunho' | 'validado_fiscal'

export type ProductTipoFinalidade =
  | 'revenda'
  | 'fabricacao_propria'
  | 'materia_prima'
  | 'embalagem'
  | 'insumo'
  | 'ativo_imobilizado'
  | 'uso_consumo'
  | 'outro'

export interface Product {
  id: string
  code: string
  name: string
  description: string
  active: boolean
  tipo_finalidade?: ProductTipoFinalidade
  fiscal_status?: ProductFiscalStatus
  fiscal_validation_notes?: string
  external_reference?: string
  product_group?: string
  unit: string
  price: string
  brand: string
  category: string
  subcategory?: string
  stock: number
  min_stock: number
  max_stock: number
  cost_price?: string
  profit_margin?: string
  commission?: string
  max_discount?: string
  ncm: string
  cest?: string
  cfop?: string
  origin?: string
  cst_csosn?: string
  icms_aliquot?: string
  ipi?: string
  pis?: string
  cofins?: string
  location?: string
  lot?: string
  validity?: string
  allow_lot_control: boolean
  allow_validity_control: boolean
  allow_serial_number: boolean
  main_supplier?: string
  supplier_product_code?: string
  last_cost?: string
  last_purchase?: string
  replenishment_time?: string
  manufacturer_code?: string
  ean?: string
  photos: string[]
  main_photo?: string
  technical_sheet?: string
  documents: string[]
  internal_observations?: string
  item_type?: string
  is_industrial?: boolean
  variations?: ProductVariation[]
  created: string
  updated: string
}

/**
 * Configuração Fiscal Específica por Empresa + Produto
 */
export interface ProductCompanyFiscal {
  id?: string
  product_id: string
  empresa_id: string
  fiscal_status?: ProductFiscalStatus
  tipo_operacao_fiscal?: 'revenda' | 'fabricacao_propria' | 'industrializacao' | 'outro'
  cfop_padrao_interno?: string
  cfop_padrao_interestadual?: string
  cst_csosn?: string
  cest?: string
  codigo_beneficio_fiscal?: string
  perfil_fiscal_produto?: string
  grupo_tributario?: string
  origem_override?: string
  ncm_override?: string
  icms_aliquota?: string
  icms_base_reduzida?: string
  icms_st_mva?: string
  icms_st_aliquota?: string
  fcp_aliquota?: string
  ipi_aliquota?: string
  ipi_cst?: string
  pis_cst?: string
  pis_aliquota?: string
  cofins_cst?: string
  cofins_aliquota?: string
  ibs_aliquota?: string
  cbs_aliquota?: string
  cClassTrib?: string
  allow_lot_control?: boolean
  observacoes_fiscais?: string
  history?: Array<{
    date: string
    user: string
    field: string
    old_value: string
    new_value: string
  }>
  created?: string
  updated?: string
  // Relação expandida opcional
  expand?: {
    empresa_id?: {
      id: string
      code: string
      name: string
      nome_fantasia?: string
      razao_social?: string
      cnpj?: string
    }
  }
}

/**
 * Unidades e Apresentações do Produto (conversão, GTIN e tributável)
 */
export interface ProductUnit {
  id?: string
  product_id: string
  unit_code: string
  description?: string
  conversion_factor: string // Decimal exato em string (ex: "12.0000")
  operator: 'multiply' | 'divide'
  gtin?: string
  sem_gtin?: boolean
  is_taxable_unit?: boolean
  taxable_unit_code?: string
  taxable_factor?: string
  is_sales_unit?: boolean
  is_purchase_unit?: boolean
  active?: boolean
  created?: string
  updated?: string
}

/**
 * Referência de Produto por Fornecedor (De-Para de XML e Pedidos)
 */
export interface SupplierProductRef {
  id?: string
  product_id: string
  supplier_id: string
  supplier_name?: string
  supplier_product_code: string
  supplier_description?: string
  supplier_unit?: string
  conversion_factor: string // Fator estritamente positivo (> 0)
  operator: 'multiply' | 'divide'
  supplier_gtin?: string
  context?: string
  is_validated?: boolean
  validated_by?: string
  validated_at?: string
  created?: string
  updated?: string
}

/**
 * Catálogo Fiscal (NCM, CEST, CFOP, CST, cClassTrib, Origem)
 */
export interface FiscalCatalogEntry {
  id: string
  domain:
    | 'NCM'
    | 'CEST'
    | 'CFOP'
    | 'CST_ICMS'
    | 'CST_PIS_COFINS'
    | 'CST_IPI'
    | 'cClassTrib'
    | 'ORIGEM'
  code: string
  description: string
  vigencia_inicio?: string
  vigencia_fim?: string
  active?: boolean
  metadata?: Record<string, unknown>
}

export interface ProductFormState {
  code: string
  ean: string
  sem_gtin: boolean
  manufacturer_code: string
  name: string
  description: string
  brand: string
  category: string
  subcategory: string
  unit: string
  tipo_finalidade: ProductTipoFinalidade
  fiscal_status: ProductFiscalStatus
  external_reference: string
  product_group: string
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
  fiscal_validation_notes: string
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

export function getInitialFormState(product?: Product | null): ProductFormState {
  const ean = product?.ean || ''
  return {
    code: product?.code || '',
    ean,
    sem_gtin: !ean || ean === 'SEM GTIN',
    manufacturer_code: product?.manufacturer_code || '',
    name: product?.name || '',
    description: product?.description || '',
    brand: product?.brand || '',
    category: product?.category || '',
    subcategory: product?.subcategory || '',
    unit: product?.unit || 'UN',
    tipo_finalidade: (product?.tipo_finalidade as ProductTipoFinalidade) || 'revenda',
    fiscal_status: product?.fiscal_status || 'rascunho',
    external_reference: product?.external_reference || '',
    product_group: product?.product_group || '',
    active: product?.active !== false,
    cost_price: product?.cost_price || '',
    price: product?.price || '',
    profit_margin: product?.profit_margin || '',
    commission: product?.commission || '',
    max_discount: product?.max_discount || '',
    ncm: product?.ncm || '',
    cest: product?.cest || '',
    cfop: product?.cfop || '',
    origin: product?.origin || '0',
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
    fiscal_validation_notes: product?.fiscal_validation_notes || '',
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
