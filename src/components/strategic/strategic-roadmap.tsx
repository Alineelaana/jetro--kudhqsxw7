import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, MapPin } from 'lucide-react'
import { getStrategicList } from '@/services/strategic'
import { useRealtime } from '@/hooks/use-realtime'
import { StrategicBiButton } from './strategic-bi-button'
import { cn } from '@/lib/utils'
import type { StrategicRoadmap, StrategicInitiative } from '@/lib/strategic-types'

const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4']
const STATUS_COLORS: Record<string, string> = {
  planejado: 'bg-blue-100 text-blue-700',
  em_andamento: 'bg-amber-100 text-amber-700',
  concluido: 'bg-emerald-100 text-emerald-700',
  atrasado: 'bg-red-100 text-red-700',
  cancelado: 'bg-gray-100 text-gray-600',
}

export function StrategicRoadmap() {
  const [roadmap, setRoadmap] = useState<StrategicRoadmap[]>([])
  const [initiatives, setInitiatives] = useState<StrategicInitiative[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const [rm, inits] = await Promise.all([
        getStrategicList('strategic_roadmap'),
        getStrategicList('strategic_initiatives'),
      ])
      setRoadmap(rm as unknown as StrategicRoadmap[])
      setInitiatives(inits as unknown as StrategicInitiative[])
    } catch {
      /* ignore */
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('strategic_roadmap', () => load())

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  const initMap = new Map(initiatives.map((i) => [i.id, i]))

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <StrategicBiButton area="Roadmap" />
      </div>
      {roadmap.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-12 text-center">
            <MapPin className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-lg font-bold">Roadmap vazio</p>
            <p className="text-sm text-muted-foreground">
              Crie iniciativas e adicione-as ao roadmap para visualizar a linha do tempo.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {QUARTERS.map((q) => {
            const items = roadmap.filter((r) => r.quarter === q)
            return (
              <div key={q} className="space-y-2">
                <h3 className="font-bold text-sm text-[#005B2E] sticky top-0 bg-background py-1">
                  {q}
                </h3>
                {items.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">Sem itens</p>
                ) : (
                  items.map((item) => {
                    const init = item.initiative_id ? initMap.get(item.initiative_id) : null
                    return (
                      <Card key={item.id} className="border-2 border-[#005B2E]/10">
                        <CardContent className="py-2 px-3">
                          <p className="font-medium text-sm">
                            {item.project_name || init?.title || '—'}
                          </p>
                          <p className="text-xs text-muted-foreground">{item.area || '—'}</p>
                          <span
                            className={cn(
                              'text-xs font-bold px-2 py-0.5 rounded inline-block mt-1',
                              STATUS_COLORS[item.status] || '',
                            )}
                          >
                            {item.status}
                          </span>
                        </CardContent>
                      </Card>
                    )
                  })
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
