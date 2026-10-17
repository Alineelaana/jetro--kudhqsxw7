import { useState, useMemo } from 'react'
import {
  Lightbulb,
  AlertTriangle,
  GitCompare,
  CheckCircle2,
  Filter,
  Layers,
  ArrowRight,
  Workflow,
  Sparkles,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { SegundoCerebroInsight, SegundoCerebroDoc } from '@/types/segundo-cerebro'

interface InsightsProps {
  insights: SegundoCerebroInsight[]
  isLoading: boolean
  onOpenDoc: (doc: Partial<SegundoCerebroDoc>) => void
}

export function SegundoCerebroInsights({ insights, isLoading, onOpenDoc }: InsightsProps) {
  const [selectedDept, setSelectedDept] = useState<string>('TODOS')
  const [selectedCategory, setSelectedCategory] = useState<string>('TODAS')

  // Departamentos únicos
  const departments = useMemo(() => {
    const set = new Set<string>()
    insights.forEach((ins) => {
      if (ins.department) set.add(ins.department)
    })
    return Array.from(set).sort()
  }, [insights])

  const filtered = useMemo(() => {
    return insights.filter((ins) => {
      if (selectedDept !== 'TODOS' && ins.department !== selectedDept) return false
      if (selectedCategory !== 'TODAS' && ins.category !== selectedCategory) return false
      return true
    })
  }, [insights, selectedDept, selectedCategory])

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'Oportunidade':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300'
      case 'Risco':
        return 'bg-rose-50 text-rose-800 border-rose-300'
      case 'Informação Contraditória':
        return 'bg-amber-50 text-amber-800 border-amber-300'
      case 'Processo Duplicado':
        return 'bg-purple-50 text-purple-800 border-purple-300'
      default:
        return 'bg-stone-50 text-stone-700'
    }
  }

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <Card className="p-4 bg-white border border-gray-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#005B2E]/10 flex items-center justify-center shrink-0">
            <Lightbulb className="w-5 h-5 text-[#005B2E]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">
              Central de Insights Estratégicos & Análise de Processos
            </h3>
            <p className="text-xs text-gray-500">
              Mapeamento de etapas desnecessárias, gargalos entre setores e oportunidades de
              padronização.
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-2">
          <Select value={selectedDept} onValueChange={setSelectedDept}>
            <SelectTrigger className="h-8 text-xs w-[170px]">
              <SelectValue placeholder="Departamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODOS">Todos os Setores</SelectItem>
              {departments.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="h-8 text-xs w-[170px]">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODAS">Todas Categorias</SelectItem>
              <SelectItem value="Oportunidade">Oportunidades</SelectItem>
              <SelectItem value="Risco">Riscos</SelectItem>
              <SelectItem value="Informação Contraditória">Contradições</SelectItem>
              <SelectItem value="Processo Duplicado">Processos Duplicados</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Grid de Insights */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-gray-200 text-gray-500">
          <Lightbulb className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-semibold">
            Nenhum insight cadastrado ou divergência detectada
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Novos insights são gerados e validados após cada sincronização documental.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((ins) => (
            <Card
              key={ins.id}
              className="p-5 bg-white border border-gray-200 rounded-xl shadow-2xs space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${getCategoryBadge(
                      ins.category,
                    )}`}
                  >
                    {ins.category}
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    {ins.department}
                  </Badge>
                </div>

                <h4 className="text-sm font-bold text-gray-900 leading-snug">{ins.title}</h4>
                <p className="text-xs text-gray-700 mt-2 leading-relaxed">{ins.content}</p>

                {/* Evidência */}
                <div className="mt-3 p-2.5 rounded-lg bg-stone-50 border border-stone-200 text-[11px] text-gray-600">
                  <strong className="text-gray-800">Evidência Identificada:</strong>
                  <p className="mt-0.5 italic">"{ins.evidence}"</p>
                </div>

                {/* Recomendações */}
                {ins.recommendations && (
                  <div className="mt-2.5 text-xs text-[#005B2E]">
                    <strong>Recomendação de Padronização:</strong> {ins.recommendations}
                  </div>
                )}
              </div>

              {/* Fontes citadas */}
              {ins.sources && ins.sources.length > 0 && (
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                  <span>Fontes: {ins.sources.map((s) => s.title).join(', ')}</span>
                  <button
                    onClick={() =>
                      onOpenDoc({ id: ins.sources?.[0]?.doc_id, title: ins.sources?.[0]?.title })
                    }
                    className="text-[#005B2E] font-medium hover:underline text-xs flex items-center gap-1"
                  >
                    Ver Nota <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
