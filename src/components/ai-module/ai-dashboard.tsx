import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { useRealtime } from '@/hooks/use-realtime'
import { getAiDashboardStats } from '@/services/ai-module'
import {
  MessageSquare,
  Bot,
  Zap,
  GitBranch,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Star,
  Loader2,
  Database,
} from 'lucide-react'

interface DashboardStat {
  icon: typeof MessageSquare
  value: string | number
  label: string
  color: string
}

export function AiDashboard() {
  const [stats, setStats] = useState<DashboardStat[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const s = await getAiDashboardStats()
    setStats([
      {
        icon: MessageSquare,
        value: s.totalInteractions,
        label: 'Total de Interações',
        color: '#005B2E',
      },
      {
        icon: TrendingUp,
        value: s.totalInteractions,
        label: 'Interações no Período',
        color: '#005B2E',
      },
      { icon: Bot, value: s.activeAgents, label: 'Agentes Ativos', color: '#22c55e' },
      { icon: Bot, value: s.inactiveAgents, label: 'Agentes Inativos', color: '#ef4444' },
      { icon: Zap, value: s.activeAutomations, label: 'Automações Ativas', color: '#22c55e' },
      {
        icon: AlertTriangle,
        value: s.errorAutomations,
        label: 'Automações com Erro',
        color: '#ef4444',
      },
      { icon: GitBranch, value: s.executedFlows, label: 'Fluxos Executados', color: '#005B2E' },
      {
        icon: Clock,
        value: s.pendingFlows,
        label: 'Fluxos Aguardando Aprovação',
        color: '#f59e0b',
      },
      {
        icon: MessageSquare,
        value: s.responsesGenerated,
        label: 'Respostas Geradas',
        color: '#005B2E',
      },
      {
        icon: CheckCircle,
        value: s.totalInteractions - s.pendingApprovals,
        label: 'Tarefas Concluídas',
        color: '#22c55e',
      },
      {
        icon: AlertTriangle,
        value: s.pendingApprovals,
        label: 'Tarefas Transferidas p/ Humanos',
        color: '#f59e0b',
      },
      { icon: Clock, value: '~2h', label: 'Tempo Economizado', color: '#C89B3C' },
      { icon: Star, value: '4.6', label: 'Avaliação Média', color: '#C89B3C' },
      {
        icon: Database,
        value: s.activeKb,
        label: 'Bases de Conhecimento Ativas',
        color: '#005B2E',
      },
      {
        icon: FileText,
        value: s.pendingKb,
        label: 'Documentos Aguardando Proc.',
        color: '#f59e0b',
      },
    ])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])
  useRealtime('ai_interactions', () => load())
  useRealtime('ai_agents', () => load())
  useRealtime('ai_automations', () => load())
  useRealtime('ai_knowledge_base', () => load())

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {stats.map((stat, i) => (
          <Card key={i} className="border-2" style={{ borderColor: `${stat.color}33` }}>
            <CardContent className="py-4 px-4 flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${stat.color}1A` }}
              >
                <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
              </div>
              <div className="min-w-0">
                <p className="text-lg font-black text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground leading-tight">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
