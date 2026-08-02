import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Receipt, Percent } from 'lucide-react'
import type { ServiceOffered } from '@/lib/service-types'

function parseBR(v: string): number {
  if (!v) return 0
  const s = v.replace(/\s/g, '').replace('R$', '').replace(/\./g, '').replace(',', '.')
  return parseFloat(s) || 0
}

function formatBRL(n: number): string {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

interface AreaTotal {
  area: string
  valueTotal: number
  taxTotal: number
  count: number
}

export function ServicesValueReport({ services }: { services: ServiceOffered[] }) {
  const { areaTotals, avgDiscount } = useMemo(() => {
    const map = new Map<string, AreaTotal>()
    let discountSum = 0
    let discountCount = 0

    for (const s of services) {
      if (!s) continue
      const area = s.service_area || 'Sem área'
      const existing = map.get(area) || { area, valueTotal: 0, taxTotal: 0, count: 0 }
      existing.valueTotal += parseBR(s.value)
      existing.taxTotal += parseBR(s.tax_value || '')
      existing.count += 1
      map.set(area, existing)

      if (typeof s.max_discount === 'number') {
        discountSum += s.max_discount
        discountCount += 1
      }
    }

    return {
      areaTotals: Array.from(map.values()).sort((a, b) => b.valueTotal - a.valueTotal),
      avgDiscount: discountCount > 0 ? discountSum / discountCount : 0,
    }
  }, [services])

  if (!services || services.length === 0) return null

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-black text-foreground">Relatório de Valores</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#005B2E]/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[#005B2E]" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Valor Total</p>
                <p className="text-lg font-black text-[#005B2E]">
                  {formatBRL(areaTotals.reduce((s, a) => s + a.valueTotal, 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-[#C89B3C]/20">
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#C89B3C]/10 flex items-center justify-center">
                <Receipt className="w-5 h-5 text-[#C89B3C]" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Imposto Total</p>
                <p className="text-lg font-black text-[#C89B3C]">
                  {formatBRL(areaTotals.reduce((s, a) => s + a.taxTotal, 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#005B2E]/10 flex items-center justify-center">
                <Percent className="w-5 h-5 text-[#005B2E]" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Desc. Médio</p>
                <p className="text-lg font-black text-[#005B2E]">{avgDiscount.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
        <CardHeader className="bg-[#01361D] text-white py-3">
          <CardTitle className="text-sm font-bold">Valores por Área</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#005B2E]/10 text-[#005B2E]">
                <th className="text-left px-4 py-2 font-bold">Área</th>
                <th className="text-right px-4 py-2 font-bold">Serviços</th>
                <th className="text-right px-4 py-2 font-bold">Valor Total</th>
                <th className="text-right px-4 py-2 font-bold">Imposto Total</th>
                <th className="text-right px-4 py-2 font-bold">Total Geral</th>
              </tr>
            </thead>
            <tbody>
              {areaTotals.map((a) => (
                <tr key={a.area} className="border-b border-border hover:bg-[#005B2E]/5">
                  <td className="px-4 py-2 font-medium">{a.area}</td>
                  <td className="px-4 py-2 text-right">{a.count}</td>
                  <td className="px-4 py-2 text-right font-semibold text-[#005B2E]">
                    {formatBRL(a.valueTotal)}
                  </td>
                  <td className="px-4 py-2 text-right font-semibold text-[#C89B3C]">
                    {formatBRL(a.taxTotal)}
                  </td>
                  <td className="px-4 py-2 text-right font-bold">
                    {formatBRL(a.valueTotal + a.taxTotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
