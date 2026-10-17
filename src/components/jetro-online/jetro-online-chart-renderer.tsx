import React from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { BarChart3, TrendingUp } from 'lucide-react'

export interface JetroChartSeries {
  dataKey: string
  name?: string
  color?: string
}

export interface JetroChartSpec {
  type: 'bar' | 'line'
  title?: string
  description?: string
  xAxisKey?: string
  series?: JetroChartSeries[]
  data: Array<Record<string, unknown>>
}

interface JetroOnlineChartRendererProps {
  spec: JetroChartSpec
}

// Paleta oficial Jetro
const JETRO_COLORS = [
  '#005B2E', // Verde Jetro escuro primário
  '#C9A227', // Dourado Jetro
  '#027A3D', // Verde Médio
  '#8F7014', // Dourado Escuro
  '#00381C', // Verde Floresta Profundo
  '#10B981', // Esmeralda de suporte
]

function formatTooltipValue(value: unknown): string {
  if (typeof value === 'number') {
    // Se for valor monetário ou decimal
    return value.toLocaleString('pt-BR', {
      maximumFractionDigits: 2,
    })
  }
  return String(value ?? '')
}

export const JetroOnlineChartRenderer: React.FC<JetroOnlineChartRendererProps> = ({ spec }) => {
  const { type, title, description, xAxisKey = 'name', series, data } = spec

  if (!data || !Array.isArray(data) || data.length === 0) {
    return null
  }

  // Se series não for informado, deduz a partir da primeira chave numérica do data
  const chartSeries: JetroChartSeries[] =
    series && series.length > 0
      ? series
      : Object.keys(data[0] || {})
          .filter((k) => k !== xAxisKey && typeof data[0][k] === 'number')
          .map((k, idx) => ({
            dataKey: k,
            name: k,
            color: JETRO_COLORS[idx % JETRO_COLORS.length],
          }))

  if (chartSeries.length === 0) {
    return null
  }

  const isBar = type === 'bar'

  return (
    <Card className="my-3 overflow-hidden border border-gray-200/90 shadow-xs bg-linear-to-b from-white to-gray-50/50">
      <CardHeader className="py-3 px-4 pb-2 border-b border-gray-100 flex flex-row items-center justify-between space-y-0">
        <div>
          {title && (
            <CardTitle className="text-xs sm:text-sm font-bold text-gray-900 flex items-center gap-1.5">
              {isBar ? (
                <BarChart3 className="w-4 h-4 text-[#005B2E]" />
              ) : (
                <TrendingUp className="w-4 h-4 text-[#C9A227]" />
              )}
              <span>{title}</span>
            </CardTitle>
          )}
          {description && (
            <CardDescription className="text-[11px] text-gray-500 mt-0.5">
              {description}
            </CardDescription>
          )}
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#005B2E]/10 text-[#005B2E]">
          {isBar ? 'Comparativo / Ranking' : 'Evolução Temporal'}
        </span>
      </CardHeader>
      <CardContent className="p-3 pt-4">
        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {isBar ? (
              <BarChart data={data} margin={{ top: 10, right: 15, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis
                  dataKey={xAxisKey}
                  tickLine={false}
                  axisLine={{ stroke: '#E5E7EB' }}
                  tick={{ fontSize: 11, fill: '#4B5563' }}
                  interval={0}
                  angle={data.length > 5 ? -25 : 0}
                  textAnchor={data.length > 5 ? 'end' : 'middle'}
                  height={data.length > 5 ? 45 : 25}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: '#6B7280' }}
                  tickFormatter={(val) => {
                    if (typeof val === 'number') {
                      if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`
                      if (val >= 1000) return `${(val / 1000).toFixed(0)}k`
                      return String(val)
                    }
                    return String(val)
                  }}
                />
                <Tooltip
                  formatter={(value: unknown, name: unknown) => [
                    formatTooltipValue(value),
                    String(name || ''),
                  ]}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    border: '1px solid #E5E7EB',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    fontSize: '11px',
                  }}
                />
                {chartSeries.length > 1 && (
                  <Legend
                    wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                    iconType="circle"
                  />
                )}
                {chartSeries.map((s, idx) => (
                  <Bar
                    key={s.dataKey}
                    dataKey={s.dataKey}
                    name={s.name || s.dataKey}
                    fill={s.color || JETRO_COLORS[idx % JETRO_COLORS.length]}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={48}
                  />
                ))}
              </BarChart>
            ) : (
              <LineChart data={data} margin={{ top: 10, right: 15, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis
                  dataKey={xAxisKey}
                  tickLine={false}
                  axisLine={{ stroke: '#E5E7EB' }}
                  tick={{ fontSize: 11, fill: '#4B5563' }}
                  interval={0}
                  angle={data.length > 5 ? -25 : 0}
                  textAnchor={data.length > 5 ? 'end' : 'middle'}
                  height={data.length > 5 ? 45 : 25}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: '#6B7280' }}
                  tickFormatter={(val) => {
                    if (typeof val === 'number') {
                      if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`
                      if (val >= 1000) return `${(val / 1000).toFixed(0)}k`
                      return String(val)
                    }
                    return String(val)
                  }}
                />
                <Tooltip
                  formatter={(value: unknown, name: unknown) => [
                    formatTooltipValue(value),
                    String(name || ''),
                  ]}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    border: '1px solid #E5E7EB',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    fontSize: '11px',
                  }}
                />
                {chartSeries.length > 1 && (
                  <Legend
                    wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                    iconType="circle"
                  />
                )}
                {chartSeries.map((s, idx) => (
                  <Line
                    key={s.dataKey}
                    type="monotone"
                    dataKey={s.dataKey}
                    name={s.name || s.dataKey}
                    stroke={s.color || JETRO_COLORS[idx % JETRO_COLORS.length]}
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: s.color || JETRO_COLORS[idx % JETRO_COLORS.length] }}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
