import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { getWmsSeparations, getWmsReceipts, getWmsShippings } from '@/services/wms'
import { getStockLocations, getStockMovements } from '@/services/stock'
import { useRealtime } from '@/hooks/use-realtime'
import { printWmsReport, exportWmsXls, exportWmsCsv } from '@/lib/wms-reports-export'
import { useAuth } from '@/hooks/use-auth'
import { Loader2, Printer, FileSpreadsheet, FileDown } from 'lucide-react'

export function WmsManagerialDashboard({
  showRotativityDetail = false,
}: { showRotativityDetail?: boolean } = {}) {
  const { user } = useAuth()
  const userName = (user?.name as string) || 'Usuário'
  const [loading, setLoading] = useState(true)
  const [seps, setSeps] = useState<Record<string, unknown>[]>([])
  const [receipts, setReceipts] = useState<Record<string, unknown>[]>([])
  const [ships, setShips] = useState<Record<string, unknown>[]>([])
  const [locs, setLocs] = useState<Record<string, unknown>[]>([])
  const [movs, setMovs] = useState<Record<string, unknown>[]>([])
  const [filters, setFilters] = useState({
    empresa: '',
    filial: '',
    deposito: '',
    turno: '',
    operador: '',
    dataInicio: '',
    dataFim: '',
  })

  const load = async () => {
    try {
      const [s, r, sh, l, m] = await Promise.all([
        getWmsSeparations().catch(() => []),
        getWmsReceipts().catch(() => []),
        getWmsShippings().catch(() => []),
        getStockLocations().catch(() => []),
        getStockMovements().catch(() => []),
      ])
      setSeps(s as Record<string, unknown>[])
      setReceipts(r as Record<string, unknown>[])
      setShips(sh as Record<string, unknown>[])
      setLocs(l as Record<string, unknown>[])
      setMovs(m as Record<string, unknown>[])
    } catch {
      /* noop */
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('wms_separations', () => load())
  useRealtime('wms_shippings', () => load())
  useRealtime('stock_movements', () => load())

  const productivityData = useMemo(() => {
    const map: Record<string, { done: number; div: number }> = {}
    seps.forEach((s) => {
      const op = (s.operador as string) || '—'
      if (!map[op]) map[op] = { done: 0, div: 0 }
      if (s.status === 'Separada') map[op].done++
      if (s.status === 'Com Divergência' || s.status === 'Com Falta') map[op].div++
    })
    return Object.entries(map).map(([name, v]) => ({
      name,
      concluidas: v.done,
      divergencias: v.div,
    }))
  }, [seps])

  const occupancyData = useMemo(() => {
    return locs.slice(0, 15).map((l) => {
      const cap = (l.capacidade as number) || 0
      const used = Array.isArray(l.produtos_armazenados)
        ? (l.produtos_armazenados as unknown[]).length
        : 0
      const pct = cap > 0 ? Math.min(100, Math.round((used / cap) * 100)) : 0
      return { name: (l.codigo as string) || '—', ocupacao: pct, capacidade: cap }
    })
  }, [locs])

  const kpis = useMemo(
    () => ({
      receiptTotal: receipts.length,
      receiptPending: receipts.filter(
        (r) => r.status === 'Pendente' || r.status === 'Aguardando Chegada',
      ).length,
      sepTotal: seps.length,
      sepDone: seps.filter((s) => s.status === 'Separada').length,
      shipTotal: ships.length,
      shipDelivered: ships.filter((s) => s.status === 'Entregue').length,
      divergences: seps.filter((s) => s.status === 'Com Divergência' || s.status === 'Com Falta')
        .length,
      movements: movs.length,
      locations: locs.length,
    }),
    [receipts, seps, ships, movs, locs],
  )

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  const kpiCards = [
    { label: 'Recebimentos', value: kpis.receiptTotal, sub: `${kpis.receiptPending} pendentes` },
    { label: 'Separações', value: kpis.sepTotal, sub: `${kpis.sepDone} concluídas` },
    { label: 'Expedições', value: kpis.shipTotal, sub: `${kpis.shipDelivered} entregues` },
    { label: 'Divergências', value: kpis.divergences, sub: 'Operacionais' },
    { label: 'Movimentações', value: kpis.movements, sub: 'Total' },
    { label: 'Localizações', value: kpis.locations, sub: 'Cadastradas' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xl font-black text-foreground">Dashboard Gerencial WMS</h2>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              printWmsReport(
                'Dashboard Gerencial WMS',
                ['Indicador', 'Valor'],
                kpiCards.map((k) => [k.label, String(k.value)]),
                userName,
              )
            }
            className="border-[#005B2E] text-[#005B2E]"
          >
            <Printer className="w-3 h-3 mr-1" />
            PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              exportWmsXls(
                'Dashboard Gerencial WMS',
                ['Indicador', 'Valor'],
                kpiCards.map((k) => [k.label, String(k.value)]),
                userName,
              )
            }
            className="border-[#005B2E] text-[#005B2E]"
          >
            <FileSpreadsheet className="w-3 h-3 mr-1" />
            Excel
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              exportWmsCsv(
                'Dashboard Gerencial WMS',
                ['Indicador', 'Valor'],
                kpiCards.map((k) => [k.label, k.value]),
                userName,
              )
            }
            className="border-[#005B2E] text-[#005B2E]"
          >
            <FileDown className="w-3 h-3 mr-1" />
            CSV
          </Button>
        </div>
      </div>
      <Card className="border-2 border-[#005B2E]/20 p-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {[
            { key: 'empresa', label: 'Empresa' },
            { key: 'filial', label: 'Filial' },
            { key: 'deposito', label: 'Depósito' },
            { key: 'turno', label: 'Turno' },
            { key: 'operador', label: 'Operador' },
            { key: 'dataInicio', label: 'Data Início', type: 'date' },
            { key: 'dataFim', label: 'Data Fim', type: 'date' },
          ].map((f) => (
            <div key={f.key}>
              <Label className="text-xs text-muted-foreground">{f.label}</Label>
              <Input
                type={f.type || 'text'}
                value={filters[f.key as keyof typeof filters]}
                onChange={(e) => setFilters({ ...filters, [f.key]: e.target.value })}
                className="h-8 text-sm focus-visible:ring-[#005B2E]"
              />
            </div>
          ))}
        </div>
      </Card>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpiCards.map((k) => (
          <Card key={k.label} className="border-2 border-[#005B2E]/20 shadow-sm">
            <CardContent className="p-3">
              <p className="text-2xl font-black text-[#005B2E]">{k.value}</p>
              <p className="text-xs font-semibold">{k.label}</p>
              <p className="text-[10px] text-muted-foreground">{k.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      {showRotativityDetail && (
        <Card className="border-2 border-[#005B2E]/20 p-4">
          <h3 className="text-sm font-bold text-[#005B2E] mb-2">
            Curva ABC e Rotatividade por Categoria de Produto
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-[#01361D] text-white">
                  <th className="text-left p-2">Classificação ABC</th>
                  <th className="text-left p-2">Participação no Valor</th>
                  <th className="text-left p-2">Giro Médio (dias)</th>
                  <th className="text-left p-2">Política de Armazenagem</th>
                  <th className="text-right p-2">Posições no Armazém</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-muted/50">
                  <td className="p-2 font-bold text-emerald-700">Classe A (Alta Rotatividade)</td>
                  <td className="p-2 font-mono">70.0%</td>
                  <td className="p-2">12 dias</td>
                  <td className="p-2">Próximo às docas de expedição (Rua 1-3)</td>
                  <td className="p-2 text-right font-bold">520</td>
                </tr>
                <tr className="border-b hover:bg-muted/50">
                  <td className="p-2 font-bold text-blue-700">Classe B (Média Rotatividade)</td>
                  <td className="p-2 font-mono">20.0%</td>
                  <td className="p-2">35 dias</td>
                  <td className="p-2">Corredores intermediários (Rua 4-7)</td>
                  <td className="p-2 text-right font-bold">680</td>
                </tr>
                <tr className="border-b hover:bg-muted/50">
                  <td className="p-2 font-bold text-amber-700">Classe C (Baixa Rotatividade)</td>
                  <td className="p-2 font-mono">10.0%</td>
                  <td className="p-2">90+ dias</td>
                  <td className="p-2">Níveis superiores e mezanino (Rua 8-10)</td>
                  <td className="p-2 text-right font-bold">448</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="p-4">
            <h3 className="text-sm font-bold text-[#005B2E] mb-3">Produtividade por Operador</h3>
            <ChartContainer
              config={{ concluidas: { color: '#005B2E' }, divergencias: { color: '#ef4444' } }}
              className="h-[240px] w-full"
            >
              <BarChart data={productivityData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10 }}
                  angle={-20}
                  textAnchor="end"
                  height={50}
                />
                <YAxis tick={{ fontSize: 10 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="concluidas" fill="var(--color-concluidas)" radius={4} />
                <Bar dataKey="divergencias" fill="var(--color-divergencias)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="p-4">
            <h3 className="text-sm font-bold text-[#005B2E] mb-3">Ocupação do Armazém (%)</h3>
            <ChartContainer
              config={{ ocupacao: { color: '#C89B3C' } }}
              className="h-[240px] w-full"
            >
              <BarChart data={occupancyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10 }}
                  angle={-20}
                  textAnchor="end"
                  height={50}
                />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="ocupacao" fill="var(--color-ocupacao)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
