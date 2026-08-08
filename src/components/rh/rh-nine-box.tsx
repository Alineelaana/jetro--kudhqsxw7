import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { RhLoading } from '@/components/rh/rh-shared'
import { getNineBoxData } from '@/services/rh-enterprise'
import { useRealtime } from '@/hooks/use-realtime'
import { cn } from '@/lib/utils'

const BOX_LABELS: Record<string, { label: string; color: string }> = {
  highPotHighPerf: { label: 'Estrelas', color: 'bg-emerald-100 border-emerald-300' },
  highPotMidPerf: { label: 'Crescimento', color: 'bg-blue-100 border-blue-300' },
  highPotLowPerf: { label: 'Em Risco', color: 'bg-amber-100 border-amber-300' },
  midPotHighPerf: { label: 'Especialistas', color: 'bg-cyan-100 border-cyan-300' },
  midPotMidPerf: { label: 'Nucleo', color: 'bg-gray-100 border-gray-300' },
  midPotLowPerf: { label: 'Atencao', color: 'bg-amber-50 border-amber-200' },
  lowPotHighPerf: { label: 'Profissionais', color: 'bg-green-50 border-green-200' },
  lowPotMidPerf: { label: 'Mediano', color: 'bg-gray-50 border-gray-200' },
  lowPotLowPerf: { label: 'Baixo', color: 'bg-red-50 border-red-200' },
}

export function RhNineBox() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      setData(await getNineBoxData())
    } catch {
      setData(null)
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('rh_performance_evaluations', () => load())

  if (loading || !data) return <RhLoading />

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold">Matriz 9 Box - Potencial x Desempenho</h3>
      <div className="grid grid-cols-3 gap-2">
        {Object.entries(BOX_LABELS).map(([key, cfg]) => {
          const items = data[key] || []
          return (
            <Card key={key} className={cn('border-2', cfg.color)}>
              <CardContent className="p-3">
                <p className="text-xs font-bold mb-2">{cfg.label}</p>
                <p className="text-2xl font-black text-[#005B2E]">{items.length}</p>
                <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                  {items.slice(0, 5).map((item: any) => (
                    <p key={item.id} className="text-xs truncate">
                      {item.employee_name}
                    </p>
                  ))}
                  {items.length > 5 && (
                    <p className="text-xs text-muted-foreground">+{items.length - 5} mais</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Baixo Potencial</span>
        <span>Medio Potencial</span>
        <span>Alto Potencial</span>
      </div>
      <div className="flex justify-between text-xs text-muted-foreground -mt-2">
        <span>^ Baixo Desempenho / Alto Desempenho ^</span>
      </div>
    </div>
  )
}
