import pb from '@/lib/pocketbase/client'

/**
 * Identificador do administrador SUP padrão do ERP HURAM
 */
export const ADMIN_EMAIL = 'alineelaana@gmail.com'

/**
 * Mapeamento das coleções operacionais e o nome do campo de isolamento (empresa ou company)
 */
export const TENANT_COLLECTIONS: Record<string, 'company' | 'empresa'> = {
  // Campo "company"
  sales_orders: 'company',
  sales_invoices: 'company',
  nfe_records: 'company',
  nfce_records: 'company',
  purchase_requests: 'company',
  purchase_orders: 'company',
  purchase_invoices: 'company',
  purchase_returns: 'company',
  stock_expeditions: 'company',
  sales_returns: 'company',
  pricing_config: 'company',

  // Campo "empresa"
  financial_receivables: 'empresa',
  financial_payables: 'empresa',
  financial_movements: 'empresa',
  financial_collections: 'empresa',
  financial_cash_registers: 'empresa',
  financial_approvals: 'empresa',
  financial_closings: 'empresa',
  financial_boletos: 'empresa',
  financial_pix: 'empresa',
  financial_cards: 'empresa',
  rh_employees: 'empresa',
  rh_departments: 'empresa',
  rh_payroll: 'empresa',
  dp_admissions: 'empresa',
  dp_work_contracts: 'empresa',
  dp_labor_charges: 'empresa',
  wms_receipts: 'empresa',
  wms_putaway_tasks: 'empresa',
  wms_waves: 'empresa',
  wms_replenishments: 'empresa',
  wms_pallets: 'empresa',
  wms_volumes: 'empresa',
  logistics_routes: 'empresa',
  logistics_deliveries: 'empresa',
  logistics_freights: 'empresa',
  logistics_costs: 'empresa',
  logistics_vehicles: 'empresa',
  logistics_drivers: 'empresa',
  logistics_freight_tables: 'empresa',
  logistics_tracking: 'empresa',
  logistics_occurrences: 'empresa',
  logistics_proof_delivery: 'empresa',
  price_tables: 'empresa',
}

export interface TenantContext {
  isSup: boolean
  empresaId: string
  filialId: string
  hasMissingOrgBinding: boolean
  user: Record<string, unknown> | null
}

/**
 * Determina se o usuário atual é Superusuário (SUP) irrestrito
 */
export function isUserSup(user?: Record<string, unknown> | null): boolean {
  const u = user !== undefined ? user : (pb.authStore.record as Record<string, unknown> | null)
  if (!u) return false
  const email = String(u.email || '')
    .trim()
    .toLowerCase()
  if (email === ADMIN_EMAIL) return true
  const role = String(u.role || '')
    .trim()
    .toUpperCase()
  const perfil = String(u.perfil_acesso || '')
    .trim()
    .toUpperCase()
  return role === 'SUP' || perfil === 'SUP'
}

/**
 * Retorna os dados do vínculo organizacional do usuário autenticado
 */
export function getCurrentUserTenant(user?: Record<string, unknown> | null): TenantContext {
  const u = user !== undefined ? user : (pb.authStore.record as Record<string, unknown> | null)
  const isSup = isUserSup(u)
  const empresaId = String(u?.empresa_id || '').trim()
  const filialId = String(u?.filial_id || '').trim()
  // Um usuário não-SUP precisa ter empresa vinculada para acessar dados operacionais
  const hasMissingOrgBinding = !isSup && !empresaId

  return {
    isSup,
    empresaId,
    filialId,
    hasMissingOrgBinding,
    user: u,
  }
}

/**
 * Gera a expressão de filtro PocketBase para isolamento de multitenancy.
 *
 * - Para SUP: retorna undefined (vê tudo irrestrito).
 * - Para usuário não-SUP com vínculo: retorna `${fieldName} = "${empresaId}"`.
 * - Para usuário não-SUP SEM vínculo: retorna filtro que não casa nada ('id = "__SEM_EMPRESA__"'),
 *   garantindo que nenhuma informação operacional vaze na camada de aplicação.
 */
export function getTenantFilter(
  fieldName: 'company' | 'empresa' = 'company',
  user?: Record<string, unknown> | null,
): string | undefined {
  const { isSup, empresaId, hasMissingOrgBinding } = getCurrentUserTenant(user)

  if (isSup) {
    return undefined
  }

  if (hasMissingOrgBinding) {
    return 'id = "__SEM_EMPRESA__"'
  }

  const safeEmpresaId = empresaId.replace(/"/g, '\\"')
  return `${fieldName} = "${safeEmpresaId}"`
}

/**
 * Mescla com segurança um filtro de consulta existente com o filtro de isolamento de empresa.
 */
export function mergeTenantFilter(
  fieldName: 'company' | 'empresa' = 'company',
  existingFilter?: string,
  user?: Record<string, unknown> | null,
): string | undefined {
  const tenant = getTenantFilter(fieldName, user)
  if (!tenant) {
    return existingFilter && existingFilter.trim() ? existingFilter.trim() : undefined
  }
  if (!existingFilter || !existingFilter.trim()) {
    return tenant
  }
  return `(${existingFilter.trim()}) && (${tenant})`
}

/**
 * Mescla filtro para uma coleção conhecida, descobrindo se o campo é 'company' ou 'empresa'.
 */
export function mergeCollectionTenantFilter(
  collectionName: string,
  existingFilter?: string,
  user?: Record<string, unknown> | null,
): string | undefined {
  const fieldName = TENANT_COLLECTIONS[collectionName]
  if (!fieldName) {
    return existingFilter && existingFilter.trim() ? existingFilter.trim() : undefined
  }
  return mergeTenantFilter(fieldName, existingFilter, user)
}

/**
 * Injeta automaticamente a empresa (e filial se aplicável) do usuário logado
 * nos dados de criação do registro, evitando esquecimento manual.
 */
export function withTenantData<T extends Record<string, unknown>>(
  data: T,
  fieldName: 'company' | 'empresa' = 'company',
  user?: Record<string, unknown> | null,
): T {
  const { empresaId, filialId } = getCurrentUserTenant(user)
  if (!empresaId) return data

  const result: Record<string, unknown> = { ...data }
  if (result[fieldName] === undefined || result[fieldName] === '') {
    result[fieldName] = empresaId
  }

  if (filialId) {
    if (fieldName === 'company' && (result.branch === undefined || result.branch === '')) {
      result.branch = filialId
    }
    if (fieldName === 'empresa' && (result.filial === undefined || result.filial === '')) {
      result.filial = filialId
    }
  }

  return result as T
}

/**
 * Mensagem amigável padronizada para orientação de usuários não-SUP sem empresa vinculada
 */
export const MISSING_TENANT_NOTICE = {
  title: 'Vínculo Organizacional Pendente',
  description:
    'Sua conta de usuário ainda não está vinculada a nenhuma empresa no ERP HURAM. Solicite ao administrador do sistema a associação do seu cadastro à sua empresa (Dec Eldorado ou Gran Romano).',
}
