import pb from '@/lib/pocketbase/client'
import type { BIFilters, GenericCenterData } from '@/lib/bi-types'

type Rec = Record<string, unknown>

function parseNum(v: unknown): number {
  const n = parseFloat(String(v || '0'))
  return isNaN(n) ? 0 : n
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

export async function getMarketingIntelligence(): Promise<GenericCenterData> {
  const [requests, jobs, pieces, media, attributions] = await Promise.all([
    safeList('mk_requests'),
    safeList('mk_jobs'),
    safeList('mk_content_pieces'),
    safeList('mk_media_campaigns'),
    safeList('mk_result_attributions'),
  ])
  const totalInvestment = media.reduce((s, m) => s + parseNum(m.investment), 0)
  const totalRevenue = attributions.reduce((s, a) => s + parseNum(a.revenue), 0)
  const totalLeads = media.reduce((s, m) => s + (Number(m.leads) || 0), 0)
  const totalConversions = media.reduce((s, m) => s + (Number(m.conversions) || 0), 0)
  const roi = totalInvestment > 0 ? ((totalRevenue - totalInvestment) / totalInvestment) * 100 : 0
  const cpl = totalLeads > 0 ? totalInvestment / totalLeads : 0
  const cac = totalConversions > 0 ? totalInvestment / totalConversions : 0
  const pendingPieces = pieces.filter((p) =>
    ['criacao', 'revisao_marketing', 'compliance', 'gestor'].includes(p.status as string),
  )
  const lateJobs = jobs.filter((j) => {
    const dl = j.deadline as string
    return (
      dl && new Date(dl) < new Date() && !['encerrado', 'cancelado'].includes(j.status as string)
    )
  })
  return {
    stats: [
      { label: 'Solicitações', value: String(requests.length), color: 'text-blue-600' },
      {
        label: 'Jobs Ativos',
        value: String(
          jobs.filter((j) => !['encerrado', 'cancelado'].includes(j.status as string)).length,
        ),
        color: 'text-cyan-600',
      },
      { label: 'Peças Pendentes', value: String(pendingPieces.length), color: 'text-amber-600' },
      { label: 'Jobs Atrasados', value: String(lateJobs.length), color: 'text-red-600' },
      { label: 'Investimento', value: `R$ ${totalInvestment.toFixed(2)}`, color: 'text-[#005B2E]' },
      {
        label: 'Receita Atribuída',
        value: `R$ ${totalRevenue.toFixed(2)}`,
        color: 'text-emerald-600',
      },
      {
        label: 'ROI',
        value: `${roi.toFixed(1)}%`,
        color: roi >= 0 ? 'text-green-600' : 'text-red-600',
      },
      { label: 'Leads', value: String(totalLeads), color: 'text-purple-600' },
      { label: 'CPL', value: `R$ ${cpl.toFixed(2)}`, color: 'text-orange-600' },
      { label: 'CAC', value: `R$ ${cac.toFixed(2)}`, color: 'text-indigo-600' },
    ],
    tables: [
      {
        title: 'Campanhas de Mídia por Canal',
        columns: [
          { key: 'channel', label: 'Canal' },
          { key: 'count', label: 'Campanhas' },
          { key: 'investment', label: 'Investimento' },
        ],
        rows: Object.entries(
          media.reduce<Record<string, { count: number; investment: number }>>((acc, m) => {
            const k = String(m.channel || 'N/A')
            if (!acc[k]) acc[k] = { count: 0, investment: 0 }
            acc[k].count++
            acc[k].investment += parseNum(m.investment)
            return acc
          }, {}),
        ).map(([channel, data]) => ({
          channel,
          count: data.count,
          investment: `R$ ${data.investment.toFixed(2)}`,
        })),
      },
      {
        title: 'Solicitações por Tipo',
        columns: [
          { key: 'type', label: 'Tipo' },
          { key: 'count', label: 'Quantidade' },
        ],
        rows: groupCount(requests, 'type'),
      },
      {
        title: 'Jobs por Status',
        columns: [
          { key: 'status', label: 'Status' },
          { key: 'count', label: 'Quantidade' },
        ],
        rows: groupCount(jobs, 'status'),
      },
    ],
  }
}
