import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getApurations } from '@/services/variable-remuneration'
import { useRealtime } from '@/hooks/use-realtime'
import { formatCurrency, parseNum } from '@/lib/variable-remuneration-types'
import { Loader2, Trophy, Medal } from 'lucide-react'

const RANKING_DIMENSIONS = [
  { value: 'vendedor', label: 'Vendedor' },
  { value: 'empresa', label: 'Empresa' },
  { value: 'filial', label: 'Filial' },
  { value: 'regiao', label: 'Região' },
  { value: 'produto', label: 'Produto' },
  { value: 'marca', label: 'Marca' },
  { value: 'fornecedor', label: 'Fornecedor' },
]

export function VrRanking() {
  const [apurations, setApurations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dimension, setDimension] = useState('vendedor')

  const load = async () => {
    try {
      setApurations(await getApurations())
    } catch {
      setApurations([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('commission_apurations', () => load())

  const ranking = useMemo(() => {
    const map: Record<string, number> = {}
    apurations.forEach((a) => {
      const key = a[dimension === 'vendedor' ? 'vendedor_name' : dimension] || '—'
      map[key] = (map[key] || 0) + parseNum(a.commission_value)
    })
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
  }, [apurations, dimension])

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  const maxVal = ranking.length > 0 ? ranking[0][1] : 1

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h3 className="text-lg font-bold">Ranking</h3>
        <Select value={dimension} onValueChange={setDimension}>
          <SelectTrigger className="w-48 focus-visible:ring-[#005B2E]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RANKING_DIMENSIONS.map((d) => (
              <SelectItem key={d.value} value={d.value}>
                {d.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Card className="border-2 border-[#005B2E]/20">
        <CardHeader>
          <CardTitle className="text-base">
            Ranking por {RANKING_DIMENSIONS.find((d) => d.value === dimension)?.label}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ranking.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">Nenhum dado disponível</p>
          ) : (
            <div className="space-y-2">
              {ranking.map(([name, value], i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#005B2E]/5"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-gray-200 text-gray-700' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-muted text-muted-foreground'}`}
                  >
                    {i < 3 ? <Medal className="w-4 h-4" /> : i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{name}</p>
                    <div className="h-2 rounded-full bg-muted overflow-hidden mt-1">
                      <div
                        className="h-full bg-[#005B2E] rounded-full"
                        style={{ width: `${(value / maxVal) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-bold text-[#005B2E] shrink-0">
                    R$ {formatCurrency(value)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
