import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer } from 'recharts'
import { StatCard } from '@/components/dashboards/stat-card'
import { ChartCard } from '@/components/dashboards/chart-card'
import { ChartExportButton } from '@/components/chart-export-button'
import {
  downloadBarChart,
  downloadStatCard,
  downloadTopAttendant,
  downloadCommentsReport,
} from '@/lib/chart-export'
import { useAuth } from '@/hooks/use-auth'
import { getChatRatings, type ChatRating } from '@/services/chat-ratings'
import { useRealtime } from '@/hooks/use-realtime'
import { Star, Trophy, MessageSquare, TrendingUp, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { HURAM_CHART_COLORS } from '@/lib/huram-charts-theme'

const PB_URL = import.meta.env.VITE_POCKETBASE_URL || ''
const getAvatarUrl = (id: string, avatar: string) =>
  avatar ? `${PB_URL}/api/files/users/${id}/${avatar}` : ''

export function ChatDashboard() {
  const [ratings, setRatings] = useState<ChatRating[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const userName = (user?.name as string) || (user?.email as string) || 'Usuário'

  const loadData = async () => {
    try {
      setRatings(await getChatRatings())
    } catch {
      /* ignored */
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('chat_ratings', () => loadData())

  const stats = useMemo(() => {
    const byAttendant: Record<
      string,
      { total: number; sum: number; name: string; avatar: string }
    > = {}
    for (const r of ratings) {
      const aId = r.attendant || r.expand?.attendant?.id || ''
      const aName = r.expand?.attendant?.name || 'Atendente'
      const aAvatar = r.expand?.attendant?.avatar || ''
      if (!byAttendant[aId]) byAttendant[aId] = { total: 0, sum: 0, name: aName, avatar: aAvatar }
      byAttendant[aId].total++
      byAttendant[aId].sum += r.rating
    }
    const chartData = Object.entries(byAttendant).map(([id, d]) => ({
      name: d.name,
      avg: +(d.sum / d.total).toFixed(1),
      id,
      avatar: d.avatar,
    }))
    const overall =
      ratings.length > 0
        ? +(ratings.reduce((s, r) => s + r.rating, 0) / ratings.length).toFixed(1)
        : 0
    const top =
      chartData.length > 0
        ? chartData.reduce((max, d) => (d.avg > max.avg ? d : max), chartData[0])
        : null
    const comments = ratings.filter((r) => r.comment && r.comment.trim())
    return { chartData, overall, top, comments, total: ratings.length }
  }, [ratings])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#063D30] animate-spin" />
      </div>
    )
  }

  const chartConfig = { avg: { label: 'Média', color: HURAM_CHART_COLORS.primary } }
  const exp =
    (label: string, value: string, color: string, title: string) => (fmt: 'png' | 'jpg') =>
      downloadStatCard(label, value, color, title, userName, fmt)

  if (stats.total === 0) {
    return (
      <Card className="border-2 border-dashed border-border">
        <CardContent className="py-16 text-center">
          <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-bold text-foreground mb-1">
            Nenhuma avaliação recebida ainda.
          </p>
          <p className="text-sm text-muted-foreground">
            As avaliações dos clientes aparecerão aqui automaticamente.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={TrendingUp}
          value={stats.overall}
          label="Média Geral"
          hexColor={HURAM_CHART_COLORS.primary}
          onExport={exp(
            'Média Geral',
            String(stats.overall),
            HURAM_CHART_COLORS.primary,
            'Média Geral de Avaliações',
          )}
        />
        <StatCard
          icon={Star}
          value={stats.total}
          label="Avaliações Recebidas"
          hexColor={HURAM_CHART_COLORS.tertiary}
          onExport={exp(
            'Avaliações Recebidas',
            String(stats.total),
            HURAM_CHART_COLORS.tertiary,
            'Total de Avaliações Recebidas',
          )}
        />
        {stats.top && (
          <Card className="border-2 border-[#C69B45]/40 bg-gradient-to-br from-[#C69B45]/5 to-[#063D30]/5">
            <CardContent className="py-4 px-6 flex items-center gap-4">
              {stats.top.avatar ? (
                <img
                  src={getAvatarUrl(stats.top.id, stats.top.avatar)}
                  alt={stats.top.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#C69B45]"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-[#C69B45]/20 flex items-center justify-center border-2 border-[#C69B45]">
                  <Trophy className="w-6 h-6 text-[#C69B45]" />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#C69B45]">★ Usuário Destaque</p>
                <p className="font-black text-foreground">{stats.top.name}</p>
                <p className="text-sm text-muted-foreground">Média: {stats.top.avg}</p>
              </div>
              <ChartExportButton
                className="ml-auto"
                onExport={(fmt) =>
                  downloadTopAttendant(
                    stats.top!.name,
                    stats.top!.avg,
                    getAvatarUrl(stats.top!.id, stats.top!.avatar),
                    'Atendente Destaque',
                    userName,
                    fmt,
                  )
                }
              />
            </CardContent>
          </Card>
        )}
      </div>
      <ChartCard
        title="Média de Avaliação por Atendente"
        hexColor={HURAM_CHART_COLORS.primary}
        onExport={(fmt) =>
          downloadBarChart(
            stats.chartData.map((d) => ({ name: d.name, value: d.avg })),
            HURAM_CHART_COLORS.primary,
            'Média de Avaliação por Atendente',
            userName,
            fmt,
          )
        }
      >
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.chartData}>
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: HURAM_CHART_COLORS.axis }}
                stroke={HURAM_CHART_COLORS.axis}
              />
              <YAxis
                domain={[0, 5]}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: HURAM_CHART_COLORS.axis }}
                stroke={HURAM_CHART_COLORS.axis}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="avg" radius={[8, 8, 0, 0]}>
                {stats.chartData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={
                      entry.id === stats.top?.id
                        ? HURAM_CHART_COLORS.tertiary
                        : HURAM_CHART_COLORS.primary
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </ChartCard>
      {stats.comments.length > 0 && (
        <ChartCard
          title="Comentários e Observações"
          hexColor={HURAM_CHART_COLORS.primary}
          onExport={(fmt) =>
            downloadCommentsReport(
              stats.comments.map((r) => ({
                author: r.expand?.attendant?.name || 'Atendente',
                rating: r.rating,
                comment: r.comment,
              })),
              'Comentários e Observações',
              userName,
              fmt,
            )
          }
        >
          <div className="space-y-3">
            {stats.comments.map((r) => (
              <div key={r.id} className="p-3 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm text-foreground">
                    {r.expand?.attendant?.name || 'Atendente'}
                  </span>
                  <span className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          'w-3 h-3',
                          i < r.rating ? 'fill-[#C69B45] text-[#C69B45]' : 'text-muted-foreground',
                        )}
                      />
                    ))}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{r.comment}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(r.created).toLocaleString('pt-BR')}
                </p>
              </div>
            ))}
          </div>
        </ChartCard>
      )}
    </div>
  )
}
