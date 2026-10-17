import { useState, useMemo } from 'react'
import {
  Scale,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Filter,
  XCircle,
  HelpCircle,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type {
  SegundoCerebroDecision,
  DecisionClassification,
  SegundoCerebroDoc,
} from '@/types/segundo-cerebro'

interface DecisionsProps {
  decisions: SegundoCerebroDecision[]
  isLoading: boolean
  onOpenDoc: (doc: Partial<SegundoCerebroDoc>) => void
}

const CLASSIFICATIONS: DecisionClassification[] = [
  'Decisão aprovada',
  'Proposta em análise',
  'Sugestão',
  'Decisão revogada',
  'Pendente',
]

export function SegundoCerebroDecisions({ decisions, isLoading, onOpenDoc }: DecisionsProps) {
  const [selectedClassif, setSelectedClassif] = useState<string>('TODAS')
  const [onlyConflicts, setOnlyConflicts] = useState(false)

  const filtered = useMemo(() => {
    return decisions.filter((d) => {
      if (selectedClassif !== 'TODAS' && d.classification !== selectedClassif) return false
      if (onlyConflicts && !d.has_conflict) return false
      return true
    })
  }, [decisions, selectedClassif, onlyConflicts])

  const getBadgeVariant = (cl: DecisionClassification) => {
    switch (cl) {
      case 'Decisão aprovada':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300'
      case 'Proposta em análise':
        return 'bg-amber-50 text-amber-800 border-amber-300'
      case 'Sugestão':
        return 'bg-blue-50 text-blue-800 border-blue-300'
      case 'Decisão revogada':
        return 'bg-rose-50 text-rose-800 border-rose-300'
      case 'Pendente':
        return 'bg-stone-100 text-stone-800 border-stone-300'
      default:
        return 'bg-stone-50 text-stone-700'
    }
  }

  return (
    <div className="space-y-4">
      {/* Barra de Filtros */}
      <Card className="p-4 bg-white border border-gray-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-[#005B2E]" />
            <span className="text-xs font-bold text-gray-700 uppercase">
              Memória de Decisões ({filtered.length})
            </span>
          </div>

          <Select value={selectedClassif} onValueChange={setSelectedClassif}>
            <SelectTrigger className="h-8 text-xs w-[190px]">
              <SelectValue placeholder="Classificação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODAS">Todas as Classificações</SelectItem>
              {CLASSIFICATIONS.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant={onlyConflicts ? 'default' : 'outline'}
            size="sm"
            onClick={() => setOnlyConflicts(!onlyConflicts)}
            className={`h-8 text-xs ${
              onlyConflicts ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'text-gray-700'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 mr-1" />
            Apenas Divergências ({decisions.filter((d) => d.has_conflict).length})
          </Button>
        </div>

        <span className="text-[11px] text-gray-400">
          Decisões extraídas e catalogadas via atas e documentos corporativos
        </span>
      </Card>

      {/* Lista de Decisões */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-10 text-center bg-white rounded-xl border border-gray-200 text-gray-500">
          Nenhuma decisão encontrada com os critérios informados.
        </div>
      ) : (
        <div className="space-y-3.5">
          {filtered.map((dec) => (
            <Card
              key={dec.id}
              className={`p-5 bg-white border transition-all shadow-2xs rounded-xl ${
                dec.has_conflict ? 'border-amber-300 bg-amber-50/20' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between flex-wrap gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${getBadgeVariant(
                        dec.classification,
                      )}`}
                    >
                      {dec.classification}
                    </span>
                    {dec.area && (
                      <Badge variant="outline" className="text-[10px] text-gray-600">
                        {dec.area}
                      </Badge>
                    )}
                    {dec.project && (
                      <Badge variant="outline" className="text-[10px] text-blue-700 bg-blue-50">
                        Projeto: {dec.project}
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-gray-900">{dec.subject}</h3>
                </div>

                <div className="text-right">
                  <span className="text-xs font-semibold text-gray-500 block">
                    Data: {new Date(dec.date).toLocaleDateString('pt-BR')}
                  </span>
                  {dec.responsibles && dec.responsibles.length > 0 && (
                    <span className="text-[10px] text-gray-400">
                      Resp: {dec.responsibles.join(', ')}
                    </span>
                  )}
                </div>
              </div>

              {/* Decisão e Justificativa */}
              <div className="space-y-2 mt-3 pt-3 border-t border-gray-100 text-xs">
                <div>
                  <strong className="text-gray-800">Deliberação / Decisão:</strong>
                  <p className="text-gray-700 mt-0.5 leading-relaxed">{dec.decision}</p>
                </div>

                {dec.justification && (
                  <div>
                    <strong className="text-gray-800">Justificativa:</strong>
                    <p className="text-gray-600 mt-0.5">{dec.justification}</p>
                  </div>
                )}

                {dec.impacts && (
                  <div>
                    <strong className="text-gray-800">Impactos Identificados:</strong>
                    <p className="text-gray-600 mt-0.5">{dec.impacts}</p>
                  </div>
                )}
              </div>

              {/* Alerta de Divergência Conforme Requisito 6 */}
              {dec.has_conflict && (
                <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Divergência Documental Identificada:
                  </div>
                  <p className="text-amber-800">{dec.conflict_notes}</p>
                  {dec.conflict_sources && dec.conflict_sources.length > 0 && (
                    <div className="text-[11px] text-amber-900/80 pt-1">
                      <strong>Fontes conflitantes:</strong>{' '}
                      {dec.conflict_sources.map((s, i) => s.title || `Fonte #${i + 1}`).join(' × ')}
                    </div>
                  )}
                </div>
              )}

              {/* Documento de Origem */}
              <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                <span className="truncate">
                  Fonte documental: <strong>{dec.document_source_title || 'Ata arquivada'}</strong>
                </span>
                {dec.document_source_title && (
                  <button
                    onClick={() =>
                      onOpenDoc({
                        id: dec.document_source_id,
                        title: dec.document_source_title,
                      })
                    }
                    className="text-[#005B2E] font-medium hover:underline flex items-center gap-1 shrink-0 ml-2"
                  >
                    <FileText className="w-3 h-3" /> Ver Documento Original
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
