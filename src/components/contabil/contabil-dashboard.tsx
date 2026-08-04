import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
  getLancamentos,
  getLotes,
  getReconciliations,
  getPendingIntegrations,
  getPeriods,
} from '@/services/contabil'
import { useRealtime } from '@/hooks/use-realtime'
import { Loader2 } from 'lucide-react'

interface KpiData {
  totalLanc: number
  pendentes: number
  divergencia: number
  lotesAprov: number
  debitos: number
  creditos: number
  resultado: number
  periodosAberto: number
  periodosFechado: number
  semConciliacao: number
  integPendentes: number
}

export function ContabilDashboard() {
  const [kpi, setKpi] = useState<KpiData | null>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const [lanc, lotes, recon, pendInt, periods] = await Promise.all([
        getLancamentos().catch(() => []),
        getLotes().catch(() => []),
        getReconciliations().catch(() => []),
        getPendingIntegrations().catch(() => []),
        getPeriods().catch(() => []),
      ])
      const debitos = (lanc as any[])
        .filter((l) => l.status === 'Contabilizado')
        .reduce((s, l) => s + parseFloat(l.total_debitos || l.valor || '0'), 0)
      const creditos = (lanc as any[])
        .filter((l) => l.status === 'Contabilizado')
        .reduce((s, l) => s + parseFloat(l.total_creditos || l.valor || '0'), 0)
      setKpi({
        totalLanc: (lanc as any[]).length,
        pendentes: (lanc as any[]).filter((l) =>
          ['Rascunho', 'Aguardando Conferência', 'Aguardando Aprovação'].includes(l.status),
        ).length,
        divergencia: (lanc as any[]).filter(
          (l) =>
            Math.abs(parseFloat(l.total_debitos || '0') - parseFloat(l.total_creditos || '0')) >
            0.01,
        ).length,
        lotesAprov: (lotes as any[]).filter((l) =>
          ['Em Digitação', 'Aguardando Conferência', 'Aguardando Aprovação'].includes(l.status),
        ).length,
        debitos,
        creditos,
        resultado: debitos - creditos,
        periodosAberto: (periods as any[]).filter((p) =>
          ['Aberto', 'Em Conferência', 'Aguardando Aprovação'].includes(p.status),
        ).length,
        periodosFechado: (periods as any[]).filter((p) => p.status === 'Fechado').length,
        semConciliacao: (recon as any[]).filter((r) => r.status === 'Pendente').length,
        integPendentes: (pendInt as any[]).filter((p) => p.status === 'Pendente').length,
      })
    } catch {
      setKpi(null)
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('contabil_lancamentos', () => load())
  useRealtime('contabil_lotes', () => load())
  useRealtime('contabil_pending_integrations', () => load())

  if (loading || !kpi)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  const cards = [
    { label: 'Lançamentos no Período', value: kpi.totalLanc, color: '#005B2E' },
    { label: 'Lançamentos Pendentes', value: kpi.pendentes, color: '#f59e0b' },
    { label: 'Lançamentos com Divergência', value: kpi.divergencia, color: '#ef4444' },
    { label: 'Lotes Aguardando Aprovação', value: kpi.lotesAprov, color: '#f59e0b' },
    { label: 'Débitos no Período', value: fmt(kpi.debitos), color: '#005B2E' },
    { label: 'Créditos no Período', value: fmt(kpi.creditos), color: '#C89B3C' },
    {
      label: 'Resultado do Período',
      value: fmt(kpi.resultado),
      color: kpi.resultado >= 0 ? '#10b981' : '#ef4444',
    },
    { label: 'Períodos em Aberto', value: kpi.periodosAberto, color: '#3b82f6' },
    { label: 'Períodos Fechados', value: kpi.periodosFechado, color: '#6b7280' },
    { label: 'Contas sem Conciliação', value: kpi.semConciliacao, color: '#f59e0b' },
    { label: 'Integrações Pendentes', value: kpi.integPendentes, color: '#ef4444' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {cards.map((c) => (
        <Card key={c.label} className="border-2" style={{ borderColor: `${c.color}33` }}>
          <CardContent className="py-3 px-4">
            <p className="text-xl font-black" style={{ color: c.color }}>
              {c.value}
            </p>
            <p className="text-xs text-muted-foreground">{c.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
