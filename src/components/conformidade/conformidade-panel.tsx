import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getConformidadeData, type ConformidadeAlert } from '@/services/conformidade'
import { useRealtime } from '@/hooks/use-realtime'
import { cn } from '@/lib/utils'
import { Loader2, Search, AlertTriangle, AlertCircle, Shield, Info, Check } from 'lucide-react'

const SEVERITY_CONFIG: Record<string, { color: string; icon: typeof Shield }> = {
  Crítica: { color: 'text-red-600 bg-red-50', icon: Shield },
  Alta: { color: 'text-orange-600 bg-orange-50', icon: AlertTriangle },
  Média: { color: 'text-amber-600 bg-amber-50', icon: AlertCircle },
  Baixa: { color: 'text-blue-600 bg-blue-50', icon: Info },
}

export function ConformidadePanel() {
  const [data, setData] = useState<{
    alerts: ConformidadeAlert[]
    totalEmployees: number
    compliancePercentage: number
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [moduleFilter, setModuleFilter] = useState('all')

  const load = async () => {
    try {
      setData(await getConformidadeData())
    } catch {
      setData(null)
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('sst_aso', () => load())
  useRealtime('rh_employees', () => load())

  if (loading || !data) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )
  }

  const filtered = data.alerts.filter((a) => {
    if (moduleFilter !== 'all' && a.module !== moduleFilter) return false
    const q = search.toLowerCase().trim()
    if (!q) return true
    return (
      (a.description || '').toLowerCase().includes(q) ||
      (a.employee_name || '').toLowerCase().includes(q)
    )
  })

  const bySeverity = (sev: string) => data.alerts.filter((a) => a.severity === sev).length
  const byModule = (mod: string) => data.alerts.filter((a) => a.module === mod).length

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-2 border-[#005B2E]/30 shadow-lg">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="text-5xl font-black text-[#005B2E]">{data.compliancePercentage}%</div>
            <div className="text-sm text-muted-foreground mt-1">Índice de Conformidade</div>
            <div className="w-full mt-3 h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#005B2E] transition-all duration-500"
                style={{ width: `${data.compliancePercentage}%` }}
              />
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              {data.totalEmployees} colaboradores
            </div>
          </CardContent>
        </Card>
        <div className="sm:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(['Crítica', 'Alta', 'Média', 'Baixa'] as const).map((sev) => {
            const cfg = SEVERITY_CONFIG[sev]
            const Icon = cfg.icon
            return (
              <Card key={sev} className="border-2 border-[#005B2E]/20 shadow-md">
                <CardContent
                  className={cn('flex flex-col items-center justify-center p-4', cfg.color)}
                >
                  <Icon className="w-6 h-6 mb-1" />
                  <div className="text-2xl font-black">{bySeverity(sev)}</div>
                  <div className="text-xs font-medium">{sev}</div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar alertas..."
            className="pl-10 focus-visible:ring-[#005B2E]"
          />
        </div>
        <div className="flex gap-1">
          {['all', 'RH', 'DP', 'SST'].map((m) => (
            <Button
              key={m}
              size="sm"
              variant={moduleFilter === m ? 'default' : 'outline'}
              onClick={() => setModuleFilter(m)}
              className={
                moduleFilter === m
                  ? 'bg-[#005B2E] hover:bg-[#01361D] text-white'
                  : 'border-[#005B2E]/30 text-[#005B2E]'
              }
            >
              {m === 'all' ? 'Todos' : m} ({m === 'all' ? data.alerts.length : byModule(m)})
            </Button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-12 text-center">
            <Check className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <p className="text-lg font-bold">Tudo em conformidade!</p>
            <p className="text-sm text-muted-foreground mt-1">Nenhum alerta pendente.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((alert, i) => {
            const cfg = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG['Baixa']
            const Icon = cfg.icon
            return (
              <Card
                key={i}
                className="border-2 border-[#005B2E]/10 shadow-sm hover:shadow-md transition-shadow"
              >
                <CardContent className="flex items-center gap-3 p-3">
                  <div
                    className={cn(
                      'w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
                      cfg.color,
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{alert.description}</p>
                    {alert.employee_name && (
                      <p className="text-xs text-muted-foreground">{alert.employee_name}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold px-2 py-1 rounded bg-gray-100 text-gray-600">
                      {alert.module}
                    </span>
                    <span className={cn('text-xs font-bold px-2 py-1 rounded', cfg.color)}>
                      {alert.severity}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
