import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChartContainer } from '@/components/ui/chart'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { getCrmReportData, callCrmAI } from '@/services/crm'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { CRM_REPORT_TYPES } from '@/lib/crm-types'
import {
  Loader2,
  FileText,
  FileSpreadsheet,
  Sparkles,
  Users,
  Briefcase,
  Trophy,
  Percent,
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { exportCsv } from '@/lib/csv-export'
import { generateCrmReportPdf } from '@/lib/crm-report-pdf'

const COLORS = [
  '#005B2E',
  '#C89B3C',
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899',
  '#ef4444',
]

const ROLE_LABELS: Record<string, string> = {
  SUP: 'Super Admin',
  PADRAO: 'Padrão',
  SDR: 'SDR',
  Vendedor: 'Vendedor',
  FINANCEIRO: 'Financeiro',
  COMERCIAL: 'Comercial',
}

export function CrmReports() {
  const [data, setData] = useState<Record<string, unknown> | null>(null)
  const [selected, setSelected] = useState(CRM_REPORT_TYPES[0])
  const [aiLoading, setAiLoading] = useState(false)
  const { user, userRole } = useAuth()

  const load = async () => setData(await getCrmReportData())
  useEffect(() => {
    load()
  }, [])
  useRealtime('crm_leads', () => load())
  useRealtime('crm_opportunities', () => load())
  useRealtime('crm_proposals', () => load())

  const userName = (user?.name as string) || 'Usuário'
  const roleLabel = ROLE_LABELS[userRole] || userRole

  if (!data)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  const leadsBySource = (data.leadsBySource as Array<Record<string, unknown>>) || []
  const leadsByStatus = (data.leadsByStatus as Array<Record<string, unknown>>) || []
  const opps = (data.opps as Array<Record<string, unknown>>) || []
  const wonOpps = (data.wonOpps as Array<Record<string, unknown>>) || []
  const lostOpps = (data.lostOpps as Array<Record<string, unknown>>) || []
  const totalLeads = (data.leads as Array<Record<string, unknown>>)?.length || 0
  const conversionRate = totalLeads > 0 ? ((wonOpps.length / totalLeads) * 100).toFixed(1) : '0'
  const proposalsCount = (data.proposals as Array<Record<string, unknown>>)?.length || 0
  const activitiesCount = (data.activities as Array<Record<string, unknown>>)?.length || 0
  const funnelValue = Number(data.funnelValue || 0)

  const summaryCards = [
    { label: 'Total de Leads', value: totalLeads, icon: Users, color: '#005B2E' },
    { label: 'Oportunidades', value: opps.length, icon: Briefcase, color: '#3b82f6' },
    { label: 'Ganhas', value: wonOpps.length, icon: Trophy, color: '#10b981' },
    { label: 'Conversão', value: `${conversionRate}%`, icon: Percent, color: '#C89B3C' },
  ]

  const handleExportPdf = () => {
    try {
      generateCrmReportPdf({
        reportType: selected,
        totalLeads,
        totalOpps: opps.length,
        wonOpps: wonOpps.length,
        conversionRate,
        funnelValue,
        leadsBySource: leadsBySource.map((r) => ({ name: String(r.name), count: Number(r.count) })),
        leadsByStatus: leadsByStatus.map((r) => ({ name: String(r.name), count: Number(r.count) })),
        lostOpps: lostOpps.length,
        proposalsCount,
        activitiesCount,
        userName,
        userRole: roleLabel,
      })
    } catch {
      toast({ title: 'Pop-up bloqueado', variant: 'destructive' })
    }
  }

  const handleExportExcel = () => {
    const rows = leadsBySource.map((r) => [String(r.name), Number(r.count)])
    exportCsv(
      `relatorio_crm_${selected.toLowerCase().replace(/\s/g, '_')}`,
      ['Categoria', 'Quantidade'],
      rows,
    )
  }

  const handleAI = async () => {
    setAiLoading(true)
    try {
      const result = await callCrmAI('summarize', { report: selected, data })
      toast({
        title: 'Análise IA',
        description: String(result.summary || result.message || 'Análise concluída'),
      })
    } catch {
      toast({ title: 'IA indisponível', variant: 'destructive' })
    }
    setAiLoading(false)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm focus-visible:ring-[#005B2E]"
          >
            {CRM_REPORT_TYPES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPdf}
            className="border-[#005B2E] text-[#005B2E] hover:bg-[#005B2E]/5"
          >
            <FileText className="w-4 h-4 mr-2" /> PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportExcel}
            className="border-[#005B2E] text-[#005B2E] hover:bg-[#005B2E]/5"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" /> Excel
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAI}
            disabled={aiLoading}
            className="border-purple-500 text-purple-600 hover:bg-purple-50"
          >
            {aiLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}{' '}
            Análise IA
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {summaryCards.map((c) => {
          const Icon = c.icon
          return (
            <Card
              key={c.label}
              className="border-t-2 border-t-[#005B2E]/30 shadow-sm transition-shadow hover:shadow-md"
              style={{ borderTopColor: c.color }}
            >
              <CardContent className="py-4 px-4 flex items-center gap-3">
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0"
                  style={{ backgroundColor: `${c.color}15` }}
                >
                  <Icon className="w-5 h-5" style={{ color: c.color }} />
                </div>
                <div className="min-w-0">
                  <p className="text-2xl font-black leading-none">{c.value}</p>
                  <p className="text-xs text-muted-foreground mt-1 truncate">{c.label}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-2 border-[#005B2E]/10 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-[#005B2E]">Leads por Origem</CardTitle>
          </CardHeader>
          <CardContent>
            {leadsBySource.length === 0 ? (
              <p className="text-center text-muted-foreground py-12 text-sm">Sem dados.</p>
            ) : (
              <ChartContainer config={{}} className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={leadsBySource}
                    margin={{ top: 8, right: 8, bottom: 8, left: -12 }}
                  >
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 9, fill: '#666' }}
                      angle={-20}
                      textAnchor="end"
                      height={55}
                    />
                    <YAxis tick={{ fontSize: 10, fill: '#666' }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 8,
                        border: '1px solid #e0e0e0',
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="count" fill="#005B2E" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
        <Card className="border-2 border-[#005B2E]/10 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-[#005B2E]">
              Leads por Situação
            </CardTitle>
          </CardHeader>
          <CardContent>
            {leadsByStatus.length === 0 ? (
              <p className="text-center text-muted-foreground py-12 text-sm">Sem dados.</p>
            ) : (
              <ChartContainer config={{}} className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={leadsByStatus}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={30}
                      label={{ fontSize: 10 }}
                    >
                      {leadsByStatus.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: 8,
                        border: '1px solid #e0e0e0',
                        fontSize: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-2 border-[#005B2E]/10 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-[#005B2E]">Resumo do Funil</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Valor do Funil
              </p>
              <p className="text-lg font-bold text-[#005B2E]">
                R$ {funnelValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Oportunidades Perdidas
              </p>
              <p className="text-lg font-bold text-red-600">{lostOpps.length}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Propostas Enviadas
              </p>
              <p className="text-lg font-bold text-blue-600">{proposalsCount}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Atividades</p>
              <p className="text-lg font-bold text-[#C89B3C]">{activitiesCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
