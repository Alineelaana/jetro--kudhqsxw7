import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Loader2,
  BookOpen,
  FileText,
  AlertTriangle,
  Clock,
  GitBranch,
  TrendingUp,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { getDashboardStats, type BlueprintDashboardStats } from '@/services/blueprint'
import { useRealtime } from '@/hooks/use-realtime'

export function BlueprintDashboard() {
  const [stats, setStats] = useState<BlueprintDashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      setStats(await getDashboardStats())
    } catch {
      /* noop */
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])
  useRealtime('blueprint_chapters', () => load())
  useRealtime('blueprint_gaps', () => load())

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )
  }

  if (!stats) return null

  const cards = [
    { label: 'Volumes', value: stats.totalVolumes, icon: BookOpen, color: 'text-[#005B2E]' },
    { label: 'Capítulos', value: stats.totalChapters, icon: FileText, color: 'text-blue-600' },
    {
      label: 'Publicados',
      value: stats.publishedChapters,
      icon: CheckCircle,
      color: 'text-emerald-600',
    },
    { label: 'Pendências', value: stats.pendingChapters, icon: Clock, color: 'text-amber-600' },
    { label: 'Vencidos', value: stats.overdueChapters, icon: AlertTriangle, color: 'text-red-600' },
    { label: 'Gaps', value: stats.pendingGaps, icon: XCircle, color: 'text-orange-600' },
    { label: 'ADRs', value: stats.totalADRs, icon: GitBranch, color: 'text-purple-600' },
    {
      label: 'Telas Órfãs',
      value: stats.orphanScreens,
      icon: AlertTriangle,
      color: 'text-pink-600',
    },
    {
      label: 'Health Score',
      value: `${stats.avgHealthScore}%`,
      icon: TrendingUp,
      color: 'text-cyan-600',
    },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {cards.map((c) => (
          <Card key={c.label} className="border-2 border-[#005B2E]/20">
            <CardContent className="p-4 flex items-center gap-3">
              <c.icon className={`w-7 h-7 ${c.color} shrink-0`} />
              <div>
                <p className="text-xl font-black">{c.value}</p>
                <p className="text-xs text-muted-foreground">{c.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-2 border-[#C89B3C]/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-sm">Cobertura Documental</h3>
            <Badge className="bg-[#005B2E]/10 text-[#005B2E]">
              {stats.totalChapters > 0
                ? Math.round((stats.publishedChapters / stats.totalChapters) * 100)
                : 0}
              % publicado
            </Badge>
          </div>
          <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-[#005B2E] transition-all duration-500"
              style={{
                width: `${stats.totalChapters > 0 ? (stats.publishedChapters / stats.totalChapters) * 100 : 0}%`,
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {stats.publishedChapters} de {stats.totalChapters} capítulos publicados ·{' '}
            {stats.pendingGaps} gaps pendentes · {stats.orphanScreens} telas sem documentação
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
