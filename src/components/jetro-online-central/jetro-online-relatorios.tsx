import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import {
  BarChart3,
  MessageSquare,
  Users,
  CheckCircle2,
  AlertTriangle,
  Youtube,
  TrendingUp,
  FileQuestion,
} from 'lucide-react'

export function JetroOnlineRelatoriosScreen() {
  const [loading, setLoading] = useState(true)
  const [totalPerguntas, setTotalPerguntas] = useState(0)
  const [totalRespondidas, setTotalRespondidas] = useState(0)
  const [totalSemResposta, setTotalSemResposta] = useState(0)
  const [totalVideosRecomendados, setTotalVideosRecomendados] = useState(0)
  const [usuariosDistintos, setUsuariosDistintos] = useState<number>(0)
  const [topModulos, setTopModulos] = useState<{ modulo: string; count: number }[]>([])
  const [perguntasSemRespostaRecentes, setPerguntasSemRespostaRecentes] = useState<any[]>([])
  const [videosMaisPopulares, setVideosMaisPopulares] = useState<any[]>([])

  const { toast } = useToast()

  const loadMetrics = async () => {
    setLoading(true)
    try {
      // 1. Perguntas reais registradas no banco
      const perguntas = await pb.collection('jetro_online_perguntas').getFullList({
        sort: '-created',
      })

      setTotalPerguntas(perguntas.length)
      const respondidas = perguntas.filter((p) => p.status_resposta === 'sucesso').length
      const semResp = perguntas.filter((p) => p.status_resposta === 'sem_resposta').length
      setTotalRespondidas(respondidas)
      setTotalSemResposta(semResp)

      const usersSet = new Set(perguntas.map((p) => p.user_id).filter(Boolean))
      setUsuariosDistintos(usersSet.size)

      // Recomendações
      const recCount = perguntas.filter((p) => p.video_recomendado_id).length
      setTotalVideosRecomendados(recCount)

      // Top Módulos
      const moduloCountMap: Record<string, number> = {}
      perguntas.forEach((p) => {
        const m = p.modulo || 'Geral'
        moduloCountMap[m] = (moduloCountMap[m] || 0) + 1
      })
      const sortedModulos = Object.entries(moduloCountMap)
        .map(([modulo, count]) => ({ modulo, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
      setTopModulos(sortedModulos)

      // Sem resposta recentes
      const unans = perguntas.filter((p) => p.status_resposta === 'sem_resposta').slice(0, 5)
      setPerguntasSemRespostaRecentes(unans)

      // 2. Vídeos mais acessados e recomendados
      const vids = await pb.collection('jetro_universidade_videos').getFullList({
        sort: '-visualizacoes,-recomendacoes_count',
      })
      setVideosMaisPopulares(vids.slice(0, 5))
    } catch {
      toast({ title: 'Erro ao carregar relatórios de utilização', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMetrics()
  }, [])

  return (
    <div className="space-y-6">
      <Card className="border shadow-2xs">
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#005B2E]" />
            Relatórios e Indicadores de Utilização do HURAM On-line
          </CardTitle>
          <CardDescription className="text-xs">
            Métricas de engajamento operacional, perguntas resolvidas e aderência aos vídeos da
            Universidade HURAM.
          </CardDescription>
        </CardHeader>{' '}
        <CardContent className="p-5 pt-2 space-y-6">
          {/* Cartões de Indicadores Chave */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border bg-slate-50/60 space-y-1">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                Total de Consultas
              </span>
              <p className="text-2xl font-black text-gray-900">{totalPerguntas}</p>
              <span className="text-[10px] text-gray-400">Interações registradas</span>
            </div>

            <div className="p-4 rounded-xl border bg-emerald-50/50 border-emerald-200/80 space-y-1">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                Respondidas
              </span>
              <p className="text-2xl font-black text-[#005B2E]">{totalRespondidas}</p>
              <span className="text-[10px] text-emerald-600">
                {totalPerguntas > 0
                  ? `${Math.round((totalRespondidas / totalPerguntas) * 100)}% de acurácia`
                  : '100% de precisão'}
              </span>
            </div>

            <div className="p-4 rounded-xl border bg-amber-50/50 border-amber-200/80 space-y-1">
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
                Sem Resposta
              </span>
              <p className="text-2xl font-black text-amber-700">{totalSemResposta}</p>
              <span className="text-[10px] text-amber-600">Oportunidades de treino</span>
            </div>

            <div className="p-4 rounded-xl border bg-blue-50/50 border-blue-200/80 space-y-1">
              <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">
                Operadores Ativos
              </span>
              <p className="text-2xl font-black text-blue-700">{usuariosDistintos}</p>
              <span className="text-[10px] text-blue-600">Usuários únicos</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Módulos mais consultados */}
            <div className="border rounded-xl p-4 bg-white space-y-3">
              <h3 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-[#005B2E]" />
                Módulos do ERP Mais Consultados
              </h3>
              {topModulos.length === 0 ? (
                <p className="text-xs text-gray-400 py-4 text-center">
                  Nenhum dado registrado ainda.
                </p>
              ) : (
                <div className="space-y-2">
                  {topModulos.map((m, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="text-gray-700 font-medium">{m.modulo}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 rounded-full bg-gray-100 overflow-hidden">
                          <div
                            className="h-full bg-[#005B2E]"
                            style={{
                              width: `${Math.min(100, (m.count / (totalPerguntas || 1)) * 100)}%`,
                            }}
                          />
                        </div>
                        <span className="font-bold text-gray-900 w-6 text-right">{m.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Vídeos Mais Populares da Universidade HURAM */}
            <div className="border rounded-xl p-4 bg-white space-y-3">
              <h3 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <Youtube className="w-3.5 h-3.5 text-red-600" />
                Vídeos Mais Recomendados / Acessados
              </h3>
              {videosMaisPopulares.length === 0 ? (
                <p className="text-xs text-gray-400 py-4 text-center">Nenhum vídeo cadastrado.</p>
              ) : (
                <div className="space-y-2 divide-y">
                  {videosMaisPopulares.map((v) => (
                    <div
                      key={v.id}
                      className="pt-2 flex items-center justify-between text-xs gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-gray-900 truncate">{v.titulo}</p>
                        <span className="text-[10px] text-gray-400">Módulo: {v.modulo}</span>
                      </div>
                      <div className="text-right shrink-0 text-[10px] text-gray-500">
                        <div>
                          Recs: <strong>{v.recomendacoes_count || 0}</strong>
                        </div>
                        <div>
                          Views: <strong>{v.visualizacoes || 0}</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Dúvidas sem resposta recentes para alimentar novos treinamentos */}
          <div className="border rounded-xl p-4 bg-white space-y-3">
            <h3 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
              <FileQuestion className="w-3.5 h-3.5 text-amber-600" />
              Perguntas Recentes Sem Resposta (Demanda por novos treinamentos)
            </h3>
            {perguntasSemRespostaRecentes.length === 0 ? (
              <p className="text-xs text-gray-400 py-2">
                Nenhuma dúvida pendente. O assistente respondeu a todas as solicitações recebidas.
              </p>
            ) : (
              <div className="divide-y space-y-1">
                {perguntasSemRespostaRecentes.map((u) => (
                  <div key={u.id} className="pt-2 flex items-start justify-between gap-4 text-xs">
                    <div>
                      <p className="font-semibold text-gray-900">"{u.pergunta}"</p>
                      <span className="text-[10px] text-gray-400">
                        Por {u.user_name || 'Operador'} em {u.modulo || 'Geral'}
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-[10px] border-amber-300 text-amber-700 bg-amber-50"
                    >
                      Criar Treinamento
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
