import pb from '@/lib/pocketbase/client'
import type { BIFilters, GenericCenterData } from '@/lib/bi-types'

type Rec = Record<string, unknown>

function parseNum(v: unknown): number {
  const n = parseFloat(String(v || '0'))
  return isNaN(n) ? 0 : n
}

function applyFilters(records: Rec[], filters: BIFilters, dateField = 'created'): Rec[] {
  return records.filter((r) => {
    if (filters.empresa && r.company && r.company !== filters.empresa) return false
    if (filters.filial && r.branch && r.branch !== filters.filial) return false
    if (filters.entity) {
      const e = filters.entity.toLowerCase()
      const fields = [
        'client_name',
        'name',
        'cliente',
        'supplier_name',
        'full_name',
        'company_name',
        'seller_name',
        'salesperson_name',
        'description',
        'title',
        'product_name',
        'produto_nome',
      ]
      if (!fields.some((f) => r[f] && String(r[f]).toLowerCase().includes(e))) return false
    }
    if (filters.area) {
      const a = filters.area.toLowerCase()
      const areaFields = ['area', 'module', 'category', 'department', 'type', 'sector']
      const hasAreaField = areaFields.some((f) => r[f] !== undefined)
      if (hasAreaField && !areaFields.some((f) => r[f] && String(r[f]).toLowerCase().includes(a)))
        return false
    }
    if (
      filters.startDate &&
      r[dateField] &&
      new Date(r[dateField] as string) < new Date(filters.startDate)
    )
      return false
    if (
      filters.endDate &&
      r[dateField] &&
      new Date(r[dateField] as string) > new Date(filters.endDate + 'T23:59:59')
    )
      return false
    return true
  })
}

async function safeList(collection: string): Promise<Rec[]> {
  try {
    return (await pb.collection(collection).getFullList()) as Rec[]
  } catch {
    return []
  }
}

function groupCount(records: Rec[], field: string): Array<Record<string, unknown>> {
  const map: Record<string, number> = {}
  records.forEach((r) => {
    const k = String(r[field] || 'N/A')
    map[k] = (map[k] || 0) + 1
  })
  return Object.entries(map).map(([key, count]) => ({ [field]: key, count }))
}

export async function getFinancialIntelligence(
  filters: BIFilters = {},
): Promise<GenericCenterData> {
  const [rec, pay, mov] = await Promise.all([
    safeList('financial_receivables'),
    safeList('financial_payables'),
    safeList('financial_movements'),
  ])
  const rf = applyFilters(rec, filters)
  const pf = applyFilters(pay, filters)
  const mf = applyFilters(mov, filters)
  const totalRec = rf.reduce((s, r) => s + parseNum(r.value), 0)
  const totalPay = pf.reduce((s, p) => s + parseNum(p.value), 0)
  const entradas = mf.reduce((s, m) => s + parseNum(m.entrada), 0)
  const saidas = mf.reduce((s, m) => s + parseNum(m.saida), 0)
  const now = new Date()
  const overdue = rf.filter(
    (r) =>
      r.due_date &&
      new Date(r.due_date as string) < now &&
      !['Recebido', 'Cancelado'].includes(r.status as string),
  )
  const abcClients = groupCount(rf, 'cliente')
    .sort((a, b) => Number(b.count) - Number(a.count))
    .slice(0, 10)
  return {
    stats: [
      { label: 'Total a Receber', value: `R$ ${totalRec.toFixed(2)}`, color: 'text-emerald-600' },
      { label: 'Total a Pagar', value: `R$ ${totalPay.toFixed(2)}`, color: 'text-red-600' },
      {
        label: 'Fluxo de Caixa',
        value: `R$ ${(entradas - saidas).toFixed(2)}`,
        color: entradas - saidas >= 0 ? 'text-[#005B2E]' : 'text-red-600',
      },
      { label: 'Recebíveis Vencidos', value: String(overdue.length), color: 'text-amber-600' },
      { label: 'Movimentações', value: String(mf.length), color: 'text-blue-600' },
      {
        label: 'Inadimplência',
        value:
          totalRec > 0
            ? `${((overdue.reduce((s, r) => s + parseNum(r.value), 0) / totalRec) * 100).toFixed(1)}%`
            : '0%',
        color: 'text-red-600',
      },
    ],
    tables: [
      {
        title: 'Curva ABC - Clientes',
        columns: [
          { key: 'cliente', label: 'Cliente' },
          { key: 'count', label: 'Títulos' },
        ],
        rows: abcClients,
      },
      {
        title: 'Recebíveis por Status',
        columns: [
          { key: 'status', label: 'Status' },
          { key: 'count', label: 'Quantidade' },
        ],
        rows: groupCount(rf, 'status'),
      },
    ],
  }
}

export async function getIndustrialIntelligence(
  filters: BIFilters = {},
): Promise<GenericCenterData> {
  const orders = await safeList('production_orders')
  const f = applyFilters(orders, filters)
  const completed = f.filter((o) => ['concluida', 'fechada'].includes(o.status as string))
  const inProgress = f.filter((o) =>
    ['em_producao', 'iniciada', 'liberada'].includes(o.status as string),
  )
  const late = f.filter(
    (o) =>
      o.end_date &&
      new Date(o.end_date as string) < new Date() &&
      !['concluida', 'fechada', 'cancelada'].includes(o.status as string),
  )
  const machines = await safeList('industrial_machines')
  const costs = await safeList('industrial_costs')
  return {
    stats: [
      { label: 'Total de Ordens', value: String(f.length), color: 'text-blue-600' },
      { label: 'Concluídas', value: String(completed.length), color: 'text-emerald-600' },
      { label: 'Em Produção', value: String(inProgress.length), color: 'text-cyan-600' },
      { label: 'Atrasadas', value: String(late.length), color: 'text-red-600' },
      {
        label: 'Pontualidade',
        value: f.length > 0 ? `${(((f.length - late.length) / f.length) * 100).toFixed(1)}%` : '0%',
        color: 'text-[#005B2E]',
      },
      { label: 'Máquinas', value: String(machines.length), color: 'text-purple-600' },
    ],
    tables: [
      {
        title: 'Ordens por Status',
        columns: [
          { key: 'status', label: 'Status' },
          { key: 'count', label: 'Quantidade' },
        ],
        rows: groupCount(f, 'status'),
      },
      {
        title: 'Custos Industriais',
        columns: [
          { key: 'product_name', label: 'Produto' },
          { key: 'total_cost', label: 'Custo' },
        ],
        rows: costs
          .slice(0, 10)
          .map((c) => ({ product_name: c.product_name || '—', total_cost: c.total_cost || '—' })),
      },
    ],
  }
}

export async function getStockIntelligence(filters: BIFilters = {}): Promise<GenericCenterData> {
  const products = await safeList('products')
  const fp = applyFilters(products, filters)
  const lowStock = fp.filter((p) => (Number(p.stock) || 0) <= (Number(p.min_stock) || 0))
  const outOfStock = fp.filter((p) => (Number(p.stock) || 0) <= 0)
  const noMovement = fp.filter((p) => !p.stock || Number(p.stock) === 0)
  const totalValue = fp.reduce((s, p) => s + parseNum(p.cost_price) * (Number(p.stock) || 0), 0)
  const abc = fp
    .map((p) => ({ name: p.name || '—', value: parseNum(p.cost_price) * (Number(p.stock) || 0) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)
  return {
    stats: [
      { label: 'Total de Produtos', value: String(fp.length), color: 'text-blue-600' },
      { label: 'Estoque Baixo', value: String(lowStock.length), color: 'text-amber-600' },
      { label: 'Sem Estoque', value: String(outOfStock.length), color: 'text-red-600' },
      {
        label: 'Capital em Estoque',
        value: `R$ ${totalValue.toFixed(2)}`,
        color: 'text-[#005B2E]',
      },
      { label: 'Sem Movimento', value: String(noMovement.length), color: 'text-purple-600' },
      {
        label: 'Alertas',
        value: String(lowStock.length + outOfStock.length),
        color: 'text-red-600',
      },
    ],
    tables: [
      {
        title: 'Curva ABC - Produtos',
        columns: [
          { key: 'name', label: 'Produto' },
          { key: 'value', label: 'Valor' },
        ],
        rows: abc.map((a) => ({ name: a.name, value: `R$ ${a.value.toFixed(2)}` })),
      },
      {
        title: 'Produtos Críticos',
        columns: [
          { key: 'name', label: 'Produto' },
          { key: 'stock', label: 'Estoque' },
          { key: 'min_stock', label: 'Mínimo' },
        ],
        rows: lowStock.slice(0, 10).map((p) => ({
          name: p.name || '—',
          stock: String(p.stock ?? 0),
          min_stock: String(p.min_stock ?? 0),
        })),
      },
    ],
  }
}

export async function getLogisticsIntelligence(
  filters: BIFilters = {},
): Promise<GenericCenterData> {
  const [deliveries, vehicles, expeditions, occurrences] = await Promise.all([
    safeList('logistics_deliveries'),
    safeList('logistics_vehicles'),
    safeList('stock_expeditions'),
    safeList('logistics_occurrences'),
  ])
  const fd = applyFilters(deliveries, filters)
  const fv = applyFilters(vehicles, filters)
  const fe = applyFilters(expeditions, filters)
  const fo = applyFilters(occurrences, filters)
  const delivered = fd.filter((d) =>
    ['Entregue', 'Concluída', 'Concluido'].includes(d.status as string),
  )
  const inTransit = fd.filter((d) =>
    ['Em Trânsito', 'Em Transito', 'Rota'].includes(d.status as string),
  )
  const late = fd.filter(
    (d) =>
      d.delivery_date &&
      new Date(d.delivery_date as string) < new Date() &&
      !['Entregue', 'Concluída', 'Concluido', 'Cancelada'].includes(d.status as string),
  )
  const onTime = fd
    .filter((d) => ['Entregue', 'Concluída', 'Concluido'].includes(d.status as string))
    .filter((d) => {
      if (!d.delivery_date || !d.estimated_date) return true
      return new Date(d.delivery_date as string) <= new Date(d.estimated_date as string)
    })
  const availableVehicles = fv.filter((v) =>
    ['Disponível', 'Disponivel', 'Ativo'].includes(v.situacao as string),
  )
  const maintenanceVehicles = fv.filter((v) =>
    ['Em Manutenção', 'Em Manutencao'].includes(v.situacao as string),
  )
  const openOccurrences = fo.filter(
    (o) => !['Resolvida', 'Fechada', 'Concluída'].includes(o.status as string),
  )
  return {
    stats: [
      { label: 'Total de Entregas', value: String(fd.length), color: 'text-blue-600' },
      { label: 'Entregues', value: String(delivered.length), color: 'text-emerald-600' },
      { label: 'Em Trânsito', value: String(inTransit.length), color: 'text-cyan-600' },
      { label: 'Atrasadas', value: String(late.length), color: 'text-red-600' },
      {
        label: 'OTIF',
        value:
          delivered.length > 0 ? `${((onTime.length / delivered.length) * 100).toFixed(1)}%` : '0%',
        color: 'text-[#005B2E]',
      },
      {
        label: 'Veículos Disponíveis',
        value: String(availableVehicles.length),
        color: 'text-purple-600',
      },
      {
        label: 'Veículos em Manutenção',
        value: String(maintenanceVehicles.length),
        color: 'text-amber-600',
      },
      {
        label: 'Ocorrências em Aberto',
        value: String(openOccurrences.length),
        color: 'text-red-600',
      },
    ],
    tables: [
      {
        title: 'Entregas por Status',
        columns: [
          { key: 'status', label: 'Status' },
          { key: 'count', label: 'Quantidade' },
        ],
        rows: groupCount(fd, 'status'),
      },
      {
        title: 'Veículos por Situação',
        columns: [
          { key: 'situacao', label: 'Situação' },
          { key: 'count', label: 'Quantidade' },
        ],
        rows: groupCount(fv, 'situacao'),
      },
      {
        title: 'Expedições por Status',
        columns: [
          { key: 'status', label: 'Status' },
          { key: 'count', label: 'Quantidade' },
        ],
        rows: groupCount(fe, 'status'),
      },
    ],
  }
}

export async function getFiscalIntelligence(filters: BIFilters = {}): Promise<GenericCenterData> {
  const nfe = await safeList('nfe_records')
  const f = applyFilters(nfe, filters)
  const authorized = f.filter((n) => n.status === 'Autorizada')
  const rejected = f.filter((n) => n.status === 'Rejeitada')
  const totalValue = f.reduce((s, n) => s + parseNum(n.total_value), 0)
  return {
    stats: [
      { label: 'Total NF-e', value: String(f.length), color: 'text-blue-600' },
      { label: 'Autorizadas', value: String(authorized.length), color: 'text-emerald-600' },
      { label: 'Rejeitadas', value: String(rejected.length), color: 'text-red-600' },
      { label: 'Valor Total', value: `R$ ${totalValue.toFixed(2)}`, color: 'text-[#005B2E]' },
    ],
    tables: [
      {
        title: 'NF-e por Status',
        columns: [
          { key: 'status', label: 'Status' },
          { key: 'count', label: 'Quantidade' },
        ],
        rows: groupCount(f, 'status'),
      },
    ],
  }
}

export async function getPurchasingIntelligence(
  filters: BIFilters = {},
): Promise<GenericCenterData> {
  const orders = await safeList('purchase_orders')
  const f = applyFilters(orders, filters)
  const totalValue = f.reduce((s, o) => s + parseNum(o.total_value), 0)
  const suppliers = groupCount(f, 'supplier_name')
    .sort((a, b) => Number(b.count) - Number(a.count))
    .slice(0, 10)
  return {
    stats: [
      { label: 'Total de Pedidos', value: String(f.length), color: 'text-blue-600' },
      { label: 'Valor Total', value: `R$ ${totalValue.toFixed(2)}`, color: 'text-[#005B2E]' },
      {
        label: 'Aprovados',
        value: String(f.filter((o) => o.status === 'Aprovado').length),
        color: 'text-emerald-600',
      },
      {
        label: 'Cancelados',
        value: String(f.filter((o) => o.status === 'Cancelado').length),
        color: 'text-red-600',
      },
    ],
    tables: [
      {
        title: 'Pedidos por Fornecedor',
        columns: [
          { key: 'supplier_name', label: 'Fornecedor' },
          { key: 'count', label: 'Pedidos' },
        ],
        rows: suppliers,
      },
    ],
  }
}

export async function getCrmIntelligence(filters: BIFilters = {}): Promise<GenericCenterData> {
  const leads = await safeList('crm_leads')
  const opps = await safeList('crm_opportunities')
  const fl = applyFilters(leads, filters)
  const fo = applyFilters(opps, filters)
  const won = fo.filter((o) => o.status === 'Ganha')
  const lost = fo.filter((o) => o.status === 'Perdida')
  const pipeline = fo.filter((o) => !['Ganha', 'Perdida', 'Cancelada'].includes(o.status as string))
  const pipelineValue = pipeline.reduce((s, o) => s + parseNum(o.estimated_value), 0)
  return {
    stats: [
      { label: 'Total de Leads', value: String(fl.length), color: 'text-blue-600' },
      { label: 'Oportunidades', value: String(fo.length), color: 'text-cyan-600' },
      { label: 'Ganhas', value: String(won.length), color: 'text-emerald-600' },
      { label: 'Pipeline', value: `R$ ${pipelineValue.toFixed(2)}`, color: 'text-[#005B2E]' },
      { label: 'Perdidas', value: String(lost.length), color: 'text-red-600' },
      {
        label: 'Conversão',
        value: fo.length > 0 ? `${((won.length / fo.length) * 100).toFixed(1)}%` : '0%',
        color: 'text-purple-600',
      },
    ],
    tables: [
      {
        title: 'Leads por Status',
        columns: [
          { key: 'status', label: 'Status' },
          { key: 'count', label: 'Quantidade' },
        ],
        rows: groupCount(fl, 'status'),
      },
      {
        title: 'Oportunidades por Status',
        columns: [
          { key: 'status', label: 'Status' },
          { key: 'count', label: 'Quantidade' },
        ],
        rows: groupCount(fo, 'status'),
      },
    ],
  }
}

export async function getTradeIntelligence(filters: BIFilters = {}): Promise<GenericCenterData> {
  const campaigns = await safeList('vr_campaigns')
  const goals = await safeList('vr_goals')
  const fc = applyFilters(campaigns, filters)
  const fg = applyFilters(goals, filters)
  const activeCampaigns = fc.filter((c) => c.status === 'ativa')
  return {
    stats: [
      { label: 'Campanhas', value: String(fc.length), color: 'text-blue-600' },
      {
        label: 'Campanhas Ativas',
        value: String(activeCampaigns.length),
        color: 'text-emerald-600',
      },
      { label: 'Metas', value: String(fg.length), color: 'text-cyan-600' },
      {
        label: 'Metas Ativas',
        value: String(fg.filter((g) => g.status === 'ativa').length),
        color: 'text-[#005B2E]',
      },
    ],
    tables: [
      {
        title: 'Campanhas por Status',
        columns: [
          { key: 'status', label: 'Status' },
          { key: 'count', label: 'Quantidade' },
        ],
        rows: groupCount(fc, 'status'),
      },
    ],
  }
}

export async function getRhIntelligence(filters: BIFilters = {}): Promise<GenericCenterData> {
  const employees = await safeList('rh_employees')
  const trainings = await safeList('rh_trainings')
  const fe = applyFilters(employees, filters)
  const ft = applyFilters(trainings, filters)
  const active = fe.filter((e) => e.situacao === 'Ativo' || e.status === 'Ativo')
  const onLeave = fe.filter((e) => e.situacao === 'Afastado' || e.status === 'Afastado')
  return {
    stats: [
      { label: 'Total de Colaboradores', value: String(fe.length), color: 'text-blue-600' },
      { label: 'Ativos', value: String(active.length), color: 'text-emerald-600' },
      { label: 'Afastados', value: String(onLeave.length), color: 'text-amber-600' },
      { label: 'Treinamentos', value: String(ft.length), color: 'text-cyan-600' },
      {
        label: 'Turnover',
        value: fe.length > 0 ? `${((onLeave.length / fe.length) * 100).toFixed(1)}%` : '0%',
        color: 'text-red-600',
      },
    ],
    tables: [
      {
        title: 'Colaboradores por Status',
        columns: [
          { key: 'status', label: 'Status' },
          { key: 'count', label: 'Quantidade' },
        ],
        rows: groupCount(fe, 'status'),
      },
    ],
  }
}

export async function getQualityIntelligence(filters: BIFilters = {}): Promise<GenericCenterData> {
  const nc = await safeList('quality_nonconformities')
  const checklist = await safeList('quality_checklists')
  const fnc = applyFilters(nc, filters)
  const open = fnc.filter((n) => !['Resolvida', 'Fechada'].includes(n.status as string))
  return {
    stats: [
      { label: 'Não Conformidades', value: String(fnc.length), color: 'text-blue-600' },
      { label: 'Em Aberto', value: String(open.length), color: 'text-amber-600' },
      {
        label: 'Resolvidas',
        value: String(
          fnc.filter((n) => ['Resolvida', 'Fechada'].includes(n.status as string)).length,
        ),
        color: 'text-emerald-600',
      },
      { label: 'Checklists', value: String(checklist.length), color: 'text-cyan-600' },
    ],
    tables: [
      {
        title: 'NCs por Status',
        columns: [
          { key: 'status', label: 'Status' },
          { key: 'count', label: 'Quantidade' },
        ],
        rows: groupCount(fnc, 'status'),
      },
    ],
  }
}

export async function getMaintenanceIntelligence(
  filters: BIFilters = {},
): Promise<GenericCenterData> {
  const schedules = await safeList('maintenance_schedules')
  const vehicles = await safeList('logistics_vehicles')
  const fs = applyFilters(schedules, filters)
  const fv = applyFilters(vehicles, filters)
  const pending = fs.filter((s) => !['Concluída', 'Cancelada'].includes(s.status as string))
  return {
    stats: [
      { label: 'Manutenções', value: String(fs.length), color: 'text-blue-600' },
      { label: 'Pendentes', value: String(pending.length), color: 'text-amber-600' },
      {
        label: 'Concluídas',
        value: String(fs.filter((s) => s.status === 'Concluída').length),
        color: 'text-emerald-600',
      },
      { label: 'Veículos', value: String(fv.length), color: 'text-cyan-600' },
      {
        label: 'Veículos em Manutenção',
        value: String(fv.filter((v) => v.situacao === 'Em Manutenção').length),
        color: 'text-red-600',
      },
    ],
    tables: [
      {
        title: 'Manutenções por Status',
        columns: [
          { key: 'status', label: 'Status' },
          { key: 'count', label: 'Quantidade' },
        ],
        rows: groupCount(fs, 'status'),
      },
    ],
  }
}

export async function getVrIntelligence(filters: BIFilters = {}): Promise<GenericCenterData> {
  const apurations = await safeList('vr_apurations')
  const goals = await safeList('vr_goals')
  const campaigns = await safeList('vr_campaigns')
  const fa = applyFilters(apurations, filters)
  const fg = applyFilters(goals, filters)
  const fc = applyFilters(campaigns, filters)
  const totalCommission = fa.reduce((s, a) => s + parseNum(a.commission_value), 0)
  return {
    stats: [
      {
        label: 'Total de Comissões',
        value: `R$ ${totalCommission.toFixed(2)}`,
        color: 'text-[#005B2E]',
      },
      { label: 'Apurações', value: String(fa.length), color: 'text-blue-600' },
      {
        label: 'Metas Ativas',
        value: String(fg.filter((g) => g.status === 'ativa').length),
        color: 'text-cyan-600',
      },
      {
        label: 'Campanhas Ativas',
        value: String(fc.filter((c) => c.status === 'ativa').length),
        color: 'text-emerald-600',
      },
    ],
    tables: [
      {
        title: 'Apurações por Status',
        columns: [
          { key: 'status', label: 'Status' },
          { key: 'count', label: 'Quantidade' },
        ],
        rows: groupCount(fa, 'status'),
      },
    ],
  }
}
