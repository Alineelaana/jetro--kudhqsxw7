import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getRiskMonitors, resolveRisk } from '@/services/pricing-governance'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { formatCurrency, type PricingRiskMonitor } from '@/lib/pricing-types'
import { Loader2, ShieldAlert, CheckCircle, AlertTriangle } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

function formatDate(iso: string): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return '—'
  }
}

function getRiskColor(index: number): string {
  if (index >= 60) return '#dc2626'
  if (index >= 30) return '#f59e0b'
  return '#3b82f6'
}

export function PricingRiskMonitor() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<PricingRiskMonitor[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const load = async () => {
    try {
      const resolved = filter === 'unresolved' ? false : filter === 'resolved' ? true : undefined
      setEntries(await getRiskMonitors(resolved))
    } catch {
      setEntries([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [filter])
  useRealtime('pricing_risk_monitor', () => load())

  const handleResolve = async (id: string) => {
    try {
      await resolveRisk(id, (user?.name as string) || '')
      toast({ title: 'Risco resolvido' })
      load()
    } catch {
      toast({ title: 'Erro ao resolver', variant: 'destructive' })
    }
  }

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48 focus-visible:ring-[#005B2E]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="unresolved">Pendentes</SelectItem>
            <SelectItem value="resolved">Resolvidos</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {entries.length > 0 ? (
        <Card className="border-2 border-[#005B2E]/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#01361D] text-white">
                  <th className="text-left px-3 py-3">Produto</th>
                  <th className="text-left px-3 py-3">Usuário</th>
                  <th className="text-center px-3 py-3">Risco</th>
                  <th className="text-left px-3 py-3 hidden md:table-cell">Fatores</th>
                  <th className="text-right px-3 py-3">Alt. %</th>
                  <th className="text-left px-3 py-3">Data</th>
                  <th className="text-center px-3 py-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((r) => (
                  <tr key={r.id} className="border-b border-border hover:bg-[#005B2E]/5">
                    <td className="px-3 py-3">
                      <span className="font-medium">{r.product_name}</span>
                      <p className="text-xs text-muted-foreground">{r.product_code}</p>
                    </td>
                    <td className="px-3 py-3">{r.user_name}</td>
                    <td className="px-3 py-3 text-center">
                      <span
                        className="inline-flex items-center gap-1 px-2 py-1 rounded font-bold text-white"
                        style={{ backgroundColor: getRiskColor(r.risk_index) }}
                      >
                        <ShieldAlert className="w-3 h-3" />
                        {r.risk_index}
                      </span>
                    </td>
                    <td className="px-3 py-3 hidden md:table-cell text-xs">
                      {Array.isArray(r.risk_factors)
                        ? (r.risk_factors as string[]).join(', ')
                        : '—'}
                    </td>
                    <td className="text-right px-3 py-3">{formatCurrency(r.change_percentage)}%</td>
                    <td className="px-3 py-3 text-xs">{formatDate(r.created)}</td>
                    <td className="px-3 py-3 text-center">
                      {!r.resolved && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleResolve(r.id)}
                          className="text-emerald-600 hover:bg-emerald-50"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <AlertTriangle className="w-12 h-12 text-[#005B2E]/30 mx-auto mb-4" />
            <p className="text-lg font-bold">Nenhum risco detectado</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
