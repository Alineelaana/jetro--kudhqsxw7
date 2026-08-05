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
import { getCrmReportData } from '@/services/crm'
import { useRealtime } from '@/hooks/use-realtime'
import { CRM_REPORT_TYPES } from '@/lib/crm-types'
import { Loader2, FileText, FileSpreadsheet, Sparkles } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { exportCsv } from '@/lib/csv-export'
import { callCrmAI } from '@/services/crm'

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

export function CrmReports() {
  const [data, setData] = useState<Record<string, unknown> | null>(null)
  const [selected, setSelected] = useState(CRM_REPORT_TYPES[0])
  const [aiLoading, setAiLoading] = useState(false)

  const load = async () => setData(await getCrmReportData())
  useEffect(() => {
    load()
  }, [])
  useRealtime('crm_leads', () => load())
  useRealtime('crm_opportunities', () => load())
  useRealtime('crm_proposals', () => load())

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

  const handleExportPdf = () => {
    const win = window.open('', '_blank')
    if (!win) {
      toast({ title: 'Pop-up bloqueado', variant: 'destructive' })
      return
    }
    win.document.write(
      `<html><head><title>Relatório CRM - ${selected}</title></head><body><h1>Relatório: ${selected}</h1><p>Gerado em: ${new Date().toLocaleString('pt-BR')}</p><p>Total de Leads: ${totalLeads}<br>Oportunidades Ganhas: ${wonOpps.length}<br>Taxa de Conversão: ${conversionRate}%<br>Valor do Funil: R$ ${Number(data.funnelValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p></body></html>`,
    )
    win.document.close()
    setTimeout(() => win.print(), 500)
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
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
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
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportPdf}
          className="border-[#005B2E] text-[#005B2E]"
        >
          <FileText className="w-4 h-4 mr-2" /> PDF
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportExcel}
          className="border-[#005B2E] text-[#005B2E]"
        >
          <FileSpreadsheet className="w-4 h-4 mr-2" /> Excel
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleAI}
          disabled={aiLoading}
          className="border-purple-500 text-purple-600"
        >
          {aiLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 mr-2" />
          )}{' '}
          Análise IA
        </Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Leads', value: totalLeads },
          { label: 'Oportunidades', value: opps.length },
          { label: 'Ganhas', value: wonOpps.length },
          { label: 'Conversão', value: `${conversionRate}%` },
        ].map((c) => (
          <Card key={c.label} className="border-2 border-[#005B2E]/20">
            <CardContent className="py-3 px-4">
              <p className="text-2xl font-black">{c.value}</p>
              <p className="text-xs text-muted-foreground">{c.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-2 border-[#005B2E]/20">
          <CardHeader>
            <CardTitle className="text-base">Leads por Origem</CardTitle>
          </CardHeader>
          <CardContent>
            {leadsBySource.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">Sem dados.</p>
            ) : (
              <ChartContainer config={{}} className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={leadsBySource}>
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 9 }}
                      angle={-20}
                      textAnchor="end"
                      height={50}
                    />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#005B2E" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
        <Card className="border-2 border-[#005B2E]/20">
          <CardHeader>
            <CardTitle className="text-base">Leads por Situação</CardTitle>
          </CardHeader>
          <CardContent>
            {leadsByStatus.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">Sem dados.</p>
            ) : (
              <ChartContainer config={{}} className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={leadsByStatus}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {leadsByStatus.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>
      <Card className="border-2 border-[#005B2E]/20">
        <CardHeader>
          <CardTitle className="text-base">Resumo do Funil</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Valor do Funil</p>
              <p className="font-bold text-[#005B2E]">
                R${' '}
                {Number(data.funnelValue || 0).toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Oportunidades Perdidas</p>
              <p className="font-bold text-red-600">{lostOpps.length}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Propostas Enviadas</p>
              <p className="font-bold">
                {(data.proposals as Array<Record<string, unknown>>)?.length || 0}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Atividades</p>
              <p className="font-bold">
                {(data.activities as Array<Record<string, unknown>>)?.length || 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
