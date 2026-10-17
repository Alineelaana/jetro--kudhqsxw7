import { useState } from 'react'
import {
  Radar as RadarIcon,
  Sparkles,
  TrendingUp,
  AlertOctagon,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { updateOpportunityStatus, triggerRadarScan } from '@/services/segundo-cerebro'
import type {
  SegundoCerebroOpportunity,
  OpportunityStatus,
  SegundoCerebroDoc,
} from '@/types/segundo-cerebro'

interface RadarProps {
  opportunities: SegundoCerebroOpportunity[]
  isLoading: boolean
  onRefresh: () => void
  onOpenDoc: (doc: Partial<SegundoCerebroDoc>) => void
}

export function SegundoCerebroRadar({
  opportunities,
  isLoading,
  onRefresh,
  onOpenDoc,
}: RadarProps) {
  const { toast } = useToast()
  const [scanning, setScanning] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const handleScan = async () => {
    setScanning(true)
    try {
      const res = await triggerRadarScan()
      toast({
        title: 'Varredura do Radar Concluída',
        description: res.message,
      })
      onRefresh()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha na varredura'
      toast({
        title: 'Erro na varredura',
        description: msg,
        variant: 'destructive',
      })
    } finally {
      setScanning(false)
    }
  }

  const handleStatusChange = async (id: string, newStatus: OpportunityStatus) => {
    setUpdatingId(id)
    try {
      await updateOpportunityStatus(id, newStatus)
      toast({
        title: 'Status atualizado com sucesso',
        description: `Oportunidade marcada como: ${newStatus}`,
      })
      onRefresh()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao atualizar status'
      toast({
        title: 'Erro ao atualizar',
        description: msg,
        variant: 'destructive',
      })
    } finally {
      setUpdatingId(null)
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'Redução de custos':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300'
      case 'Automação':
        return 'bg-blue-50 text-blue-800 border-blue-300'
      case 'Risco operacional':
        return 'bg-rose-50 text-rose-800 border-rose-300'
      case 'Inconsistência documental':
        return 'bg-amber-50 text-amber-800 border-amber-300'
      case 'Oportunidade comercial':
        return 'bg-purple-50 text-purple-800 border-purple-300'
      default:
        return 'bg-stone-50 text-stone-700'
    }
  }

  return (
    <div className="space-y-4">
      {/* Banner Informativo */}
      <Card className="p-4 bg-linear-to-r from-[#005B2E] to-[#01361D] text-white border-0 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
            <RadarIcon className="w-5 h-5 text-[#E4C46A]" />
          </div>
          <div>
            <h3 className="text-sm font-bold">Radar de Oportunidades & Riscos Corporativos</h3>
            <p className="text-xs text-white/80">
              Análise contínua de processos duplicados, automações viáveis e contradições
              documentais.
              <strong> A IA apenas sugere — a aprovação e execução são 100% humanas.</strong>
            </p>
          </div>
        </div>

        <Button
          onClick={handleScan}
          disabled={scanning}
          className="bg-[#C9A227] hover:bg-[#b08d20] text-gray-900 font-bold text-xs shrink-0 shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${scanning ? 'animate-spin' : ''}`} />
          {scanning ? 'Analisando...' : 'Executar Varredura Agora'}
        </Button>
      </Card>

      {/* Grid de Oportunidades */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : opportunities.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-gray-200 text-gray-500">
          <RadarIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-semibold">Nenhuma oportunidade identificada no momento</p>
          <p className="text-xs text-gray-400 mt-1">
            Conforme regra de fidelidade, se não houver base documental concreta, nada fictício é
            exibido.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {opportunities.map((opp) => (
            <Card
              key={opp.id}
              className="p-5 bg-white border border-gray-200 rounded-xl shadow-2xs flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${getTypeBadge(
                      opp.type,
                    )}`}
                  >
                    {opp.type}
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${
                      opp.priority === 'Alta'
                        ? 'border-rose-300 text-rose-700 bg-rose-50'
                        : 'border-stone-300 text-stone-700'
                    }`}
                  >
                    Prioridade: {opp.priority}
                  </Badge>
                </div>

                <h4 className="text-sm font-bold text-gray-900 leading-snug">{opp.title}</h4>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">Área: {opp.area}</p>

                <p className="text-xs text-gray-700 mt-2 leading-relaxed">{opp.description}</p>

                {/* Evidências */}
                <div className="mt-3 p-2.5 rounded-lg bg-stone-50 border border-stone-200 text-[11px] text-gray-700 space-y-1">
                  <strong>Evidência Documentada:</strong>
                  <p className="italic text-gray-600">"{opp.evidence}"</p>
                  {opp.potential_impact && (
                    <p className="text-emerald-800 font-medium pt-0.5">
                      Impacto Potencial: {opp.potential_impact}
                    </p>
                  )}
                </div>

                {/* Recomendação da IA */}
                <div className="mt-2.5 text-xs text-[#005B2E] font-medium">
                  <strong>Recomendação da IA:</strong> {opp.recommendation}
                </div>
              </div>

              {/* Status e Ações Humanas Conforme Requisito 7 */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-gray-400">Status atual:</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${
                      opp.status === 'Aprovada'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : opp.status === 'Descartada'
                          ? 'bg-stone-100 text-stone-600'
                          : opp.status === 'Implementada'
                            ? 'bg-blue-50 text-blue-800 border-blue-300'
                            : 'bg-amber-50 text-amber-800 border-amber-300'
                    }`}
                  >
                    {opp.status}
                  </Badge>
                </div>

                {/* Botões de Ação para o Usuário */}
                <div className="flex items-center gap-1">
                  {opp.status !== 'Aprovada' && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={updatingId === opp.id}
                      onClick={() => handleStatusChange(opp.id, 'Aprovada')}
                      className="h-7 text-[10px] text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Aprovar
                    </Button>
                  )}
                  {opp.status !== 'Descartada' && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={updatingId === opp.id}
                      onClick={() => handleStatusChange(opp.id, 'Descartada')}
                      className="h-7 text-[10px] text-stone-600 hover:bg-stone-100 border-stone-200"
                    >
                      <XCircle className="w-3 h-3 mr-1" />
                      Descartar
                    </Button>
                  )}
                  {opp.status === 'Aprovada' && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={updatingId === opp.id}
                      onClick={() => handleStatusChange(opp.id, 'Implementada')}
                      className="h-7 text-[10px] text-blue-700 hover:bg-blue-50 border-blue-200"
                    >
                      Marcar Implementada
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
