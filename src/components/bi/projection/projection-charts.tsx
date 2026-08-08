import { Card, CardContent } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts'
import type { ProjectionKPIs, DimensionRow } from '@/lib/projection-utils'

const chartConfig = {
  faturado: { label: 'Faturado', color: '#005B2E' },
  meta: { label: 'Meta', color: '#C89B3C' },
  projecao: { label: 'Projeção', color: '#3b82f6' },
} satisfies ChartConfig

interface Props {
  kpis: ProjectionKPIs
  rows: DimensionRow[]
  dailyEvolution: Array<{ date: string; faturado: number }>
}

export function ProjectionCharts({ kpis, rows, dailyEvolution }: Props) {
  const summaryData = [
    { name: 'Faturado', faturado: Math.round(kpis.faturado) },
    { name: 'Meta', meta: Math.round(kpis.meta) },
    { name: 'Projeção', projecao: Math.round(kpis.projecao) },
  ]
  const topRows = rows.slice(0, 8).map((r) => ({ name: r.name, projecao: Math.round(r.projecao) }))
  const dailyData = dailyEvolution.map((d) => ({
    day: `D${d.date}`,
    faturado: Math.round(d.faturado),
  }))

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-4">
          <h3 className="font-bold text-[#005B2E] mb-3">Faturado × Meta × Projeção</h3>
          <ChartContainer config={chartConfig} className="h-[200px]">
            <BarChart data={summaryData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="faturado" fill="#005B2E" radius={4} />
              <Bar dataKey="meta" fill="#C89B3C" radius={4} />
              <Bar dataKey="projecao" fill="#3b82f6" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-4">
          <h3 className="font-bold text-[#005B2E] mb-3">Evolução Diária</h3>
          <ChartContainer config={chartConfig} className="h-[200px]">
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line dataKey="faturado" stroke="#005B2E" strokeWidth={2} dot={false} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card className="border-2 border-[#005B2E]/20 md:col-span-2">
        <CardContent className="py-4">
          <h3 className="font-bold text-[#005B2E] mb-3">Projeção por Dimensão (Top 8)</h3>
          <ChartContainer config={chartConfig} className="h-[200px]">
            <BarChart data={topRows} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 10 }}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={100} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="projecao" fill="#3b82f6" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
