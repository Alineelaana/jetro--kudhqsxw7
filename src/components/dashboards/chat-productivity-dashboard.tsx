import { useState, useEffect, useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import {
  getConversations,
  getAllChatMessages,
  type ChatConversation,
  type ChatMessage,
} from '@/services/chat'
import { getUsers } from '@/services/users'
import { useRealtime } from '@/hooks/use-realtime'
import { MessageSquare, Users, Clock, MessagesSquare, Loader2 } from 'lucide-react'
import { formatDuration } from '@/lib/response-time'

interface UserMap {
  [id: string]: { name: string; avatar: string }
}

export function ChatProductivityDashboard() {
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [userMap, setUserMap] = useState<UserMap>({})
  const [loading, setLoading] = useState(true)

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
      for (const u of users as Array<{ id: string; name: string; email: string; avatar: string }>) {
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
    const byAttendant: Record<string, { convs: number; msgs: number; responseTimes: number[] }> = {}
    const convMap: Record<string, string> = {}

    for (const conv of conversations) {
      const aId = conv.attendant_id || 'unassigned'
      convMap[conv.id] = aId
      if (!byAttendant[aId]) byAttendant[aId] = { convs: 0, msgs: 0, responseTimes: [] }
      byAttendant[aId].convs++
    }

    const msgsByConv: Record<string, ChatMessage[]> = {}
    for (const msg of messages) {
      const cid = msg.conversation_id
      if (!msgsByConv[cid]) msgsByConv[cid] = []
      msgsByConv[cid].push(msg)
      const aId = convMap[cid] || 'unassigned'
      if (!byAttendant[aId]) byAttendant[aId] = { convs: 0, msgs: 0, responseTimes: [] }
      byAttendant[aId].msgs++
    }

    let totalResponseMs = 0
    let responseCount = 0
    for (const conv of conversations) {
      const convMsgs = (msgsByConv[conv.id] || []).sort(
        (a, b) => new Date(a.created).getTime() - new Date(b.created).getTime(),
      )
      const firstClient = convMsgs.find((m) => m.sender === 'client')
      const firstReply = convMsgs.find((m) => m.sender !== 'client')
      if (firstClient && firstReply) {
        const diff =
          new Date(firstReply.created).getTime() - new Date(firstClient.created).getTime()
        if (diff >= 0) {
          totalResponseMs += diff
          responseCount++
          const aId = conv.attendant_id || 'unassigned'
          if (byAttendant[aId]) byAttendant[aId].responseTimes.push(diff)
        }
      }
    }

    const chartData = Object.entries(byAttendant).map(([id, d]) => ({
      name: userMap[id]?.name || 'Sem atendente',
      id,
      convs: d.convs,
      msgs: d.msgs,
      avgResponse:
        d.responseTimes.length > 0
          ? d.responseTimes.reduce((a, b) => a + b, 0) / d.responseTimes.length
          : 0,
    }))

    return {
      chartData,
      avgResponseMs: responseCount > 0 ? totalResponseMs / responseCount : 0,
      activeConvs: conversations.filter((c) => !c.closed).length,
      totalConvs: conversations.length,
      totalMsgs: messages.length,
    }
  }, [conversations, messages, userMap])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )
  }

  const chartConfig = {
    convs: { label: 'Conversas', color: '#005B2E' },
    msgs: { label: 'Mensagens', color: '#C89B3C' },
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="py-4 px-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#005B2E]/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-[#005B2E]" />
            </div>
            <div>
              <p className="text-xl font-black text-foreground">{stats.totalConvs}</p>
              <p className="text-xs text-muted-foreground">Conversas</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-[#C89B3C]/30">
          <CardContent className="py-4 px-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#C89B3C]/10 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-[#C89B3C]" />
            </div>
            <div>
              <p className="text-xl font-black text-foreground">{stats.totalMsgs}</p>
              <p className="text-xs text-muted-foreground">Mensagens</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="py-4 px-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#005B2E]/10 flex items-center justify-center">
              <MessagesSquare className="w-5 h-5 text-[#005B2E]" />
            </div>
            <div>
              <p className="text-xl font-black text-foreground">{stats.activeConvs}</p>
              <p className="text-xs text-muted-foreground">Ativas</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-[#C89B3C]/30">
          <CardContent className="py-4 px-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#C89B3C]/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-[#C89B3C]" />
            </div>
            <div>
              <p className="text-xl font-black text-foreground">
                {stats.avgResponseMs > 0 ? formatDuration(stats.avgResponseMs) : '—'}
              </p>
              <p className="text-xs text-muted-foreground">Tempo médio resposta</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {stats.chartData.length > 0 && (
        <Card className="border-2 border-[#005B2E]/20">
          <CardHeader>
            <CardTitle className="text-base">Conversas por Atendente</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.chartData}>
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12 }}
                    allowDecimals={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="convs" fill="#005B2E" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {stats.chartData.length > 0 && (
        <Card className="border-2 border-[#C89B3C]/30">
          <CardHeader>
            <CardTitle className="text-base">Mensagens por Atendente</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.chartData}>
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12 }}
                    allowDecimals={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="msgs" fill="#C89B3C" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
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
