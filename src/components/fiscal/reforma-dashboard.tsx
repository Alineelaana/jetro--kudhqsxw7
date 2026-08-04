import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  getReformConfigs,
  getReformClassifications,
  getReformCredits,
  getReformSimulations,
  getReformValidations,
} from '@/services/fiscal'
import { useRealtime } from '@/hooks/use-realtime'
import { Loader2, TrendingUp, AlertTriangle, FileCheck, DollarSign, Percent } from 'lucide-react'

export function ReformaDashboard() {
  const [data, setData] = useState<Record<string, unknown[]>>({})
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const [configs, classes, credits, sims, vals] = await Promise.all([
        getReformConfigs().catch(() => []),
        getReformClassifications().catch(() => []),
        getReformCredits().catch(() => []),
        getReformSimulations().catch(() => []),
        getReformValidations().catch(() => []),
      ])
      setData({ configs, classes, credits, sims, vals })
    } catch {
      /* noop */
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('reform_configs', () => load())
  useRealtime('reform_credits', () => load())

  const stats = useMemo(() => {
    const d = data
    const arr = (k: string) => (d[k] || []) as Record<string, unknown>[]
    const creditsAvail = arr('credits').filter((c) => c.situacao === 'Disponivel')
    const totalCBS = creditsAvail.reduce((s, c) => s + parseFloat((c.cbs as string) || '0'), 0)
    const totalIBS = creditsAvail.reduce((s, c) => s + parseFloat((c.ibs as string) || '0'), 0)
    const totalSel = creditsAvail.reduce(
      (s, c) => s + parseFloat((c.imposto_seletivo as string) || '0'),
      0,
    )
    const totalDebit = arr('credits').reduce(
      (s, c) => s + parseFloat((c.debito_gerado as string) || '0'),
      0,
    )
    const unclassified = arr('classes').filter((c) => c.situacao === 'Nao Classificado').length
    const valErrors = arr('vals').filter((v) =>
      ['Com Erro', 'Aguardando Correcao'].includes(v.status as string),
    ).length
    const valPending = arr('vals').filter((v) => v.status === 'Aguardando Correcao').length
    return {
      configs: arr('configs').length,
      classes: arr('classes').length,
      sims: arr('sims').length,
      totalCBS,
      totalIBS,
      totalSel,
      totalDebit,
      unclassified,
      valErrors,
      valPending,
    }
  }, [data])

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  const cards = [
    { icon: FileCheck, label: 'Configurações Ativas', value: stats.configs, color: '#005B2E' },
    { icon: FileCheck, label: 'Produtos Classificados', value: stats.classes, color: '#C89B3C' },
    {
      icon: AlertTriangle,
      label: 'Sem Classificação',
      value: stats.unclassified,
      color: '#ef4444',
    },
    { icon: TrendingUp, label: 'Simulações', value: stats.sims, color: '#3b82f6' },
    {
      icon: DollarSign,
      label: 'CBS (Créditos)',
      value: `R$ ${stats.totalCBS.toFixed(2)}`,
      color: '#005B2E',
    },
    {
      icon: DollarSign,
      label: 'IBS (Créditos)',
      value: `R$ ${stats.totalIBS.toFixed(2)}`,
      color: '#C89B3C',
    },
    {
      icon: DollarSign,
      label: 'Imposto Seletivo',
      value: `R$ ${stats.totalSel.toFixed(2)}`,
      color: '#8b5cf6',
    },
    {
      icon: DollarSign,
      label: 'Débitos Gerados',
      value: `R$ ${stats.totalDebit.toFixed(2)}`,
      color: '#ef4444',
    },
    { icon: AlertTriangle, label: 'Documentos c/ Erro', value: stats.valErrors, color: '#ef4444' },
    {
      icon: AlertTriangle,
      label: 'Aguardando Correção',
      value: stats.valPending,
      color: '#f59e0b',
    },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {cards.map((c, i) => (
          <Card key={i} className="border-2" style={{ borderColor: `${c.color}33` }}>
            <CardContent className="py-3 px-4 flex items-center gap-2">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${c.color}1A` }}
              >
                <c.icon className="w-4 h-4" style={{ color: c.color }} />
              </div>
              <div className="min-w-0">
                <p className="text-base font-black text-foreground truncate">{c.value}</p>
                <p className="text-[10px] text-muted-foreground">{c.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-2 border-[#C89B3C]/30">
        <CardHeader>
          <CardTitle className="text-base text-[#C89B3C] flex items-center gap-2">
            <Percent className="w-4 h-4" /> Impacto Estimado da Reforma
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-[#005B2E]/5">
              <p className="text-xs text-muted-foreground">Saldo de Créditos (CBS+IBS+Seletivo)</p>
              <p className="text-2xl font-black text-[#005B2E]">
                R$ {(stats.totalCBS + stats.totalIBS + stats.totalSel).toFixed(2)}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-[#ef4444]/5">
              <p className="text-xs text-muted-foreground">Débitos Gerados</p>
              <p className="text-2xl font-black text-red-600">R$ {stats.totalDebit.toFixed(2)}</p>
            </div>
            <div className="p-4 rounded-lg bg-[#C89B3C]/5">
              <p className="text-xs text-muted-foreground">Saldo Estimado</p>
              <p className="text-2xl font-black text-[#C89B3C]">
                R${' '}
                {(stats.totalCBS + stats.totalIBS + stats.totalSel - stats.totalDebit).toFixed(2)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
