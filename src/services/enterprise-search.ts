import pb from '@/lib/pocketbase/client'

export interface SearchResult {
  id: string
  type: string
  label: string
  description: string
  route: string
  collection: string
}

interface EntityConfig {
  collection: string
  type: string
  labelFields: string[]
  descFields: string[]
  route: string
  filterFields: string[]
}

const ENTITIES: EntityConfig[] = [
  {
    collection: 'partners',
    type: 'Parceiro',
    labelFields: ['full_name', 'company_name'],
    descFields: ['email', 'phone', 'cpf', 'cnpj'],
    route: '/admin',
    filterFields: ['full_name', 'company_name', 'cpf', 'cnpj', 'email', 'phone'],
  },
  {
    collection: 'products',
    type: 'Produto',
    labelFields: ['name'],
    descFields: ['code', 'brand', 'category'],
    route: '/admin/produtos',
    filterFields: ['name', 'code', 'ean', 'brand', 'category'],
  },
  {
    collection: 'sales_orders',
    type: 'Pedido de Venda',
    labelFields: ['order_number'],
    descFields: ['client_name', 'status'],
    route: '/admin/vendas/pedidos',
    filterFields: ['order_number', 'client_name'],
  },
  {
    collection: 'purchase_orders',
    type: 'Pedido de Compra',
    labelFields: ['order_number'],
    descFields: ['supplier_name', 'status'],
    route: '/admin',
    filterFields: ['order_number', 'supplier_name'],
  },
  {
    collection: 'budget_requests',
    type: 'Orçamento',
    labelFields: ['budget_number', 'client_name'],
    descFields: ['service', 'client_email'],
    route: '/admin',
    filterFields: ['client_name', 'budget_number', 'client_email', 'client_phone'],
  },
  {
    collection: 'services_offered',
    type: 'Serviço',
    labelFields: ['name'],
    descFields: ['description'],
    route: '/admin',
    filterFields: ['name', 'description'],
  },
  {
    collection: 'users',
    type: 'Usuário',
    labelFields: ['name'],
    descFields: ['email'],
    route: '/admin',
    filterFields: ['name', 'email'],
  },
  {
    collection: 'nfe_records',
    type: 'NF-e',
    labelFields: ['nfe_number'],
    descFields: ['client_name', 'status'],
    route: '/admin/vendas/nfe',
    filterFields: ['nfe_number', 'client_name'],
  },
  {
    collection: 'sales_invoices',
    type: 'Faturamento',
    labelFields: ['invoice_number'],
    descFields: ['client_name', 'status'],
    route: '/admin/vendas/faturamento',
    filterFields: ['invoice_number', 'client_name'],
  },
  {
    collection: 'contracts_operations',
    type: 'Contrato',
    labelFields: ['name'],
    descFields: ['status'],
    route: '/admin/vendas/contratos',
    filterFields: ['name'],
  },
  {
    collection: 'transportadoras',
    type: 'Transportadora',
    labelFields: ['name'],
    descFields: ['cnpj', 'phone'],
    route: '/admin/logistica',
    filterFields: ['name', 'razao_social', 'cnpj'],
  },
  {
    collection: 'stock_expeditions',
    type: 'Expedição',
    labelFields: ['produto_nome'],
    descFields: ['destinatario', 'status'],
    route: '/admin/estoque/expedicao',
    filterFields: ['produto_nome', 'destinatario'],
  },
  {
    collection: 'vitrine_items',
    type: 'Vitrine',
    labelFields: ['name', 'title'],
    descFields: ['type', 'subtitle'],
    route: '/admin',
    filterFields: ['name', 'title', 'subtitle'],
  },
  {
    collection: 'empresas',
    type: 'Empresa',
    labelFields: ['name', 'nome_fantasia'],
    descFields: ['cnpj', 'city'],
    route: '/admin/configuracoes/dados-empresa',
    filterFields: ['name', 'nome_fantasia', 'razao_social', 'cnpj'],
  },
  {
    collection: 'filiais',
    type: 'Filial',
    labelFields: ['name'],
    descFields: ['city', 'state'],
    route: '/admin/configuracoes/dados-empresa',
    filterFields: ['name', 'city'],
  },
  {
    collection: 'price_tables',
    type: 'Tabela de Preços',
    labelFields: ['table_name'],
    descFields: ['product_name', 'status'],
    route: '/admin/tabelas-precos',
    filterFields: ['table_name', 'product_name'],
  },
  {
    collection: 'notifications',
    type: 'Notificação',
    labelFields: ['title'],
    descFields: ['message'],
    route: '/admin/notificacoes',
    filterFields: ['title', 'message'],
  },
  {
    collection: 'bi_reports',
    type: 'Relatório BI',
    labelFields: ['name'],
    descFields: ['description', 'report_type'],
    route: '/admin/bi/saved-views',
    filterFields: ['name', 'description', 'report_type'],
  },
  {
    collection: 'supplier_allowance_agreements',
    type: 'Acordo de Verba',
    labelFields: ['agreement_type'],
    descFields: ['status', 'company'],
    route: '/admin/verbas',
    filterFields: ['agreement_type', 'status', 'company'],
  },
  {
    collection: 'supplier_allowance_accounts',
    type: 'Conta Corrente de Verba',
    labelFields: ['company'],
    descFields: ['current_balance', 'accrued_total'],
    route: '/admin/verbas',
    filterFields: ['company', 'branch'],
  },
  {
    collection: 'supplier_allowance_movements',
    type: 'Movimentação de Verba',
    labelFields: ['document_number'],
    descFields: ['movement_type', 'value', 'direction'],
    route: '/admin/verbas',
    filterFields: ['document_number', 'movement_type', 'direction'],
  },
  {
    collection: 'supplier_allowance_accruals',
    type: 'Apuração de Verba',
    labelFields: ['competence_period'],
    descFields: ['earned_value', 'status'],
    route: '/admin/verbas',
    filterFields: ['competence_period', 'status'],
  },
  {
    collection: 'supplier_allowance_settlements',
    type: 'Liquidação de Verba',
    labelFields: ['settlement_type'],
    descFields: ['settled_value', 'status'],
    route: '/admin/verbas',
    filterFields: ['settlement_type', 'status'],
  },
  {
    collection: 'supplier_allowance_appropriations',
    type: 'Apropriação de Verba',
    labelFields: ['reason'],
    descFields: ['allocated_value', 'status'],
    route: '/admin/verbas',
    filterFields: ['reason', 'status'],
  },
  {
    collection: 'supplier_allowance_consumptions',
    type: 'Consumo de Verba',
    labelFields: ['reason'],
    descFields: ['consumed_value', 'status'],
    route: '/admin/verbas',
    filterFields: ['reason', 'status'],
  },
  {
    collection: 'controladoria_dre_structure',
    type: 'Linha DRE',
    labelFields: ['label'],
    descFields: ['group', 'line_key'],
    route: '/admin/controladoria/dre',
    filterFields: ['label', 'line_key', 'group'],
  },
  {
    collection: 'controladoria_kpis',
    type: 'KPI Corporativo',
    labelFields: ['name'],
    descFields: ['category', 'formula'],
    route: '/admin/controladoria/kpis',
    filterFields: ['name', 'category', 'formula'],
  },
  {
    collection: 'controladoria_drivers',
    type: 'Driver Empresarial',
    labelFields: ['name'],
    descFields: ['category', 'type'],
    route: '/admin/controladoria/drivers',
    filterFields: ['name', 'category', 'type'],
  },
  {
    collection: 'controladoria_closing',
    type: 'Fechamento Gerencial',
    labelFields: ['period'],
    descFields: ['status', 'responsible'],
    route: '/admin/controladoria/fechamento',
    filterFields: ['period', 'status', 'responsible'],
  },
  {
    collection: 'controladoria_simulations',
    type: 'Simulação',
    labelFields: ['scenario_name'],
    descFields: ['scenario_type', 'status'],
    route: '/admin/controladoria/simulador',
    filterFields: ['scenario_name', 'scenario_type'],
  },
  {
    collection: 'controladoria_saved_views',
    type: 'Visão Salva',
    labelFields: ['name'],
    descFields: ['view_type'],
    route: '/admin/controladoria/visoes-salvas',
    filterFields: ['name', 'view_type'],
  },
  {
    collection: 'controladoria_reclassifications',
    type: 'Reclassificação',
    labelFields: ['source_account_name'],
    descFields: ['target_dre_line', 'period'],
    route: '/admin/controladoria/reclassificacoes',
    filterFields: ['source_account_name', 'source_account_code', 'period'],
  },
]

function esc(v: string): string {
  return v.replace(/"/g, '\\"')
}

function buildFilter(fields: string[], q: string): string {
  return fields.map((f) => `${f} ~ "${esc(q)}"`).join(' || ')
}

function pick(record: Record<string, unknown>, fields: string[]): string {
  for (const f of fields) {
    const v = record[f]
    if (v && typeof v === 'string' && v.trim()) return v
  }
  return ''
}

export async function globalSearch(query: string): Promise<SearchResult[]> {
  const q = query.trim()
  if (q.length < 2) return []

  const settled = await Promise.allSettled(
    ENTITIES.map(async (cfg) => {
      const filter = buildFilter(cfg.filterFields, q)
      const res = await pb.collection(cfg.collection).getList(1, 5, { filter })
      return res.items.map((rec) => {
        const r = rec as unknown as Record<string, unknown>
        return {
          id: r.id as string,
          type: cfg.type,
          label: pick(r, cfg.labelFields) || 'Sem nome',
          description: pick(r, cfg.descFields),
          route: cfg.route,
          collection: cfg.collection,
        } satisfies SearchResult
      })
    }),
  )

  const results: SearchResult[] = []
  for (const s of settled) {
    if (s.status === 'fulfilled') results.push(...s.value)
  }
  return results.slice(0, 30)
}
