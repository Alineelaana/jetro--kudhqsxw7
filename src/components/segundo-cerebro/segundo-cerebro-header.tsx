import { Brain, Layers, FolderGit2, Scale, Radar, AlertCircle, RefreshCw } from 'lucide-react'
import { Card } from '@/components/ui/card'
import type { SegundoCerebroMetrics } from '@/types/segundo-cerebro'

interface HeaderProps {
  metrics: SegundoCerebroMetrics
  isLoading: boolean
  onRefresh: () => void
}

export function SegundoCerebroHeader({ metrics, isLoading, onRefresh }: HeaderProps) {
  const formatDate = (iso: string | null) => {
    if (!iso) return 'Nenhuma sincronização'
    try {
      const d = new Date(iso)
      return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return iso
    }
  }

  return (
    <div className="space-y-4">
      {/* Top Banner Jetro Branding */}
      <div className="bg-linear-to-r from-[#01361D] via-[#005B2E] to-[#027A3D] text-white rounded-xl p-5 shadow-sm border border-[#C9A227]/30 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-xs border border-[#C9A227]/40 flex items-center justify-center shrink-0 shadow-inner">
            <Brain className="w-6 h-6 text-[#E4C46A]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Segundo Cérebro da Empresa
              </h1>
              <span className="text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#C9A227]/20 border border-[#C9A227]/50 text-[#E4C46A]">
                Inteligência & Memória Corporativa
              </span>
            </div>
            <p className="text-xs sm:text-sm text-white/80 mt-0.5">
              Todo o conhecimento da organização conectado para transformar informações em decisões.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-white/70 block uppercase font-medium">
              Última Sincronização Obsidian
            </span>
            <span className="text-xs font-semibold text-[#E4C46A]">
              {formatDate(metrics.lastSyncDate)}
            </span>
          </div>
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/20 disabled:opacity-50"
            title="Atualizar indicadores"
            aria-label="Atualizar dados"
          >
            <RefreshCw className={`w-4 h-4 text-[#E4C46A] ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 7 Indicadores em Tempo Real */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        <Card className="p-3 bg-white border border-gray-200/80 hover:border-[#005B2E]/40 transition-colors shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-gray-500 font-medium">Docs Indexados</span>
            <Brain className="w-3.5 h-3.5 text-[#005B2E]" />
          </div>
          <p className="text-lg font-bold text-gray-900 mt-1">
            {isLoading ? '...' : metrics.totalDocs}
          </p>
          <span className="text-[10px] text-gray-400">base de conhecimento</span>
        </Card>

        <Card className="p-3 bg-white border border-gray-200/80 hover:border-[#005B2E]/40 transition-colors shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-gray-500 font-medium">Áreas</span>
            <Layers className="w-3.5 h-3.5 text-[#005B2E]" />
          </div>
          <p className="text-lg font-bold text-gray-900 mt-1">
            {isLoading ? '...' : metrics.totalAreas}
          </p>
          <span className="text-[10px] text-gray-400">departamentos</span>
        </Card>

        <Card className="p-3 bg-white border border-gray-200/80 hover:border-[#005B2E]/40 transition-colors shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-gray-500 font-medium">Projetos</span>
            <FolderGit2 className="w-3.5 h-3.5 text-[#005B2E]" />
          </div>
          <p className="text-lg font-bold text-gray-900 mt-1">
            {isLoading ? '...' : metrics.totalProjects}
          </p>
          <span className="text-[10px] text-gray-400">documentados</span>
        </Card>

        <Card className="p-3 bg-white border border-gray-200/80 hover:border-[#005B2E]/40 transition-colors shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-gray-500 font-medium">Decisões</span>
            <Scale className="w-3.5 h-3.5 text-[#C9A227]" />
          </div>
          <p className="text-lg font-bold text-gray-900 mt-1">
            {isLoading ? '...' : metrics.totalDecisions}
          </p>
          <span className="text-[10px] text-gray-400">identificadas</span>
        </Card>

        <Card className="p-3 bg-white border border-gray-200/80 hover:border-[#005B2E]/40 transition-colors shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-gray-500 font-medium">Oportunidades</span>
            <Radar className="w-3.5 h-3.5 text-[#027A3D]" />
          </div>
          <p className="text-lg font-bold text-gray-900 mt-1">
            {isLoading ? '...' : metrics.totalOpportunities}
          </p>
          <span className="text-[10px] text-gray-400">no radar corporativo</span>
        </Card>

        <Card className="p-3 bg-white border border-gray-200/80 hover:border-amber-400/50 transition-colors shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-amber-700 font-medium">Pendente Revisão</span>
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <p className="text-lg font-bold text-amber-700 mt-1">
            {isLoading ? '...' : metrics.pendingReviews}
          </p>
          <span className="text-[10px] text-amber-600/80">fontes em validação</span>
        </Card>

        <Card className="p-3 bg-white border border-gray-200/80 hover:border-[#005B2E]/40 transition-colors shadow-2xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-gray-500 font-medium">Obsidian</span>
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <p className="text-xs font-bold text-gray-900 mt-2 truncate">
            {metrics.lastSyncDate ? formatDate(metrics.lastSyncDate).split(' ')[0] : 'Nunca'}
          </p>
          <span className="text-[10px] text-gray-400">sincronizado</span>
        </Card>
      </div>
    </div>
  )
}
