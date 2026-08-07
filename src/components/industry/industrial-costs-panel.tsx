import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DollarSign, Loader2 } from 'lucide-react'
import { getIndustrialCosts } from '@/services/industry'
import { useRealtime } from '@/hooks/use-realtime'
import type { IndustrialCost } from '@/lib/industry-types'

const COST_FIELDS = [
  { key: 'cost_materia_prima', label: 'Matéria-prima' },
  { key: 'cost_embalagem', label: 'Embalagem' },
  { key: 'cost_mao_obra', label: 'Mão de Obra' },
  { key: 'cost_recurso', label: 'Recurso/Máquina' },
  { key: 'cost_energia', label: 'Energia' },
  { key: 'cost_perdas', label: 'Perdas' },
  { key: 'cost_indiretos', label: 'Custos Indiretos' },
  { key: 'cost_cambio', label: 'Câmbio' },
  { key: 'cost_landing', label: 'Landing Cost' },
] as const

export function IndustrialCostsPanel() {
  const [costs, setCosts] = useState<IndustrialCost[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      setCosts(await getIndustrialCosts())
    } catch {
      /* ignore */
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])
  useRealtime('industrial_costs', () => load())

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <DollarSign className="w-6 h-6 text-[#005B2E]" />
        <h2 className="text-xl font-black text-foreground">Custos Industriais</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {costs.map((c) => (
          <Card key={c.id} className="border-2 border-[#005B2E]/20">
            <CardContent className="py-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-bold text-sm">{c.expand?.item_id?.name || '—'}</p>
                  <p className="text-xs text-muted-foreground">
                    v{c.version} • {c.cost_type === 'padrao' ? 'Custo Padrão' : 'Custo Realizado'}
                  </p>
                </div>
                <Badge
                  className={
                    c.cost_type === 'padrao'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }
                >
                  {c.cost_type === 'padrao' ? 'Padrão' : 'Realizado'}
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {COST_FIELDS.map((f) => {
                  const val = c[f.key as keyof IndustrialCost]
                  if (!val || val === '0' || val === '0.00') return null
                  return (
                    <div key={f.key} className="p-2 bg-muted/30 rounded">
                      <p className="text-muted-foreground">{f.label}</p>
                      <p className="font-bold">R$ {String(val)}</p>
                    </div>
                  )
                })}
              </div>
              <div className="mt-3 pt-3 border-t flex items-center justify-between">
                <span className="text-sm font-semibold text-muted-foreground">Custo Total</span>
                <span className="text-lg font-black text-[#005B2E]">R$ {c.total_cost || '—'}</span>
              </div>
              {c.unit_cost && (
                <p className="text-xs text-muted-foreground mt-1">
                  Custo unitário: R$ {c.unit_cost}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      {costs.length === 0 && (
        <Card className="border-2 border-dashed border-border">
          <CardContent className="py-12 text-center">
            <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-lg font-bold mb-1">Nenhum custo industrial cadastrado</p>
            <p className="text-sm text-muted-foreground">
              Os custos são gerados a partir de BOM e roteiros versionados
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
