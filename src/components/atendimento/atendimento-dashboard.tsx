import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getAtendimentoStats, getAtendimentos } from '@/services/atendimento'
import { useRealtime } from '@/hooks/use-realtime'
import { STATUS_BADGE_COLORS, type AtendimentoRecord } from '@/lib/atendimento-types'
import { Plus, AlertCircle, CheckCircle, Clock, FolderOpen, ListChecks } from 'lucide-react'

export function AtendimentoDashboard() {
  const [stats, setStats] = useState({
    abertos: 0,
    emAtendimento: 0,
    pendentes: 0,
    finalizados: 0,
    slaVencido: 0,
    slaDentro: 0,
  })
  const [recent, setRecent] = useState<AtendimentoRecord[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const [s, r] = await Promise.all([getAtendimentoStats(), getAtendimentos()])
    setStats(s)
    setRecent(r.slice(0, 8))
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('service_centers', () => load())

  const cards = [
    { label: 'Abertos', value: stats.abertos, icon: FolderOpen, color: '#3b82f6' },
    { label: 'Em Atendimento', value: stats.emAtendimento, icon: Clock, color: '#f59e0b' },
    { label: 'Pendentes', value: stats.pendentes, icon: ListChecks, color: '#8b5cf6' },
    { label: 'Finalizados', value: stats.finalizados, icon: CheckCircle, color: '#10b981' },
    { label: 'SLA Vencido', value: stats.slaVencido, icon: AlertCircle, color: '#ef4444' },
    { label: 'SLA Dentro do Prazo', value: stats.slaDentro, icon: CheckCircle, color: '#22c55e' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button asChild className="bg-[#005B2E] hover:bg-[#01361D] text-white">
          <Link to="/admin/atendimento/novo">
            <Plus className="w-4 h-4 mr-2" /> Novo Atendimento
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {cards.map((c) => (
          <Card key={c.label} className="border-2" style={{ borderColor: `${c.color}33` }}>
            <CardContent className="py-4 px-4">
              <c.icon className="w-5 h-5 mb-2" style={{ color: c.color }} />
              <p className="text-2xl font-black">{loading ? '—' : c.value}</p>
              <p className="text-xs text-muted-foreground">{c.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-2 border-[#005B2E]/20">
        <CardHeader>
          <CardTitle className="text-base">Atendimentos Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhum atendimento registrado.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#01361D] text-white">
                    <th className="text-left px-3 py-2 font-bold">Protocolo</th>
                    <th className="text-left px-3 py-2 font-bold">Cliente</th>
                    <th className="text-left px-3 py-2 font-bold hidden md:table-cell">
                      Prioridade
                    </th>
                    <th className="text-left px-3 py-2 font-bold">Status</th>
                    <th className="text-left px-3 py-2 font-bold hidden lg:table-cell">Abertura</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((r) => (
                    <tr key={r.id} className="border-b border-border hover:bg-[#005B2E]/5">
                      <td className="px-3 py-2">
                        <Link
                          to={`/admin/atendimento/detalhe/${r.id}`}
                          className="text-[#005B2E] font-bold hover:underline"
                        >
                          {r.protocol}
                        </Link>
                      </td>
                      <td className="px-3 py-2">{r.client_name || '—'}</td>
                      <td className="px-3 py-2 hidden md:table-cell">{r.prioridade || '—'}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded ${STATUS_BADGE_COLORS[r.status] || ''}`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 hidden lg:table-cell">
                        {r.created ? new Date(r.created).toLocaleString('pt-BR') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
