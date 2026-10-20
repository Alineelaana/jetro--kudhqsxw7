import { useState, useEffect, useMemo, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import { StatCard } from '@/components/dashboards/stat-card'
import { ChartCard } from '@/components/dashboards/chart-card'
import { downloadBarChart, downloadStatCard } from '@/lib/chart-export'
import { useAuth } from '@/hooks/use-auth'
import {
  getConversations,
  getAllChatMessages,
  type ChatConversation,
  type ChatMessage,
} from '@/services/chat'
import { getUsers } from '@/services/users'
import { useRealtime } from '@/hooks/use-realtime'
import { formatDuration } from '@/lib/response-time'
import { MessageSquare, Users, Clock, MessagesSquare, Loader2 } from 'lucide-react'
import { HURAM_CHART_COLORS } from '@/lib/huram-charts-theme'

interface UserMap {
  [id: string]: { name: string; avatar: string }
}

export function ChatProductivityDashboard() {
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [userMap, setUserMap] = useState<UserMap>({})
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const userName = (user?.name as string) || (user?.email as string) || 'Usuário'

  const loadData = useCallback(async () => {
    try {
      const [convs, msgs, users] = await Promise.all([
        getConversations(),
        getAllChatMessages(),
        getUsers(),
      ])
      setConversations(convs)
      setMessages(msgs)
      const map: UserMap = {}
      for (const u of users as unknown as Array<{
        id: string
        name: string
        email: string
        avatar: string
      }>) {
        map[u.id] = { name: u.name || u.email, avatar: u.avatar || '' }
      }
      setUserMap(map)
    } catch {
      /* ignored */
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])
  useRealtime('chat_conversations', () => loadData())
  useRealtime('chat_messages', () => loadData())

  const stats = useMemo(() => {
    const byAtt: Record<string, { c: number; m: number; rt: number[] }> = {}
    const cMap: Record<string, string> = {}
    for (const cv of conversations) {
      const a = cv.attendant_id || 'unassigned'
      cMap[cv.id] = a
      if (!byAtt[a]) byAtt[a] = { c: 0, m: 0, rt: [] }
      byAtt[a].c++
    }
    const mByC: Record<string, ChatMessage[]> = {}
    for (const msg of messages) {
      const cid = msg.conversation_id
      if (!mByC[cid]) mByC[cid] = []
      mByC[cid].push(msg)
      const a = cMap[cid] || 'unassigned'
      if (!byAtt[a]) byAtt[a] = { c: 0, m: 0, rt: [] }
      byAtt[a].m++
    }
    let tRt = 0,
      rtC = 0
    for (const cv of conversations) {
      const cm = (mByC[cv.id] || []).sort(
        (a, b) => new Date(a.created).getTime() - new Date(b.created).getTime(),
      )
      const fc = cm.find((m) => m.sender === 'client'),
        fr = cm.find((m) => m.sender !== 'client')
      if (fc && fr) {
        const d = new Date(fr.created).getTime() - new Date(fc.created).getTime()
        if (d >= 0) {
          tRt += d
          rtC++
          byAtt[cv.attendant_id || 'unassigned']?.rt.push(d)
        }
      }
    }
    const chartData = Object.entries(byAtt).map(([id, v]) => ({
      name: userMap[id]?.name || 'Sem atendente',
      id,
      convs: v.c,
      msgs: v.m,
      avgResponse: v.rt.length ? v.rt.reduce((a, b) => a + b, 0) / v.rt.length : 0,
    }))
    return {
      chartData,
      avgResponseMs: rtC ? tRt / rtC : 0,
      activeConvs: conversations.filter((c) => !c.closed).length,
      totalConvs: conversations.length,
      totalMsgs: messages.length,
    }
  }, [conversations, messages, userMap])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#063D30] animate-spin" />
      </div>
    )
  }

  const chartConfig = {
    convs: { label: 'Conversas', color: HURAM_CHART_COLORS.primary },
    msgs: { label: 'Mensagens', color: HURAM_CHART_COLORS.tertiary },
  }
  const exp =
    (label: string, value: string, color: string, title: string) => (fmt: 'png' | 'jpg') =>
      downloadStatCard(label, value, color, title, userName, fmt)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          value={stats.totalConvs}
          label="Conversas"
          hexColor={HURAM_CHART_COLORS.primary}
          onExport={exp(
            'Conversas',
            String(stats.totalConvs),
            HURAM_CHART_COLORS.primary,
            'Total de Conversas',
          )}
        />
        <StatCard
          icon={MessageSquare}
          value={stats.totalMsgs}
          label="Mensagens"
          hexColor={HURAM_CHART_COLORS.tertiary}
          onExport={exp(
            'Mensagens',
            String(stats.totalMsgs),
            HURAM_CHART_COLORS.tertiary,
            'Total de Mensagens',
          )}
        />
        <StatCard
          icon={MessagesSquare}
          value={stats.activeConvs}
          label="Ativas"
          hexColor={HURAM_CHART_COLORS.primary}
          onExport={exp(
            'Ativas',
            String(stats.activeConvs),
            HURAM_CHART_COLORS.primary,
            'Conversas Ativas',
          )}
        />
        <StatCard
          icon={Clock}
          value={stats.avgResponseMs > 0 ? formatDuration(stats.avgResponseMs) : '—'}
          label="Tempo médio resposta"
          hexColor={HURAM_CHART_COLORS.tertiary}
          onExport={exp(
            'Tempo médio resposta',
            stats.avgResponseMs > 0 ? formatDuration(stats.avgResponseMs) : '—',
            HURAM_CHART_COLORS.tertiary,
            'Tempo Médio de Resposta do Chat',
          )}
        />
      </div>
      {stats.chartData.length > 0 && (
        <ChartCard
          title="Conversas por Atendente"
          hexColor={HURAM_CHART_COLORS.primary}
          onExport={(fmt) =>
            downloadBarChart(
              stats.chartData.map((d) => ({ name: d.name, value: d.convs })),
              HURAM_CHART_COLORS.primary,
              'Conversas por Atendente',
              userName,
              fmt,
            )
          }
        >
          <ChartContainer config={chartConfig} className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData}>
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: HURAM_CHART_COLORS.axis }}
                  stroke={HURAM_CHART_COLORS.axis}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: HURAM_CHART_COLORS.axis }}
                  stroke={HURAM_CHART_COLORS.axis}
                  allowDecimals={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="convs" fill={HURAM_CHART_COLORS.primary} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </ChartCard>
      )}
      {stats.chartData.length > 0 && (
        <ChartCard
          title="Mensagens por Atendente"
          hexColor={HURAM_CHART_COLORS.tertiary}
          onExport={(fmt) =>
            downloadBarChart(
              stats.chartData.map((d) => ({ name: d.name, value: d.msgs })),
              HURAM_CHART_COLORS.tertiary,
              'Mensagens por Atendente',
              userName,
              fmt,
            )
          }
        >
          <ChartContainer config={chartConfig} className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData}>
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: HURAM_CHART_COLORS.axis }}
                  stroke={HURAM_CHART_COLORS.axis}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: HURAM_CHART_COLORS.axis }}
                  stroke={HURAM_CHART_COLORS.axis}
                  allowDecimals={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="msgs" fill={HURAM_CHART_COLORS.tertiary} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </ChartCard>
      )}
      {stats.chartData.length === 0 && (
        <Card className="border-2 border-dashed border-border">
          <CardContent className="py-16 text-center">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-bold text-foreground mb-1">
              Nenhuma conversa registrada ainda.
            </p>
            <p className="text-sm text-muted-foreground">
              Os dados de produtividade do chat aparecerão aqui automaticamente.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
