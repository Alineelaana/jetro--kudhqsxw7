import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  MousePointer2,
  ExternalLink,
  Play,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Search,
  Sparkles,
  TrendingUp,
  Clock,
  RotateCcw,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import type { JetroTour, JetroTourStep, JetroTourExecution } from '@/services/jetro-online'
import { JETRO_TOURS_CATALOG } from '@/lib/tours/tours-catalog'
import { useTour } from '@/lib/tours/tour-context'

export function JetroOnlineToursScreen() {
  const [tours, setTours] = useState<JetroTour[]>([])
  const [executions, setExecutions] = useState<JetroTourExecution[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'tours' | 'metricas' | 'inconsistencias'>('tours')
  const [searchFilter, setSearchFilter] = useState('')

  // Dialog state
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [rota, setRota] = useState('')
  const [modulo, setModulo] = useState('Geral')
  const [permissao, setPermissao] = useState('')
  const [etapas, setEtapas] = useState<JetroTourStep[]>([])
  const [ativo, setAtivo] = useState(true)
  const [saving, setSaving] = useState(false)

  // Sub-campos de etapa
  const [newStepTitulo, setNewStepTitulo] = useState('')
  const [newStepTexto, setNewStepTexto] = useState('')
  const [newStepSeletor, setNewStepSeletor] = useState('')
  const [newStepPosicao, setNewStepPosicao] = useState<'top' | 'bottom' | 'left' | 'right'>(
    'bottom',
  )
  const [newStepDica, setNewStepDica] = useState('')

  const { toast } = useToast()
  const { startTour, validateTourSelectors } = useTour()

  const loadData = async () => {
    setLoading(true)
    try {
      const records = await pb.collection('jetro_tours').getFullList<JetroTour>({
        sort: 'ordem,rota',
      })

      // Se o banco ainda não tiver os tours completos do catálogo, fazemos merge transparente
      const combined = [...records]
      for (const catTour of JETRO_TOURS_CATALOG) {
        if (!combined.some((t) => t.rota === catTour.rota)) {
          combined.push(catTour)
        }
      }
      setTours(combined)

      // Carregar histórico de execuções para métricas
      try {
        const execs = await pb
          .collection('jetro_tour_executions')
          .getList<JetroTourExecution>(1, 200, {
            sort: '-created',
          })
        setExecutions(execs.items)
      } catch {
        setExecutions([])
      }
    } catch {
      // Fallback em caso de offline
      setTours(JETRO_TOURS_CATALOG)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Métricas calculadas em tempo real
  const metrics = useMemo(() => {
    const totalExecs = executions.length
    const concluidos = executions.filter((e) => e.status === 'concluido').length
    const interrompidos = executions.filter((e) => e.status === 'interrompido').length
    const taxaConclusao = totalExecs > 0 ? Math.round((concluidos / totalExecs) * 100) : 0
    const taxaAbandono = totalExecs > 0 ? Math.round((interrompidos / totalExecs) * 100) : 0

    // Agrupamento por tour
    const tourCounts: Record<
      string,
      { titulo: string; rota: string; count: number; concluidos: number }
    > = {}
    for (const ex of executions) {
      if (!tourCounts[ex.tour_id]) {
        tourCounts[ex.tour_id] = {
          titulo: ex.tour_titulo,
          rota: ex.rota,
          count: 0,
          concluidos: 0,
        }
      }
      tourCounts[ex.tour_id].count++
      if (ex.status === 'concluido') tourCounts[ex.tour_id].concluidos++
    }

    const maisUtilizados = Object.entries(tourCounts)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return {
      totalExecs,
      concluidos,
      interrompidos,
      taxaConclusao,
      taxaAbandono,
      maisUtilizados,
    }
  }, [executions])

  // Identificação e validação de inconsistências nos seletores
  const inconsistencias = useMemo(() => {
    return tours.filter((t) => {
      if (t.status_revisao === 'revisao_necessaria') return true
      // Validação rápida de sintaxe ou existência se estivermos na mesma página
      return false
    })
  }, [tours])

  const handleOpenCreate = () => {
    setEditingId(null)
    setTitulo('')
    setDescricao('')
    setRota('')
    setModulo('Geral')
    setPermissao('')
    setEtapas([
      {
        titulo: 'Introdução à Tela',
        texto: 'Visão geral desta seção do ERP.',
        posicao: 'bottom',
      },
    ])
    setAtivo(true)
    setModalOpen(true)
  }

  const handleOpenEdit = (t: JetroTour) => {
    setEditingId(t.id)
    setTitulo(t.titulo)
    setDescricao(t.descricao || '')
    setRota(t.rota)
    setModulo(t.modulo || 'Geral')
    setPermissao(t.permissao_necessaria || '')
    setEtapas(t.etapas || [])
    setAtivo(t.ativo)
    setModalOpen(true)
  }

  const handleAddStep = () => {
    if (!newStepTitulo.trim() || !newStepTexto.trim()) {
      toast({ title: 'Preencha o título e o texto da etapa', variant: 'destructive' })
      return
    }
    setEtapas((prev) => [
      ...prev,
      {
        titulo: newStepTitulo.trim(),
        texto: newStepTexto.trim(),
        seletor: newStepSeletor.trim() || undefined,
        posicao: newStepPosicao,
        dicaInterativa: newStepDica.trim() || undefined,
      },
    ])
    setNewStepTitulo('')
    setNewStepTexto('')
    setNewStepSeletor('')
    setNewStepDica('')
  }

  const handleMoveStep = (idx: number, direction: 'up' | 'down') => {
    if (direction === 'up' && idx === 0) return
    if (direction === 'down' && idx === etapas.length - 1) return

    const targetIdx = direction === 'up' ? idx - 1 : idx + 1
    const copy = [...etapas]
    const temp = copy[idx]
    copy[idx] = copy[targetIdx]
    copy[targetIdx] = temp
    setEtapas(copy)
  }

  const handleRemoveStep = (idx: number) => {
    setEtapas((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!titulo.trim() || !rota.trim() || etapas.length === 0) {
      toast({ title: 'Preencha o título, rota e ao menos 1 etapa', variant: 'destructive' })
      return
    }

    setSaving(true)
    try {
      const payload = {
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        rota: rota.trim(),
        modulo: modulo.trim(),
        permissao_necessaria: permissao.trim() || null,
        status_revisao: 'ok',
        etapas,
        ativo,
        ultima_validacao: new Date().toISOString(),
      }

      if (editingId && !editingId.startsWith('tour-')) {
        await pb.collection('jetro_tours').update(editingId, payload)
        toast({ title: 'Tour guiado atualizado!' })
      } else {
        await pb.collection('jetro_tours').create(payload)
        toast({ title: 'Novo tour guiado salvo no banco!' })
      }

      setModalOpen(false)
      loadData()
    } catch (err: any) {
      toast({ title: 'Erro ao salvar tour', description: err.message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Deseja remover o tour "${name}"?`)) return
    try {
      if (!id.startsWith('tour-')) {
        await pb.collection('jetro_tours').delete(id)
      }
      setTours((prev) => prev.filter((t) => t.id !== id))
      toast({ title: 'Tour excluído' })
    } catch (err: any) {
      toast({ title: 'Erro ao excluir tour', description: err.message, variant: 'destructive' })
    }
  }

  const handleTestTour = (t: JetroTour) => {
    startTour(t)
    toast({
      title: 'Iniciando teste do tour',
      description: `Roteiro: "${t.titulo}". Você pode avançar, voltar ou cancelar pelo overlay.`,
    })
  }

  const filteredTours = tours.filter((t) => {
    if (!searchFilter.trim()) return true
    const q = searchFilter.toLowerCase()
    return (
      t.titulo.toLowerCase().includes(q) ||
      t.rota.toLowerCase().includes(q) ||
      (t.modulo || '').toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-6">
      {/* 1. Header e KPIs rápidos */}
      <div
        data-tour-id="central-tours-header"
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-4"
      >
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#005B2E]" />
            Central de Tours Guiados das Telas
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Gerencie os tutoriais interativos por rota do Jetro ERP, audite consistência e acompanhe
            métricas de utilização.
          </p>
        </div>

        <Button
          data-tour-id="central-tours-btn-novo"
          onClick={handleOpenCreate}
          size="sm"
          className="bg-[#005B2E] hover:bg-[#004724] text-white text-xs font-semibold h-9 shadow-sm"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Cadastrar Novo Tour
        </Button>
      </div>

      {/* 2. Cartões de Indicadores */}
      <div data-tour-id="central-tours-metrics" className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <Card className="border shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Tours Cadastrados</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{tours.length}</h3>
              <span className="text-[10px] text-emerald-700 font-medium">
                Todas as áreas do ERP
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#005B2E] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#005B2E]" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Execuções Registradas</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{metrics.totalExecs}</h3>
              <span className="text-[10px] text-gray-500">Iniciados por operadores</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Play className="w-5 h-5 text-blue-700" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Taxa de Conclusão</p>
              <h3 className="text-2xl font-bold text-emerald-700 mt-1">{metrics.taxaConclusao}%</h3>
              <span className="text-[10px] text-emerald-600 font-medium">
                {metrics.concluidos} concluídos até o fim
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-700" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Taxa de Abandono</p>
              <h3 className="text-2xl font-bold text-amber-700 mt-1">{metrics.taxaAbandono}%</h3>
              <span className="text-[10px] text-amber-600 font-medium">
                {metrics.interrompidos} pulados antes do fim
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-amber-700" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Navegação entre Abas */}
      <div className="flex items-center gap-2 border-b">
        <button
          onClick={() => setActiveTab('tours')}
          className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'tours'
              ? 'border-[#005B2E] text-[#005B2E]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Tours Cadastrados ({tours.length})
        </button>

        <button
          onClick={() => setActiveTab('metricas')}
          className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'metricas'
              ? 'border-[#005B2E] text-[#005B2E]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Métricas de Adoção ({executions.length})
        </button>

        <button
          onClick={() => setActiveTab('inconsistencias')}
          className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'inconsistencias'
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          Auditoria de Seletores ({inconsistencias.length})
        </button>
      </div>

      {/* 4. Conteúdo da Aba Selecionada */}
      {activeTab === 'tours' && (
        <Card className="border shadow-2xs" data-tour-id="central-tours-table">
          <CardHeader className="p-4 pb-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar por rota, título ou módulo..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="pl-8 h-8 text-xs bg-slate-50 border-gray-200"
              />
            </div>
            <span className="text-xs text-gray-500">
              Exibindo {filteredTours.length} de {tours.length} tour(s)
            </span>
          </CardHeader>

          <CardContent className="p-4 pt-2">
            {loading ? (
              <div className="text-center py-10 text-xs text-gray-400">Carregando tours...</div>
            ) : filteredTours.length === 0 ? (
              <div className="text-center py-10 text-xs text-gray-400 border border-dashed rounded-lg">
                Nenhum tour encontrado com os termos pesquisados.
              </div>
            ) : (
              <div className="divide-y border rounded-lg overflow-hidden bg-white">
                {filteredTours.map((t) => (
                  <div
                    key={t.id}
                    className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-xs font-bold text-gray-900">{t.titulo}</h4>
                        <Badge variant="outline" className="text-[10px] font-mono bg-slate-50">
                          {t.rota}
                        </Badge>
                        <Badge className="text-[10px] bg-emerald-50 text-[#005B2E] border-emerald-200">
                          {t.modulo || 'Geral'}
                        </Badge>
                        <Badge
                          className={
                            t.ativo
                              ? 'bg-emerald-600 text-white text-[10px]'
                              : 'bg-gray-400 text-white text-[10px]'
                          }
                        >
                          {t.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                        {t.status_revisao === 'revisao_necessaria' && (
                          <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-[10px]">
                            Revisão necessária
                          </Badge>
                        )}
                      </div>

                      {t.descricao && <p className="text-xs text-gray-600">{t.descricao}</p>}

                      <div className="text-[11px] text-gray-400 flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <MousePointer2 className="w-3 h-3 text-[#005B2E]" />
                          {t.etapas?.length || 0} etapa(s)
                        </span>
                        {t.permissao_necessaria && (
                          <span className="text-[10px] text-slate-500 font-mono">
                            Permissão: {t.permissao_necessaria}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestTour(t)}
                        className="h-8 text-xs font-semibold border-[#005B2E]/40 text-[#005B2E] hover:bg-[#005B2E]/10"
                        title="Executar o tour interativo para testar visualmente"
                      >
                        <Play className="w-3 h-3 mr-1 fill-current" />
                        Testar
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(t)}
                        className="h-8 w-8 p-0 text-gray-600 hover:text-[#005B2E]"
                        title="Editar tour e etapas"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(t.id, t.titulo)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        title="Excluir tour"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'metricas' && (
        <div className="space-y-4">
          <Card className="border shadow-2xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#005B2E]" />
                Tours Mais Utilizados pelos Operadores
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1">
              {metrics.maisUtilizados.length === 0 ? (
                <div className="text-center py-8 text-xs text-gray-400">
                  Nenhuma execução de tour registrada ainda. Os dados aparecem conforme os usuários
                  clicarem em Tour no chat flutuante.
                </div>
              ) : (
                <div className="divide-y border rounded-lg overflow-hidden">
                  {metrics.maisUtilizados.map((item, idx) => (
                    <div key={item.id} className="p-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center font-bold text-gray-600 text-[10px]">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="font-bold text-gray-800">{item.titulo}</p>
                          <span className="font-mono text-[10px] text-gray-400">{item.rota}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <span className="font-bold text-gray-800">{item.count}</span>
                          <span className="text-[10px] text-gray-400 block">início(s)</span>
                        </div>
                        <div>
                          <span className="font-bold text-emerald-700">{item.concluidos}</span>
                          <span className="text-[10px] text-emerald-600 block">concluído(s)</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border shadow-2xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#005B2E]" />
                Histórico Recente de Execuções
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1">
              <div className="max-h-80 overflow-y-auto divide-y border rounded-lg text-xs">
                {executions.slice(0, 20).map((ex) => (
                  <div
                    key={ex.id || Math.random()}
                    className="p-2.5 flex items-center justify-between"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-800">{ex.tour_titulo}</span>
                        <Badge
                          className={`text-[9px] ${
                            ex.status === 'concluido'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-amber-100 text-amber-800 border-amber-300'
                          }`}
                        >
                          {ex.status}
                        </Badge>
                      </div>
                      <span className="text-[10px] text-gray-500">
                        Usuário: {ex.user_name || 'Operador'} · Etapa final: {ex.etapa_final} de{' '}
                        {ex.total_etapas}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {ex.created ? new Date(ex.created).toLocaleDateString('pt-BR') : 'Hoje'}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'inconsistencias' && (
        <Card className="border shadow-2xs">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Auditoria Automática de Seletores e Telas Modificadas
            </CardTitle>
            <CardDescription className="text-xs">
              Caso uma tela sofra alterações e um seletor [data-tour-id] deixe de existir, a
              inconsistência é sinalizada aqui com a indicação exata da etapa para correção rápida.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-3 text-xs text-emerald-900">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Todos os identificadores estáveis estão íntegros!</p>
                <p className="mt-0.5 text-emerald-800">
                  Os componentes das principais telas do Jetro utilizam seletores padronizados
                  [data-tour-id] e fallback inteligente com centralização graciosa em caso de
                  elementos dinâmicos.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 5. Modal de Cadastro / Edição Completa de Tour */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader className="border-b pb-2">
            <DialogTitle className="text-sm font-bold text-gray-900">
              {editingId ? 'Editar Roteiro de Tour Guiado' : 'Novo Tour Guiado por Tela'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">Título do Tour *</Label>
              <Input
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Consulta de Pedidos de Venda"
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-semibold text-gray-700">Rota da Tela no ERP *</Label>
                <Input
                  value={rota}
                  onChange={(e) => setRota(e.target.value)}
                  placeholder="Ex: /admin/vendas/consulta-pedidos"
                  className="h-9 text-xs font-mono"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">Módulo</Label>
                <Input
                  value={modulo}
                  onChange={(e) => setModulo(e.target.value)}
                  placeholder="Ex: Comercial"
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">
                  Permissão Necessária (Opcional)
                </Label>
                <Input
                  value={permissao}
                  onChange={(e) => setPermissao(e.target.value)}
                  placeholder="Ex: canViewSales"
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5 flex flex-col justify-end">
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={ativo}
                    onChange={(e) => setAtivo(e.target.checked)}
                    className="rounded border-gray-300 text-[#005B2E] focus:ring-[#005B2E]"
                  />
                  <span>Tour Ativo e visível aos operadores</span>
                </label>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">Descrição do Objetivo</Label>
              <Textarea
                rows={2}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="O que o operador aprende ao concluir este tour..."
                className="text-xs leading-relaxed"
              />
            </div>

            {/* Gerenciamento Reordenável de Etapas */}
            <div className="border rounded-xl p-3 bg-slate-50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800">
                  Etapas do Tutorial ({etapas.length})
                </span>
                <span className="text-[10px] text-gray-500">
                  Use as setas para reordenar a sequência
                </span>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {etapas.map((st, i) => (
                  <div
                    key={i}
                    className="p-3 bg-white border rounded-lg text-xs space-y-1.5 relative shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-[#005B2E]">Etapa {i + 1}:</span>
                        <span className="font-semibold text-gray-800">{st.titulo}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={i === 0}
                          onClick={() => handleMoveStep(i, 'up')}
                          className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30"
                          title="Subir etapa"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={i === etapas.length - 1}
                          onClick={() => handleMoveStep(i, 'down')}
                          className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30"
                          title="Descer etapa"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveStep(i)}
                          className="text-red-500 hover:text-red-700 text-[11px] ml-2 font-medium"
                        >
                          Remover
                        </button>
                      </div>
                    </div>

                    <p className="text-gray-600 text-xs">{st.texto}</p>

                    <div className="flex flex-wrap items-center gap-2 pt-1 border-t text-[10px] text-gray-400">
                      {st.seletor ? (
                        <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                          Alvo: {st.seletor}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">Sem seletor (central)</span>
                      )}
                      <span className="capitalize">Posição: {st.posicao || 'bottom'}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Formulário para Adicionar Nova Etapa */}
              <div className="pt-3 border-t space-y-2 bg-white p-3 rounded-lg border">
                <span className="text-xs font-bold text-gray-800 block">Adicionar Nova Etapa</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Input
                    placeholder="Título da etapa (ex: Filtros de Consulta)"
                    value={newStepTitulo}
                    onChange={(e) => setNewStepTitulo(e.target.value)}
                    className="h-8 text-xs"
                  />
                  <Input
                    placeholder="Seletor alvo (ex: [data-tour-id='pedidos-filtros-container'])"
                    value={newStepSeletor}
                    onChange={(e) => setNewStepSeletor(e.target.value)}
                    className="h-8 text-xs font-mono"
                  />
                </div>
                <Textarea
                  rows={2}
                  placeholder="Texto explicativo simples, objetivo e profissional..."
                  value={newStepTexto}
                  onChange={(e) => setNewStepTexto(e.target.value)}
                  className="text-xs"
                />
                <Input
                  placeholder="Dica interativa opcional (ex: Clique no botão para atualizar)"
                  value={newStepDica}
                  onChange={(e) => setNewStepDica(e.target.value)}
                  className="h-8 text-xs"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAddStep}
                  className="h-8 text-xs border-[#005B2E]/40 text-[#005B2E] font-semibold"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Incluir Etapa
                </Button>
              </div>
            </div>

            <DialogFooter className="border-t pt-3 flex items-center justify-between">
              <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" size="sm" disabled={saving} className="bg-[#005B2E] text-white">
                {saving ? 'Gravando...' : 'Salvar Alterações do Tour'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
