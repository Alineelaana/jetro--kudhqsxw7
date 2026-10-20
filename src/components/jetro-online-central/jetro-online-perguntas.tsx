import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import {
  MessageSquare,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldAlert,
  Youtube,
  Calendar,
  User,
} from 'lucide-react'
import type { JetroOnlinePergunta } from '@/services/jetro-online'

export function JetroOnlinePerguntasScreen() {
  const [perguntas, setPerguntas] = useState<JetroOnlinePergunta[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [moduloFilter, setModuloFilter] = useState('todos')

  const { toast } = useToast()

  const loadData = async () => {
    setLoading(true)
    try {
      const records = await pb
        .collection('jetro_online_perguntas')
        .getFullList<JetroOnlinePergunta>({
          sort: '-created',
        })
      setPerguntas(records)
    } catch {
      toast({ title: 'Erro ao carregar banco de perguntas', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const filtered = perguntas.filter((p) => {
    if (statusFilter !== 'todos' && p.status_resposta !== statusFilter) return false
    if (moduloFilter !== 'todos' && p.modulo !== moduloFilter) return false
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      p.pergunta.toLowerCase().includes(q) ||
      (p.user_name && p.user_name.toLowerCase().includes(q)) ||
      (p.resposta_resumo && p.resposta_resumo.toLowerCase().includes(q))
    )
  })

  const modulosDisponiveis = Array.from(new Set(perguntas.map((p) => p.modulo).filter(Boolean)))

  return (
    <div className="space-y-6">
      <Card className="border shadow-2xs">
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#005B2E]" />
            Perguntas dos Usuários ao HURAM On-line
          </CardTitle>
          <CardDescription className="text-xs">
            Registro auditado de dúvidas dos operadores do ERP, identificação de ausência de
            respostas e sugestões de novos treinamentos.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-2 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filtrar por pergunta, operador ou resumo da resposta..."
                className="pl-9 text-xs h-9"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs h-9 px-2.5 rounded-lg border border-gray-200 bg-white"
              >
                <option value="todos">Todos os Status</option>
                <option value="sucesso">Sucesso / Respondidas</option>
                <option value="sem_resposta">Sem Resposta / Dúvida Aberta</option>
                <option value="erro">Erros Operacionais</option>
                <option value="acesso_restrito">Acesso Restrito</option>
              </select>

              <select
                value={moduloFilter}
                onChange={(e) => setModuloFilter(e.target.value)}
                className="text-xs h-9 px-2.5 rounded-lg border border-gray-200 bg-white"
              >
                <option value="todos">Todos os Módulos</option>
                {modulosDisponiveis.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8 text-xs text-gray-400">Carregando perguntas...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-xs text-gray-400 border border-dashed rounded-lg">
              Nenhuma pergunta registrada no período com os filtros aplicados.
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden divide-y text-xs">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 hover:bg-slate-50/70 transition-colors space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 flex items-center gap-1.5">
                        <User className="w-3 h-3 text-[#005B2E]" />
                        {item.user_name || 'Usuário'}
                      </span>
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {item.user_role || 'PADRÃO'}
                      </Badge>
                      <Badge className="text-[10px] bg-gray-100 text-gray-700 hover:bg-gray-200">
                        Módulo: {item.modulo || 'Geral'}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-gray-400">
                      <Calendar className="w-3 h-3" />
                      {item.created
                        ? new Date(item.created).toLocaleString('pt-BR')
                        : 'Data não informada'}
                      <Badge
                        className={
                          item.status_resposta === 'sucesso'
                            ? 'bg-emerald-600 text-white text-[10px]'
                            : item.status_resposta === 'sem_resposta'
                              ? 'bg-amber-600 text-white text-[10px]'
                              : 'bg-red-600 text-white text-[10px]'
                        }
                      >
                        {item.status_resposta === 'sucesso'
                          ? 'Respondida'
                          : item.status_resposta === 'sem_resposta'
                            ? 'Não Encontrada'
                            : 'Erro/Restrito'}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-gray-900 font-medium bg-white p-2.5 rounded-lg border border-gray-100 shadow-2xs">
                    "{item.pergunta}"
                  </p>

                  {item.resposta_resumo && (
                    <p className="text-gray-600 text-[11px] pl-2 border-l-2 border-[#005B2E]/40 leading-relaxed">
                      <strong>Resposta:</strong> {item.resposta_resumo}
                    </p>
                  )}

                  {item.video_recomendado_titulo && (
                    <div className="flex items-center gap-1.5 text-[11px] text-red-600 bg-red-50 p-1.5 rounded border border-red-200 w-fit">
                      <Youtube className="w-3.5 h-3.5" />
                      <span>
                        Vídeo recomendado: <strong>{item.video_recomendado_titulo}</strong>
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
