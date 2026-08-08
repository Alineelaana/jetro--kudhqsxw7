import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getSaBiData, type SaBiData } from '@/services/sa-bi-bridge'
import { checkVerbasAlerts } from '@/services/verbas-audit'
import { formatBRL } from '@/lib/supplier-allowance-types'
import {
  Loader2,
  BarChart3,
  Bell,
  TrendingUp,
  TrendingDown,
  Wallet,
  ShoppingCart,
  Megaphone,
  Target,
  AlertTriangle,
  CheckCircle,
  Percent,
} from 'lucide-react'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/pocketbase/errors'

const ICONS: Record<string, typeof TrendingUp> = {
  'trending-up': TrendingUp,
  wallet: Wallet,
  'shopping-cart': ShoppingCart,
  megaphone: Megaphone,
  target: Target,
  'check-circle': CheckCircle,
  'alert-triangle': AlertTriangle,
  percent: Percent,
}

export function SaCockpit() {
  const [biData, setBiData] = useState<SaBiData | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkingAlerts, setCheckingAlerts] = useState(false)

  useEffect(() => {
    getSaBiData()
      .then((data) => setBiData(data))
      .catch(() => setBiData(null))
      .finally(() => setLoading(false))
  }, [])

  const handleAlertCheck = async () => {
    setCheckingAlerts(true)
    try {
      const result = await checkVerbasAlerts()
      toast.success(`${result.alerts_created} alerta(s) verificado(s)`)
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
    setCheckingAlerts(false)
  }

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  if (!biData)
    return (
      <Card className="border-2 border-dashed border-[#005B2E]/30">
        <CardContent className="py-16 text-center">
          <BarChart3 className="w-12 h-12 text-[#005B2E]/30 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-[#005B2E]">Cockpit Executivo de Verbas</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            Nao foi possivel carregar os dados do Corporate Ledger. Verifique sua conexao.
          </p>
        </CardContent>
      </Card>
    )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-[#005B2E]">Cockpit Executivo de Verbas</h3>
          <p className="text-xs text-muted-foreground">Dados oficiais do Corporate Ledger Engine</p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleAlertCheck}
          disabled={checkingAlerts}
          className="border-[#005B2E] text-[#005B2E]"
        >
          {checkingAlerts ? (
            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
          ) : (
            <Bell className="w-4 h-4 mr-1" />
          )}
          Verificar Alertas
        </Button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {biData.kpis.map((kpi, i) => {
          const Icon = ICONS[kpi.icon] || BarChart3
          return (
            <Card key={i} className="border-l-4 border-[#005B2E]">
              <CardContent className="py-2 px-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] text-muted-foreground">{kpi.label}</p>
                  <Icon className="w-3 h-3 text-[#005B2E]" />
                </div>
                <p className="text-sm font-black text-[#005B2E]">{kpi.value}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>
      {biData.alerts.length > 0 && (
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="py-3">
            <h4 className="text-sm font-bold text-[#005B2E] mb-2 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" /> Alertas
            </h4>
            <div className="space-y-1">
              {biData.alerts.map((alert, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 text-xs ${alert.severity === 'critical' ? 'text-red-600' : alert.severity === 'warning' ? 'text-amber-600' : 'text-blue-600'}`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${alert.severity === 'critical' ? 'bg-red-500' : alert.severity === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}`}
                  />
                  {alert.message}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      {biData.recentMovements.length > 0 && (
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="py-3">
            <h4 className="text-sm font-bold text-[#005B2E] mb-2">Movimentacoes Recentes</h4>
            <div className="space-y-1">
              {biData.recentMovements.map((m, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-xs border-b border-border py-1"
                >
                  <span className="capitalize font-medium">{m.movement_type}</span>
                  <span className={m.direction === 'credito' ? 'text-emerald-600' : 'text-red-600'}>
                    {m.direction === 'credito' ? '+' : '-'} R$ {formatBRL(m.value)}
                  </span>
                  <span className="text-muted-foreground">
                    {m.created ? new Date(m.created).toLocaleDateString('pt-BR') : '—'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
