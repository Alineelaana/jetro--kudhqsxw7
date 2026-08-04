import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ShoppingCart,
  Boxes,
  Package,
  Briefcase,
  Cog,
  Bell,
  Shield,
  Clock,
  TrendingDown,
  ArrowRight,
  Loader2,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { getApprovals } from '@/services/pricing'
import { getPriceTablesList } from '@/services/price-tables'
import { getUnreadCount } from '@/services/notifications'
import { useRealtime } from '@/hooks/use-realtime'

const shortcuts = [
  { to: '/admin/vendas', label: 'Vendas', icon: ShoppingCart, color: 'text-blue-600 bg-blue-50' },
  { to: '/admin/estoque', label: 'Estoque', icon: Boxes, color: 'text-amber-600 bg-amber-50' },
  {
    to: '/admin/produtos',
    label: 'Produtos',
    icon: Package,
    color: 'text-purple-600 bg-purple-50',
  },
  {
    to: '/admin/tabelas-precos',
    label: 'Tabelas de Preços',
    icon: TrendingDown,
    color: 'text-emerald-600 bg-emerald-50',
  },
  {
    to: '/admin/configuracoes',
    label: 'Configurações',
    icon: Cog,
    color: 'text-gray-600 bg-gray-50',
  },
  { to: '/admin/notificacoes', label: 'Notificações', icon: Bell, color: 'text-red-600 bg-red-50' },
]

export function PortalDashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [kpis, setKpis] = useState({
    pendingApprovals: 0,
    unreadNotifs: 0,
    expiringTables: 0,
    activeTables: 0,
  })

  const loadData = useCallback(async () => {
    try {
      const [approvals, tables, unread] = await Promise.all([
        getApprovals('pending').catch(() => []),
        getPriceTablesList().catch(() => []),
        getUnreadCount().catch(() => 0),
      ])
      const now = new Date()
      const sevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      const active = (tables as Record<string, unknown>[]).filter((t) => t.status === 'ativa')
      const expiring = active.filter((t) => {
        if (!t.data_final) return false
        const end = new Date(t.data_final as string)
        return end >= now && end <= sevenDays
      })
      setKpis({
        pendingApprovals: (approvals as unknown[]).length,
        unreadNotifs: unread as number,
        expiringTables: expiring.length,
        activeTables: active.length,
      })
    } catch {
      /* noop */
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('pricing_approvals', () => loadData())
  useRealtime('notifications', () => loadData())
  useRealtime('price_tables', () => loadData())

  const kpiCards = [
    {
      label: 'Aprovações Pendentes',
      value: kpis.pendingApprovals,
      icon: Clock,
      color: 'text-amber-600',
    },
    {
      label: 'Notificações Não Lidas',
      value: kpis.unreadNotifs,
      icon: Bell,
      color: 'text-red-600',
    },
    {
      label: 'Tabelas Expirando',
      value: kpis.expiringTables,
      icon: Shield,
      color: 'text-orange-600',
    },
    {
      label: 'Tabelas Ativas',
      value: kpis.activeTables,
      icon: TrendingDown,
      color: 'text-emerald-600',
    },
  ]

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground">
              Bem-vindo, {(user?.name as string) || 'Usuário'}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Acesse os módulos do sistema rapidamente
            </p>
          </div>
          <Link to="/admin">
            <Button className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold">
              <Shield className="w-4 h-4 mr-2" /> Área Administrativa
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              {kpiCards.map((kpi) => {
                const Icon = kpi.icon
                return (
                  <Card key={kpi.label} className="border-2 border-[#005B2E]/10">
                    <CardContent className="p-4 flex items-center gap-3">
                      <Icon className={`w-8 h-8 ${kpi.color}`} />
                      <div>
                        <p className="text-2xl font-black text-foreground">{kpi.value}</p>
                        <p className="text-xs text-muted-foreground">{kpi.label}</p>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <h2 className="text-lg font-bold text-foreground mb-3">Atalhos Rápidos</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
              {shortcuts.map((s) => {
                const Icon = s.icon
                return (
                  <Link key={s.to} to={s.to}>
                    <Card className="border-2 border-[#005B2E]/10 hover:border-[#005B2E]/40 transition-colors group">
                      <CardContent className="p-4 flex flex-col items-center gap-2">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-semibold text-foreground text-center">
                          {s.label}
                        </span>
                        <ArrowRight className="w-3 h-3 text-[#005B2E] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>

            {kpis.pendingApprovals > 0 && (
              <Card className="border-2 border-amber-300 bg-amber-50/50">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-amber-600" />
                    <div>
                      <p className="font-bold text-foreground">Aprovações de Preço Pendentes</p>
                      <p className="text-sm text-muted-foreground">
                        {kpis.pendingApprovals} aprovação(ões) aguardando análise
                      </p>
                    </div>
                  </div>
                  <Link to="/admin/notificacoes">
                    <Button variant="outline" size="sm" className="border-amber-400 text-amber-700">
                      Ver Detalhes
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </main>
  )
}
