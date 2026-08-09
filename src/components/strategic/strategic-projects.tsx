import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, FolderOpen, Search } from 'lucide-react'
import { getStrategicList } from '@/services/strategic'
import { useRealtime } from '@/hooks/use-realtime'
import { StrategicBiButton } from './strategic-bi-button'
import { cn } from '@/lib/utils'
import type { StrategicProject } from '@/lib/strategic-types'

const HEALTH_COLORS: Record<string, string> = {
  verde: 'border-l-emerald-500',
  amarelo: 'border-l-amber-500',
  vermelho: 'border-l-red-500',
}
const STATUS_LABELS: Record<string, string> = {
  rascunho: 'Rascunho',
  planejado: 'Planejado',
  em_andamento: 'Em Andamento',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
  pausado: 'Pausado',
}

export function StrategicProjects() {
  const [projects, setProjects] = useState<StrategicProject[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const load = async () => {
    try {
      setProjects((await getStrategicList('strategic_projects')) as unknown as StrategicProject[])
    } catch {
      setProjects([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('strategic_projects', () => load())

  const filtered = projects.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-1">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar projeto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="em_andamento">Em Andamento</SelectItem>
            <SelectItem value="planejado">Planejado</SelectItem>
            <SelectItem value="concluido">Concluído</SelectItem>
            <SelectItem value="pausado">Pausado</SelectItem>
          </SelectContent>
        </Select>
        <StrategicBiButton area="Projetos" />
      </div>
      {filtered.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-12 text-center">
            <FolderOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-lg font-bold">Nenhum projeto encontrado</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((p) => (
            <Card
              key={p.id}
              className={cn(
                'border-2 border-[#005B2E]/10 border-l-4',
                HEALTH_COLORS[p.health] || 'border-l-gray-300',
              )}
            >
              <CardContent className="py-3">
                <h3 className="font-bold text-sm">{p.name}</h3>
                <p className="text-xs text-muted-foreground mb-2">
                  {p.area || '—'} · {p.responsible || '—'}
                </p>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold px-2 py-0.5 rounded bg-muted">
                    {STATUS_LABELS[p.status] || p.status}
                  </span>
                  <span className="text-muted-foreground">{p.progress || 0}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                  <div
                    className="bg-[#005B2E] h-1.5 rounded-full"
                    style={{ width: `${Math.min(p.progress || 0, 100)}%` }}
                  />
                </div>
                {p.investment && (
                  <p className="text-xs mt-1 text-muted-foreground">Investimento: {p.investment}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
