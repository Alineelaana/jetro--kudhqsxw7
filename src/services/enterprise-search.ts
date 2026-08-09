import pb from '@/lib/pocketbase/client'
import { SA_COLLECTIONS } from '@/services/supplier-allowance'
import { canViewSA } from '@/lib/supplier-allowance-permissions'
import { canViewControladoria } from '@/lib/controladoria-permissions'

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
    collection: 'rh_employees',
    type: 'Colaborador',
    route: '/admin/rh/colaboradores',
    fields: ['nome_completo', 'cpf', 'matricula', 'cargo', 'departamento'],
    labelField: 'nome_completo',
    descField: 'cargo',
  },
  {
    collection: 'rh_positions',
    type: 'Cargo',
    route: '/admin/rh/cargos',
    fields: ['name', 'code', 'departamento'],
    labelField: 'name',
    descField: 'departamento',
  },
  {
    collection: 'rh_positions_slots',
    type: 'Posição',
    route: '/admin/rh/posicoes',
    fields: ['cargo_name', 'employee_name', 'departamento'],
    labelField: 'cargo_name',
    descField: 'employee_name',
  },
  {
    collection: 'rh_competencies',
    type: 'Competência',
    route: '/admin/rh/competencias',
    fields: ['name', 'code', 'description', 'categoria'],
    labelField: 'name',
    descField: 'categoria',
  },
  {
    collection: 'rh_performance_evaluations',
    type: 'Avaliação',
    route: '/admin/rh/avaliacao-competencias',
    fields: ['employee_name', 'cargo', 'periodo', 'avaliador'],
    labelField: 'employee_name',
    descField: 'periodo',
  },
  {
    collection: 'rh_pdi',
    type: 'PDI',
    route: '/admin/rh/pdi',
    fields: ['employee_name', 'cargo_atual', 'cargo_desejado', 'objetivo_geral'],
    labelField: 'employee_name',
    descField: 'cargo_desejado',
  },
  {
    collection: 'rh_succession_plans',
    type: 'Sucessão',
    route: '/admin/rh/sucessao',
    fields: ['posicao_critica', 'cargo_name', 'employee_name'],
    labelField: 'posicao_critica',
    descField: 'employee_name',
  },
  {
    collection: 'rh_trainings',
    type: 'Treinamento',
    route: '/admin/rh/treinamentos',
    fields: ['name', 'categoria', 'instrutor'],
    labelField: 'name',
    descField: 'categoria',
  },
  {
    collection: 'rh_feedback',
    type: 'Feedback',
    route: '/admin/rh/feedback',
    fields: ['employee_name', 'autor_name', 'contexto'],
    labelField: 'employee_name',
    descField: 'tipo',
  },
  {
    collection: 'rh_recognitions',
    type: 'Reconhecimento',
    route: '/admin/rh/reconhecimento',
    fields: ['employee_name', 'titulo', 'descricao'],
    labelField: 'titulo',
    descField: 'employee_name',
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
  {
    collection: 'controladoria_dre_structure',
    type: 'DRE',
    route: '/admin/controladoria/dre',
    fields: ['line_key', 'label', 'group'],
    labelField: 'label',
    descField: 'group',
    permFn: canViewControladoria,
  },
  {
    collection: 'controladoria_kpis',
    type: 'KPI Controladoria',
    route: '/admin/controladoria/kpis',
    fields: ['name', 'formula', 'category', 'responsible'],
    labelField: 'name',
    descField: 'category',
    permFn: canViewControladoria,
  },
  {
    collection: 'controladoria_closing',
    type: 'Fechamento',
    route: '/admin/controladoria/fechamento',
    fields: ['period', 'status', 'responsible'],
    labelField: 'period',
    descField: 'status',
    permFn: canViewControladoria,
  },
  {
    collection: 'controladoria_budgets',
    type: 'Orçado',
    route: '/admin/controladoria/budget',
    fields: ['period', 'dre_line_key', 'value'],
    labelField: 'dre_line_key',
    descField: 'period',
    permFn: canViewControladoria,
  },
  {
    collection: 'controladoria_simulations',
    type: 'Simulação',
    route: '/admin/controladoria/simulador',
    fields: ['scenario_name', 'scenario_type', 'status'],
    labelField: 'scenario_name',
    descField: 'scenario_type',
    permFn: canViewControladoria,
  },
  {
    collection: 'controladoria_consolidation',
    type: 'Consolidação',
    route: '/admin/controladoria/consolidacao',
    fields: ['group_name', 'period', 'status'],
    labelField: 'group_name',
    descField: 'period',
    permFn: canViewControladoria,
  },
  {
    collection: 'controladoria_result_centers',
    type: 'Centro de Resultado',
    route: '/admin/controladoria/centros-resultado',
    fields: ['code', 'name', 'type', 'responsible'],
    labelField: 'name',
    descField: 'code',
    permFn: canViewControladoria,
  },
  {
    collection: 'contabil_lancamentos',
    type: 'Lançamento Contábil',
    route: '/admin/controladoria/dre',
    fields: ['conta_debito', 'conta_credito', 'historico', 'valor'],
    labelField: 'historico',
    descField: 'conta_debito',
    permFn: canViewControladoria,
  },
  {
    collection: 'plano_contas',
    type: 'Plano de Contas',
    route: '/admin/controladoria',
    fields: ['code', 'name', 'type', 'grupo'],
    labelField: 'name',
    descField: 'code',
    permFn: canViewControladoria,
  },
  {
    collection: 'mk_requests',
    type: 'Solicitação Marketing',
    route: '/admin/marketing',
    fields: ['title', 'request_number', 'objective', 'briefing'],
    labelField: 'title',
    descField: 'request_number',
  },
  {
    collection: 'mk_jobs',
    type: 'Job Marketing',
    route: '/admin/marketing',
    fields: ['title', 'job_number', 'description'],
    labelField: 'title',
    descField: 'job_number',
  },
  {
    collection: 'mk_content_pieces',
    type: 'Peça Marketing',
    route: '/admin/marketing',
    fields: ['title', 'description', 'channel'],
    labelField: 'title',
    descField: 'channel',
  },
  {
    collection: 'mk_brand_assets',
    type: 'Asset de Marca',
    route: '/admin/marketing',
    fields: ['name', 'brand', 'category', 'description'],
    labelField: 'name',
    descField: 'brand',
  },
  {
    collection: 'mk_media_campaigns',
    type: 'Campanha de Mídia',
    route: '/admin/marketing',
    fields: ['name', 'channel', 'agency', 'objective'],
    labelField: 'name',
    descField: 'channel',
  },
  {
    collection: 'mk_result_attributions',
    type: 'Atribuição Marketing',
    route: '/admin/marketing',
    fields: ['campaign_name', 'channel', 'lead_name'],
    labelField: 'campaign_name',
    descField: 'channel',
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
