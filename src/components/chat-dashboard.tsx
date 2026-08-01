import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer } from 'recharts'
import { getChatRatings, type ChatRating } from '@/services/chat-ratings'
import { getUsers } from '@/services/users'
import { useRealtime } from '@/hooks/use-realtime'
import { Star, Trophy, MessageSquare, TrendingUp, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const PB_URL = import.meta.env.VITE_POCKETBASE_URL || ''
const getAvatarUrl = (id: string, avatar: string) =>
  avatar ? `${PB_URL}/api/files/users/${id}/${avatar}` : ''

interface UserRecord {
  id: string
  name: string
  email: string
  role: string
  avatar: string
  attendant_status: string
}

export function ChatDashboard() {
  const [ratings, setRatings] = useState<ChatRating[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      setRatings(await getChatRatings())
    } catch {
      /* intentionally ignored */
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
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )
  }

  const chartConfig = { avg: { label: 'Média', color: '#005B2E' } }

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
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="py-4 px-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#005B2E]/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-[#005B2E]" />
            </div>
            <div>
              <p className="text-2xl font-black text-foreground">{stats.overall}</p>
              <p className="text-sm text-muted-foreground">Média Geral</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-[#C89B3C]/30">
          <CardContent className="py-4 px-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#C89B3C]/10 flex items-center justify-center">
              <Star className="w-6 h-6 text-[#C89B3C]" />
            </div>
            <div>
              <p className="text-2xl font-black text-foreground">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Avaliações Recebidas</p>
            </div>
          </CardContent>
        </Card>
        {stats.top && (
          <Card className="border-2 border-[#C89B3C]/40 bg-gradient-to-br from-[#C89B3C]/5 to-[#005B2E]/5">
            <CardContent className="py-4 px-6 flex items-center gap-4">
              {stats.top.avatar ? (
                <img
                  src={getAvatarUrl(stats.top.id, stats.top.avatar)}
                  alt={stats.top.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#C89B3C]"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-[#C89B3C]/20 flex items-center justify-center border-2 border-[#C89B3C]">
                  <Trophy className="w-6 h-6 text-[#C89B3C]" />
                </div>
              )}
              <div>
                <p className="text-xs font-bold text-[#C89B3C]">★ Usuário Destaque</p>
                <p className="font-black text-foreground">{stats.top.name}</p>
                <p className="text-sm text-muted-foreground">Média: {stats.top.avg}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Card className="border-2 border-[#005B2E]/20">
        <CardHeader>
          <CardTitle className="text-base">Média de Avaliação por Atendente</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData}>
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 5]} tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="avg" radius={[8, 8, 0, 0]}>
                  {stats.chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.id === stats.top?.id ? '#C89B3C' : '#005B2E'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {stats.comments.length > 0 && (
        <Card className="border-2 border-[#005B2E]/20">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#005B2E]" /> Comentários e Observações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
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
                          i < r.rating ? 'fill-[#C89B3C] text-[#C89B3C]' : 'text-muted-foreground',
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
          </CardContent>
        </Card>
      )}
    </div>
  )
}
