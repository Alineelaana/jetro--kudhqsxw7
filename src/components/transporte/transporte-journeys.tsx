import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  getJourneys,
  updateJourney,
  JOURNEY_STATUS,
  JOURNEY_NEXT_STATUS,
  type TransportJourney,
} from '@/services/transport-journeys'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import { canReleaseJourney, canCancelJourney } from '@/lib/transporte-permissions'
import { Search, Loader2, Container } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  Planejada: 'bg-gray-100 text-gray-700',
  'Aguardando Carregamento': 'bg-amber-100 text-amber-700',
  'Em Carregamento': 'bg-blue-100 text-blue-700',
  Liberada: 'bg-indigo-100 text-indigo-700',
  'Em Trânsito': 'bg-cyan-100 text-cyan-700',
  'Em Entrega': 'bg-purple-100 text-purple-700',
  Finalizada: 'bg-emerald-100 text-emerald-700',
  'Com Ocorrência': 'bg-red-100 text-red-700',
  Cancelada: 'bg-gray-100 text-gray-500',
}

export function TransporteJourneys() {
  const { user } = useAuth()
  const role = user?.role as string
  const [records, setRecords] = useState<TransportJourney[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const load = async () => {
    try {
      setRecords(await getJourneys())
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('transport_journeys', () => load())

  const filtered = records.filter((r) => {
    const t = search.toLowerCase().trim()
    return (
      !t ||
      r.numero_viagem.toLowerCase().includes(t) ||
      r.rota.toLowerCase().includes(t) ||
      r.motorista.toLowerCase().includes(t)
    )
  })

  const handleStatus = async (id: string, status: string) => {
    try {
      const updates: Record<string, unknown> = { status }
      if (status === 'Em Trânsito') updates.data_saida = new Date().toISOString().split('T')[0]
      if (status === 'Finalizada') updates.data_chegada = new Date().toISOString().split('T')[0]
      await updateJourney(id, updates)
      toast.success(`Status: ${status}`)
      load()
    } catch {
      toast.error('Erro ao atualizar')
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
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar viagem..."
          className="pl-10 focus-visible:ring-[#005B2E]"
        />
      </div>
      <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#01361D] text-white">
                <th className="text-left px-3 py-2 font-bold">Viagem</th>
                <th className="text-left px-3 py-2 font-bold hidden md:table-cell">Rota</th>
                <th className="text-left px-3 py-2 font-bold hidden md:table-cell">Veículo</th>
                <th className="text-left px-3 py-2 font-bold hidden lg:table-cell">Motorista</th>
                <th className="text-left px-3 py-2 font-bold hidden lg:table-cell">
                  Origem → Destino
                </th>
                <th className="text-left px-3 py-2 font-bold">Status</th>
                <th className="text-center px-3 py-2 font-bold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-12 text-center text-muted-foreground">
                    <Container className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    Nenhuma viagem encontrada
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="border-b border-border hover:bg-[#005B2E]/5">
                    <td className="px-3 py-2 font-mono text-xs font-bold text-[#C89B3C]">
                      {r.numero_viagem}
                    </td>
                    <td className="px-3 py-2 hidden md:table-cell">{r.rota || '—'}</td>
                    <td className="px-3 py-2 hidden md:table-cell text-xs">{r.veiculo || '—'}</td>
                    <td className="px-3 py-2 hidden lg:table-cell text-xs">{r.motorista || '—'}</td>
                    <td className="px-3 py-2 hidden lg:table-cell text-xs">
                      {r.origem || '—'} → {r.destino || '—'}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded ${STATUS_COLORS[r.status] || 'bg-gray-100'}`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex justify-center gap-1">
                        {JOURNEY_NEXT_STATUS[r.status] && canReleaseJourney(role) && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleStatus(r.id, JOURNEY_NEXT_STATUS[r.status])}
                            className="text-[#005B2E] h-7 text-xs"
                          >
                            {JOURNEY_NEXT_STATUS[r.status]}
                          </Button>
                        )}
                        {r.status === 'Com Ocorrência' && canReleaseJourney(role) && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleStatus(r.id, 'Em Trânsito')}
                            className="text-blue-600 h-7 text-xs"
                          >
                            Retomar
                          </Button>
                        )}
                        {!['Finalizada', 'Cancelada'].includes(r.status) &&
                          canCancelJourney(role) && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleStatus(r.id, 'Cancelada')}
                              className="text-red-600 h-7 text-xs"
                            >
                              Cancelar
                            </Button>
                          )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
