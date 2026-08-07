import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Package, Layers, Cog, Route, DollarSign, FileCheck } from 'lucide-react'
import {
  getIndustrialItems,
  getBomVersions,
  getProductionResources,
  getProductionRoutes,
  getIndustrialCosts,
} from '@/services/industry'
import { useRealtime } from '@/hooks/use-realtime'

interface Stats {
  items: number
  boms: number
  resources: number
  routes: number
  costs: number
}

export function IndustryDashboard() {
  const [stats, setStats] = useState<Stats>({
    items: 0,
    boms: 0,
    resources: 0,
    routes: 0,
    costs: 0,
  })
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const [items, boms, resources, routes, costs] = await Promise.all([
        getIndustrialItems(),
        getBomVersions(),
        getProductionResources(),
        getProductionRoutes(),
        getIndustrialCosts(),
      ])
      setStats({
        items: items.length,
        boms: boms.length,
        resources: resources.length,
        routes: routes.length,
        costs: costs.length,
      })
    } catch {
      /* ignore */
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])
  useRealtime('bom_versions', () => load())
  useRealtime('production_resources', () => load())

  const cards = [
    { label: 'Itens Industriais', value: stats.items, icon: Package, color: 'text-[#005B2E]' },
    { label: 'BOM / Estruturas', value: stats.boms, icon: Layers, color: 'text-blue-600' },
    { label: 'Especificações', value: '—', icon: FileCheck, color: 'text-purple-600' },
    { label: 'Recursos Produtivos', value: stats.resources, icon: Cog, color: 'text-orange-600' },
    { label: 'Roteiros', value: stats.routes, icon: Route, color: 'text-cyan-600' },
    {
      label: 'Custos Industriais',
      value: stats.costs,
      icon: DollarSign,
      color: 'text-emerald-600',
    },
  ]

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-[#005B2E] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Card key={c.label} className="border-2 border-[#005B2E]/10">
            <CardContent className="flex items-center gap-3 py-4">
              <c.icon className={`w-8 h-8 ${c.color}`} />
              <div>
                <p className="text-2xl font-black text-foreground">{c.value}</p>
                <p className="text-xs text-muted-foreground">{c.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-6">
          <h3 className="text-lg font-bold text-[#005B2E] mb-2">Fase 0: Engenharia & Produtos</h3>
          <p className="text-sm text-muted-foreground">
            Fundação estrutural do Módulo Indústria. Estabelece o Catálogo de Itens como entidade
            canônica, com especificações versionadas, BOM/estruturas, roteiros de produção, recursos
            produtivos e custos industriais. Todos os dados são versionados e rastreáveis — versões
            ativadas são imutáveis.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
