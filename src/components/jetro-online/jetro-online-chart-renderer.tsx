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
import { HURAM_CHART_COLORS, HURAM_CHART_SEQUENCE } from '@/lib/huram-charts-theme'

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

// Paleta oficial de gráficos HURAM
const HURAM_COLORS = [
  HURAM_CHART_COLORS.primary, // #063D30
  HURAM_CHART_COLORS.secondary, // #116B50
  HURAM_CHART_COLORS.tertiary, // #C69B45
  HURAM_CHART_COLORS.quaternary, // #E87517
  HURAM_CHART_COLORS.info, // #3B82F6
  HURAM_CHART_COLORS.success, // #10B981
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
            color: HURAM_COLORS[idx % HURAM_COLORS.length],
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
                <BarChart3 className="w-4 h-4 text-[#063D30]" />
              ) : (
                <TrendingUp className="w-4 h-4 text-[#C69B45]" />
              )}
              <span>{title}</span>
            </CardTitle>
          )}
          {description && (
            <CardDescription className="text-[11px] text-[#66736D] mt-0.5">
              {description}
            </CardDescription>
          )}
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#063D30]/10 text-[#063D30]">
          {isBar ? 'Comparativo / Ranking' : 'Evolução Temporal'}
        </span>
      </CardHeader>
      <CardContent className="p-3 pt-4">
        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {isBar ? (
              <BarChart data={data} margin={{ top: 10, right: 15, left: -10, bottom: 20 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={HURAM_CHART_COLORS.grid}
                />
                <XAxis
                  dataKey={xAxisKey}
                  tickLine={false}
                  axisLine={{ stroke: HURAM_CHART_COLORS.grid }}
                  tick={{ fontSize: 11, fill: HURAM_CHART_COLORS.axis }}
                  stroke={HURAM_CHART_COLORS.axis}
                  interval={0}
                  angle={data.length > 5 ? -25 : 0}
                  textAnchor={data.length > 5 ? 'end' : 'middle'}
                  height={data.length > 5 ? 45 : 25}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: HURAM_CHART_COLORS.axis }}
                  stroke={HURAM_CHART_COLORS.axis}
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
                    border: `1px solid ${HURAM_CHART_COLORS.grid}`,
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    fontSize: '11px',
                    color: '#202B28',
                  }}
                />
                {chartSeries.length > 1 && (
                  <Legend
                    wrapperStyle={{
                      fontSize: '11px',
                      paddingTop: '8px',
                      color: HURAM_CHART_COLORS.axis,
                    }}
                    iconType="circle"
                  />
                )}
                {chartSeries.map((s, idx) => (
                  <Bar
                    key={s.dataKey}
                    dataKey={s.dataKey}
                    name={s.name || s.dataKey}
                    fill={s.color || HURAM_COLORS[idx % HURAM_COLORS.length]}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={48}
                  />
                ))}
              </BarChart>
            ) : (
              <LineChart data={data} margin={{ top: 10, right: 15, left: -10, bottom: 20 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={HURAM_CHART_COLORS.grid}
                />
                <XAxis
                  dataKey={xAxisKey}
                  tickLine={false}
                  axisLine={{ stroke: HURAM_CHART_COLORS.grid }}
                  tick={{ fontSize: 11, fill: HURAM_CHART_COLORS.axis }}
                  stroke={HURAM_CHART_COLORS.axis}
                  interval={0}
                  angle={data.length > 5 ? -25 : 0}
                  textAnchor={data.length > 5 ? 'end' : 'middle'}
                  height={data.length > 5 ? 45 : 25}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: HURAM_CHART_COLORS.axis }}
                  stroke={HURAM_CHART_COLORS.axis}
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
                    border: `1px solid ${HURAM_CHART_COLORS.grid}`,
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    fontSize: '11px',
                    color: '#202B28',
                  }}
                />
                {chartSeries.length > 1 && (
                  <Legend
                    wrapperStyle={{
                      fontSize: '11px',
                      paddingTop: '8px',
                      color: HURAM_CHART_COLORS.axis,
                    }}
                    iconType="circle"
                  />
                )}
                {chartSeries.map((s, idx) => (
                  <Line
                    key={s.dataKey}
                    type="monotone"
                    dataKey={s.dataKey}
                    name={s.name || s.dataKey}
                    stroke={s.color || HURAM_COLORS[idx % HURAM_COLORS.length]}
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: s.color || HURAM_COLORS[idx % HURAM_COLORS.length] }}
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
