import pb from '@/lib/pocketbase/client'
import { SA_COLLECTIONS } from '@/services/supplier-allowance'
import { canViewSA } from '@/lib/supplier-allowance-permissions'

export interface SearchResult {
  id: string
  type: string
  label: string
  description: string
  route: string
  collection: string
}

const SEARCH_ENTITIES = [
  {
    collection: 'budget_requests',
    type: 'Orçamento',
    route: '/admin',
    fields: ['client_name', 'client_email', 'service'],
    labelField: 'client_name',
    descField: 'service',
  },
  {
    collection: 'partners',
    type: 'Parceiro',
    route: '/admin/cadastros',
    fields: ['full_name', 'company_name', 'cnpj', 'cpf', 'email'],
    labelField: 'full_name',
    descField: 'company_name',
  },
  {
    collection: 'products',
    type: 'Produto',
    route: '/admin/produtos',
    fields: ['name', 'code', 'brand', 'category'],
    labelField: 'name',
    descField: 'code',
  },
  {
    collection: 'services_offered',
    type: 'Serviço',
    route: '/admin',
    fields: ['name', 'description'],
    labelField: 'name',
    descField: 'description',
  },
  {
    collection: 'sales_orders',
    type: 'Venda',
    route: '/admin/vendas/pedidos',
    fields: ['order_number', 'client_name'],
    labelField: 'order_number',
    descField: 'client_name',
  },
  {
    collection: 'purchase_orders',
    type: 'Compra',
    route: '/admin/cadastros',
    fields: ['order_number', 'supplier_name'],
    labelField: 'order_number',
    descField: 'supplier_name',
  },
  {
    collection: SA_COLLECTIONS.agreements,
    type: 'Verba - Acordo',
    route: '/admin/verbas/acordos',
    fields: ['agreement_type', 'status', 'observations'],
    labelField: 'agreement_type',
    descField: 'status',
    permFn: canViewSA,
  },
  {
    collection: SA_COLLECTIONS.accounts,
    type: 'Verba - Conta',
    route: '/admin/verbas/conta-corrente',
    fields: ['company', 'branch'],
    labelField: 'company',
    descField: 'branch',
    permFn: canViewSA,
  },
  {
    collection: SA_COLLECTIONS.movements,
    type: 'Verba - Movimento',
    route: '/admin/verbas/movimentacoes',
    fields: ['movement_type', 'direction', 'document_number', 'observations'],
    labelField: 'movement_type',
    descField: 'document_number',
    permFn: canViewSA,
  },
  {
    collection: SA_COLLECTIONS.accruals,
    type: 'Verba - Apuração',
    route: '/admin/verbas/apuracoes',
    fields: ['competence_period', 'status'],
    labelField: 'competence_period',
    descField: 'status',
    permFn: canViewSA,
  },
  {
    collection: SA_COLLECTIONS.settlements,
    type: 'Verba - Liquidação',
    route: '/admin/verbas/liquidacoes',
    fields: ['settlement_type', 'status'],
    labelField: 'settlement_type',
    descField: 'status',
    permFn: canViewSA,
  },
]

export async function globalSearch(query: string): Promise<SearchResult[]> {
  const q = query.trim()
  if (q.length < 2) return []

  const role = (pb.authStore.record as Record<string, unknown> | null)?.role as string | undefined
  const results: SearchResult[] = []
  const filter = SEARCH_ENTITIES.map((e) => e.fields.map((f) => `${f} ~ "${q}"`).join(' || ')).join(
    ' || ',
  )

  for (const entity of SEARCH_ENTITIES) {
    if (entity.permFn && !entity.permFn(role)) continue
    try {
      const entityFilter = entity.fields.map((f) => `${f} ~ "${q.replace(/"/g, '')}"`).join(' || ')
      const records = await pb.collection(entity.collection).getList(1, 10, {
        filter: entityFilter,
      })
      for (const record of records.items) {
        results.push({
          id: record.id,
          type: entity.type,
          label: String((record as Record<string, unknown>)[entity.labelField] || '—'),
          description: String((record as Record<string, unknown>)[entity.descField] || ''),
          route: entity.route,
          collection: entity.collection,
        })
      }
    } catch {
      // collection might not exist or query might fail
    }
  }

  return results.slice(0, 50)
}
