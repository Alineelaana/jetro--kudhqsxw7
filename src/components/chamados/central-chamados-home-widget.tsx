import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  chamadosService,
  type Chamado,
  type ChamadoStatus,
  type ChamadoPrioridade,
  STATUS_LABELS,
  PRIORIDADE_LABELS,
} from '@/services/chamados'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Eye,
  ArrowRight,
  Inbox,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  UserCheck,
  Flame,
  Calendar as CalendarIcon,
} from 'lucide-react'

export function CentralChamadosHomeWidget() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [chamados, setChamados] = useState<Chamado[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function carregar() {
      try {
        setLoading(true)
        const res = await chamadosService.listarMeusChamados({
          perPage: 60,
          sort: '-created',
        })
        setChamados(res.items)
      } catch (err) {
        console.error('Erro ao carregar chamados para widget home', err)
      } finally {
        setLoading(false)
      }
    }
    carregar()
  }, [])

  // Métricas / Indicadores compactos do usuário
  const abertosPorMim = chamados.filter((c) => c.solicitante === user?.id).length
  const sobMinhaResponsabilidade = chamados.filter(
    (c) => c.profissional_responsavel === user?.id,
  ).length
  const emAndamento = chamados.filter((c) => c.status === 'andamento').length
  const aguardandoAprovacao = chamados.filter((c) => c.status === 'aprovacao').length
  const finalizados = chamados.filter((c) => c.status === 'finalizado').length
  const urgentes = chamados.filter(
    (c) => c.prioridade === 'urgente' && c.status !== 'finalizado' && c.status !== 'cancelado',
  ).length

  // Chamados mais recentes para a tabela resumida (máximo 6)
  const recentes = chamados.slice(0, 6)

  return (
    <div className="space-y-4">
      {/* Barra de Título Superior e Acesso Rápido */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-[#002817] via-[#00381C] to-[#002817] p-4 rounded-xl text-white border-2 border-[#C9A227]/50 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#00140b] border border-[#C9A227] flex items-center justify-center text-[#E4C46A] shadow-inner shrink-0">
            <Inbox className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black tracking-tight text-white flex items-center gap-2">
              Central de Chamados Corporativa
              <span className="text-[10px] bg-[#C9A227] text-slate-950 font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                Jetro
              </span>
            </h2>
            <p className="text-xs text-white/80">
              Acompanhamento integrado de demandas corporativas, aprovações e SLA por setor.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/admin/chamados')}
            className="text-xs bg-[#00140b]/80 border-[#C9A227]/60 text-[#E4C46A] hover:bg-[#C9A227] hover:text-slate-950 font-bold"
          >
            <span>Ver Todos</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>

          <Button
            size="sm"
            onClick={() => navigate('/admin/chamados/novo')}
            className="text-xs bg-[#C9A227] hover:bg-[#b58f1f] text-slate-950 font-extrabold flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Chamado</span>
          </Button>
        </div>
      </div>

      {/* Indicadores Compactos */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <div className="p-3 bg-card rounded-lg border border-border shadow-2xs hover:border-[#005B2E] transition-all">
          <div className="flex items-center justify-between text-muted-foreground text-[11px] font-semibold">
            <span>Abertos por Mim</span>
            <FileText className="w-3.5 h-3.5 text-[#005B2E]" />
          </div>
          <div className="text-xl font-black text-foreground mt-1">{abertosPorMim}</div>
        </div>

        <div className="p-3 bg-card rounded-lg border border-border shadow-2xs hover:border-[#005B2E] transition-all">
          <div className="flex items-center justify-between text-muted-foreground text-[11px] font-semibold">
            <span>Sob Minha Resp.</span>
            <UserCheck className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-xl font-black text-foreground mt-1">{sobMinhaResponsabilidade}</div>
        </div>

        <div className="p-3 bg-card rounded-lg border border-border shadow-2xs hover:border-[#005B2E] transition-all">
          <div className="flex items-center justify-between text-muted-foreground text-[11px] font-semibold">
            <span>Em Andamento</span>
            <Clock className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-xl font-black text-foreground mt-1">{emAndamento}</div>
        </div>

        <div className="p-3 bg-card rounded-lg border border-border shadow-2xs hover:border-[#005B2E] transition-all">
          <div className="flex items-center justify-between text-muted-foreground text-[11px] font-semibold">
            <span>Aguard. Aprovação</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <div className="text-xl font-black text-foreground mt-1">{aguardandoAprovacao}</div>
        </div>

        <div className="p-3 bg-card rounded-lg border border-border shadow-2xs hover:border-[#005B2E] transition-all">
          <div className="flex items-center justify-between text-muted-foreground text-[11px] font-semibold">
            <span>Finalizados</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-foreground mt-1">{finalizados}</div>
        </div>

        <div className="p-3 bg-card rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50/40 dark:bg-rose-950/20 shadow-2xs">
          <div className="flex items-center justify-between text-rose-700 dark:text-rose-300 text-[11px] font-bold">
            <span>Urgentes Ativos</span>
            <Flame className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
          </div>
          <div className="text-xl font-black text-rose-700 dark:text-rose-300 mt-1">{urgentes}</div>
        </div>
      </div>

      {/* Tabela dos Chamados Mais Recentes */}
      <Card className="border-border shadow-2xs overflow-hidden">
        <CardHeader className="py-2.5 px-4 bg-muted/40 border-b border-border flex flex-row items-center justify-between">
          <CardTitle className="text-xs font-bold text-foreground flex items-center gap-2">
            <span>Chamados Mais Recentes</span>
            <Badge variant="outline" className="text-[10px] font-mono">
              {recentes.length} de {chamados.length}
            </Badge>
          </CardTitle>
          <button
            type="button"
            onClick={() => navigate('/admin/chamados')}
            className="text-[11px] text-[#005B2E] dark:text-[#E4C46A] hover:underline font-bold"
          >
            Abrir Central Completa →
          </button>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              Carregando chamados recentes...
            </div>
          ) : recentes.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground space-y-2">
              <p>Nenhum chamado registrado para você no momento.</p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate('/admin/chamados/novo')}
                className="text-xs text-[#005B2E]"
              >
                Abrir o primeiro chamado
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/60 text-muted-foreground border-b border-border text-[11px] uppercase font-bold">
                  <tr>
                    <th className="py-2.5 px-3">Número</th>
                    <th className="py-2.5 px-3">Assunto</th>
                    <th className="py-2.5 px-3">Solicitante</th>
                    <th className="py-2.5 px-3">Setor Responsável</th>
                    <th className="py-2.5 px-3">Responsável</th>
                    <th className="py-2.5 px-3">Prioridade</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Abertura</th>
                    <th className="py-2.5 px-3">Atualização</th>
                    <th className="py-2.5 px-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentes.map((ch) => {
                    const statusCfg = STATUS_LABELS[ch.status] || {
                      label: ch.status,
                      bg: 'bg-slate-100',
                      text: 'text-slate-800',
                      border: 'border-slate-300',
                    }
                    const prioridadeCfg = PRIORIDADE_LABELS[ch.prioridade] || {
                      label: ch.prioridade,
                      badgeClass: 'bg-slate-100 text-slate-800',
                    }
                    const dataAbertura = ch.created
                      ? new Date(ch.created).toLocaleDateString('pt-BR')
                      : '—'
                    const dataAtualizacao = ch.updated
                      ? new Date(ch.updated).toLocaleDateString('pt-BR')
                      : '—'

                    return (
                      <tr
                        key={ch.id}
                        className="hover:bg-muted/40 transition-colors group cursor-pointer"
                        onClick={() => navigate(`/admin/chamados/${ch.id}`)}
                      >
                        <td className="py-2.5 px-3 font-mono font-bold text-[#005B2E] dark:text-[#E4C46A] whitespace-nowrap">
                          {ch.numero}
                        </td>
                        <td
                          className="py-2.5 px-3 font-semibold text-foreground max-w-[220px] truncate"
                          title={ch.assunto}
                        >
                          {ch.assunto}
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground max-w-[120px] truncate">
                          {ch.expand?.solicitante?.name || 'Solicitante'}
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground max-w-[120px] truncate">
                          {ch.expand?.setor_responsavel?.name || 'Geral'}
                        </td>
                        <td className="py-2.5 px-3 text-foreground max-w-[120px] truncate">
                          {ch.expand?.profissional_responsavel?.name || 'Não atribuído'}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span
                            className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full border ${prioridadeCfg.badgeClass}`}
                          >
                            {prioridadeCfg.label}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
                          >
                            {statusCfg.label}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">
                          {dataAbertura}
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">
                          {dataAtualizacao}
                        </td>
                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate(`/admin/chamados/${ch.id}`)
                            }}
                            className="h-6 px-2 text-[11px] text-[#005B2E] dark:text-[#E4C46A] hover:bg-[#005B2E]/10 flex items-center gap-1 ml-auto"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Detalhes</span>
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
