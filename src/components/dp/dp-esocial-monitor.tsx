import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { DpLoading, DpTable, DpStatusBadge } from '@/components/dp/dp-shared'
import { useRealtime } from '@/hooks/use-realtime'
import { Search, FileCheck, AlertCircle, Send, CheckCircle, XCircle } from 'lucide-react'

const STATUS_CONFIG: Record<string, { icon: typeof FileCheck; color: string }> = {
  Pendente: { icon: AlertCircle, color: 'text-amber-600' },
  Enviado: { icon: Send, color: 'text-blue-600' },
  Aceito: { icon: CheckCircle, color: 'text-emerald-600' },
  Rejeitado: { icon: XCircle, color: 'text-red-600' },
  Processado: { icon: FileCheck, color: 'text-emerald-600' },
}

export function DpEsocialMonitor() {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const load = async () => {
    try {
      const { getEsocialEventsByStatus } = await import('@/services/dp-enterprise')
      if (statusFilter) {
        setRecords(await getEsocialEventsByStatus(statusFilter))
      } else {
        const { dpGetList } = await import('@/services/dp')
        setRecords(await dpGetList('dp_esocial_events'))
      }
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [statusFilter])
  useRealtime('dp_esocial_events', () => load())

  const filtered = records.filter((r) => {
    const q = search.toLowerCase().trim()
    return (
      !q ||
      (r.employee_name || '').toLowerCase().includes(q) ||
      (r.tipo_evento || '').toLowerCase().includes(q) ||
      (r.protocolo || '').toLowerCase().includes(q)
    )
  })

  const stats = {
    pendente: records.filter((r) => r.situacao === 'Pendente').length,
    enviado: records.filter((r) => r.situacao === 'Enviado').length,
    aceito: records.filter((r) => r.situacao === 'Aceito' || r.situacao === 'Processado').length,
    rejeitado: records.filter((r) => r.situacao === 'Rejeitado').length,
  }

  if (loading) return <DpLoading />

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold">Monitor eSocial</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(stats).map(([key, val]) => {
          const cfg =
            STATUS_CONFIG[key.charAt(0).toUpperCase() + key.slice(1)] || STATUS_CONFIG.Pendente
          const Icon = cfg.icon
          return (
            <Card key={key} className="border-2 border-[#005B2E]/20">
              <CardContent className="p-3 flex items-center gap-2">
                <Icon className={`w-5 h-5 ${cfg.color}`} />
                <div>
                  <p className="text-lg font-black">{val}</p>
                  <p className="text-xs text-muted-foreground capitalize">{key}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar evento, colaborador, protocolo..."
            className="pl-10 focus-visible:ring-[#005B2E]"
          />
        </div>
        <Input
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          placeholder="Filtrar status..."
          className="w-40 focus-visible:ring-[#005B2E]"
        />
      </div>
      {filtered.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <p className="text-lg font-bold">Nenhum evento eSocial encontrado</p>
          </CardContent>
        </Card>
      ) : (
        <DpTable
          headers={[
            'Evento',
            'Colaborador',
            'Competência',
            'Protocolo',
            'Recibo',
            'Layout',
            'Situação',
          ]}
        >
          {filtered.map((r) => (
            <tr key={r.id} className="border-b border-border hover:bg-[#005B2E]/5">
              <td className="px-3 py-3 font-medium">{r.tipo_evento || '—'}</td>
              <td className="px-3 py-3 text-xs">{r.employee_name || '—'}</td>
              <td className="px-3 py-3 text-xs">{r.competencia || '—'}</td>
              <td className="px-3 py-3 text-xs font-mono">{r.protocolo || '—'}</td>
              <td className="px-3 py-3 text-xs font-mono">{r.recibo || '—'}</td>
              <td className="px-3 py-3 text-xs">{r.layout_versao || 'S-1.3'}</td>
              <td className="px-3 py-3">
                <DpStatusBadge status={r.situacao} />
              </td>
            </tr>
          ))}
        </DpTable>
      )}
    </div>
  )
}
