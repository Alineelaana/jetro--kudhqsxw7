import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ShieldCheck,
  FileCheck2,
  AlertTriangle,
  Lock,
  Unlock,
  Calendar,
  GitBranch,
  Plus,
  Loader2,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  FlaskConical,
  Scale,
  Sparkles,
} from 'lucide-react'
import {
  getQualityInspections,
  createQualityInspection,
  getNonConformities,
  createNonConformity,
  updateNonConformity,
  getTraceability,
} from '@/services/industrial-extended'
import { getProductionOrders } from '@/services/production-orders'
import { getIndustrialItems } from '@/services/industry'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/hooks/use-toast'
import { JetroTable } from '@/components/jetro-table'
import { ExportActions } from '@/components/shared/export-actions'
import { TraceabilityRecallDialog } from '@/components/industry/traceability-recall-dialog'

export function ScreenQualidadeRastreabilidade() {
  const { user } = useAuth()
  const [currentTab, setCurrentTab] = useState('inspecoes')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Dados
  const [inspections, setInspections] = useState<any[]>([])
  const [nonConformities, setNonConformities] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [items, setItems] = useState<any[]>([])
  const [traceRecords, setTraceRecords] = useState<any[]>([])

  // Modal de Recall
  const [recallOpen, setRecallOpen] = useState(false)
  const [inspDialogOpen, setInspDialogOpen] = useState(false)
  const [ncDialogOpen, setNcDialogOpen] = useState(false)

  // Filtro de inspeções
  const [inspectionFilter, setInspectionFilter] = useState<
    'todos' | 'materia_prima' | 'processo' | 'acabado'
  >('todos')

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const [insp, ncs, ord, it, tr] = await Promise.all([
        getQualityInspections(),
        getNonConformities(),
        getProductionOrders(),
        getIndustrialItems(),
        getTraceability(),
      ])

      setInspections(insp)
      setNonConformities(ncs)
      setOrders(ord)
      setItems(it as any[])
      setTraceRecords(tr)
    } catch (err) {
      console.error(err)
      toast({ title: 'Erro ao carregar dados de Qualidade', variant: 'destructive' })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('industrial_quality_inspections', () => loadData(true))
  useRealtime('industrial_non_conformities', () => loadData(true))

  const blockedLotsCount = useMemo(() => {
    return nonConformities.filter((nc) => nc.severity === 'critica' || nc.status === 'aberta')
      .length
  }, [nonConformities])

  const filteredInspections = useMemo(() => {
    if (inspectionFilter === 'todos') return inspections
    return inspections.filter((i) => i.inspection_type === inspectionFilter)
  }, [inspections, inspectionFilter])

  // Ação de bloqueio / liberação de lote
  const handleToggleBlockLot = async (nc: any, newStatus: string) => {
    try {
      await updateNonConformity(nc.id, {
        status: newStatus as any,
        corrective_action: `Lote ${newStatus === 'resolvida' ? 'LIBERADO' : 'BLOQUEADO'} por ${user?.name || 'Qualidade'}`,
      })
      toast({ title: `Lote ${newStatus === 'resolvida' ? 'liberado' : 'bloqueado'} com sucesso!` })
      loadData(true)
    } catch (err: any) {
      toast({
        title: 'Erro ao alterar status do lote',
        description: err?.message,
        variant: 'destructive',
      })
    }
  }

  // Criar inspeção com foco alimentício / azeitonas
  const handleCreateInspection = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    try {
      await createQualityInspection({
        production_order_id: String(fd.get('production_order_id') || '') || undefined,
        inspection_type: String(fd.get('inspection_type') || 'processo') as any,
        lot_number: String(fd.get('lot_number') || 'LOT-2026-PADRAO'),
        inspector_name: user?.name || 'Inspetor BPF',
        status: String(fd.get('status') || 'aprovado') as any,
        notes: String(fd.get('notes') || ''),
        measurements: {
          ph_salmoura: Number(fd.get('ph_salmoura') || 4.0),
          salinidade_pct: Number(fd.get('salinidade_pct') || 6.5),
          peso_drenado_g: Number(fd.get('peso_drenado_g') || 320),
          peso_liquido_g: Number(fd.get('peso_liquido_g') || 500),
          aparencia: String(fd.get('aparencia') || 'Conforme padrão'),
        },
      })
      toast({ title: 'Inspeção e laudo registrados!' })
      setInspDialogOpen(false)
      loadData(true)
    } catch (err: any) {
      toast({
        title: 'Erro ao registrar inspeção',
        description: err?.message,
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <Loader2 className="w-10 h-10 text-[#005B2E] animate-spin" />
        <p className="text-sm font-medium text-muted-foreground">
          Carregando Gestão de Qualidade & Rastreabilidade...
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#005B2E] text-white shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                Qualidade e Rastreabilidade
              </h1>
              <Badge
                variant="outline"
                className="text-xs bg-[#005B2E]/10 text-[#005B2E] font-bold border-[#005B2E]/30"
              >
                BPF & Anvisa/MAPA
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Inspeções de matéria-prima, controle de salmoura e peso drenado, laudos,
              bloqueio/liberação de lotes e recall.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setRecallOpen(true)}
            className="text-xs border-amber-300 text-amber-900 bg-amber-50 hover:bg-amber-100 font-bold"
          >
            <GitBranch className="w-4 h-4 mr-1.5 text-amber-700" />
            Consulta de Recall
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>

          <Button
            size="sm"
            onClick={() => setInspDialogOpen(true)}
            className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold text-xs"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Nova Inspeção
          </Button>
        </div>
      </div>

      {/* CARDS RESUMO DE QUALIDADE */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-2 border-[#005B2E]/20 bg-emerald-50/40">
          <CardContent className="p-3.5">
            <span className="text-xs text-emerald-800 font-semibold block">Laudos Aprovados</span>
            <span className="text-2xl font-black text-[#005B2E]">
              {inspections.filter((i) => i.status === 'aprovado').length}
            </span>
            <span className="text-[11px] text-muted-foreground block mt-0.5">
              Em conformidade sanitária
            </span>
          </CardContent>
        </Card>
        <Card className="border-2 border-[#005B2E]/20 bg-rose-50/40">
          <CardContent className="p-3.5">
            <span className="text-xs text-rose-800 font-semibold block">Lotes Bloqueados</span>
            <span className="text-2xl font-black text-rose-700">{blockedLotsCount}</span>
            <span className="text-[11px] text-muted-foreground block mt-0.5">
              Expedição interditada
            </span>
          </CardContent>
        </Card>
        <Card className="border-2 border-[#005B2E]/20 bg-blue-50/40">
          <CardContent className="p-3.5">
            <span className="text-xs text-blue-800 font-semibold block">Inspeções no Mês</span>
            <span className="text-2xl font-black text-blue-700">{inspections.length}</span>
            <span className="text-[11px] text-muted-foreground block mt-0.5">
              MP, Processo e Acabado
            </span>
          </CardContent>
        </Card>
        <Card className="border-2 border-[#005B2E]/20 bg-amber-50/40">
          <CardContent className="p-3.5">
            <span className="text-xs text-amber-800 font-semibold block">Não Conformidades</span>
            <span className="text-2xl font-black text-amber-700">{nonConformities.length}</span>
            <span className="text-[11px] text-muted-foreground block mt-0.5">
              Ocorrências abertas e tratadas
            </span>
          </CardContent>
        </Card>
      </div>

      {/* AS 7 ABAS ESPECIFICADAS */}
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
        <TabsList className="bg-muted/60 p-1 rounded-xl grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 h-auto gap-1">
          <TabsTrigger
            value="inspecoes"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#005B2E]" />
            <span>1. Inspeções</span>
          </TabsTrigger>
          <TabsTrigger value="laudos" className="text-xs py-2 font-bold flex items-center gap-1.5">
            <FlaskConical className="w-3.5 h-3.5 text-blue-600" />
            <span>2. Análises & Laudos</span>
          </TabsTrigger>
          <TabsTrigger value="nc" className="text-xs py-2 font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>3. Não Conformid.</span>
          </TabsTrigger>
          <TabsTrigger
            value="bloqueio"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <Lock className="w-3.5 h-3.5 text-amber-600" />
            <span>4. Bloqueio/Liberação</span>
          </TabsTrigger>
          <TabsTrigger
            value="validade"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <Calendar className="w-3.5 h-3.5 text-purple-600" />
            <span>5. Validade</span>
          </TabsTrigger>
          <TabsTrigger
            value="rastreabilidade"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <GitBranch className="w-3.5 h-3.5 text-cyan-600" />
            <span>6. Rastreab. Ponta</span>
          </TabsTrigger>
          <TabsTrigger value="bpf" className="text-xs py-2 font-bold flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-emerald-700" />
            <span>7. Evidências BPF</span>
          </TabsTrigger>
        </TabsList>

        {/* ABA 1: INSPEÇÕES (MATÉRIA-PRIMA, EM PROCESSO, PRODUTO ACABADO) */}
        <TabsContent value="inspecoes" className="space-y-4">
          <Card className="border-2 border-[#005B2E]/20">
            <CardContent className="p-4 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-sm text-[#005B2E] flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> Inspeções Sanitárias e Dimensionais
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Verificações realizadas em todas as etapas de recebimento, produção e envase.
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant={inspectionFilter === 'todos' ? 'default' : 'outline'}
                    onClick={() => setInspectionFilter('todos')}
                    className="h-7 text-xs"
                  >
                    Todos
                  </Button>
                  <Button
                    size="sm"
                    variant={inspectionFilter === 'materia_prima' ? 'default' : 'outline'}
                    onClick={() => setInspectionFilter('materia_prima')}
                    className="h-7 text-xs"
                  >
                    Matéria-Prima
                  </Button>
                  <Button
                    size="sm"
                    variant={inspectionFilter === 'processo' ? 'default' : 'outline'}
                    onClick={() => setInspectionFilter('processo')}
                    className="h-7 text-xs"
                  >
                    Em Processo
                  </Button>
                  <Button
                    size="sm"
                    variant={inspectionFilter === 'acabado' ? 'default' : 'outline'}
                    onClick={() => setInspectionFilter('acabado')}
                    className="h-7 text-xs"
                  >
                    Produto Acabado
                  </Button>
                </div>
              </div>

              <JetroTable
                screenId="industria.qualidade.inspecoes"
                columns={[
                  {
                    id: 'lot_number',
                    header: 'Lote Inspecionado',
                    accessorKey: 'lot_number',
                    dataType: 'text',
                    defaultWidth: 140,
                    cell: ({ value }) => (
                      <span className="font-mono font-bold text-xs">{String(value || 'S/N')}</span>
                    ),
                  },
                  {
                    id: 'inspection_type',
                    header: 'Etapa / Tipo',
                    accessorKey: 'inspection_type',
                    dataType: 'text',
                    defaultWidth: 150,
                    cell: ({ value }) => (
                      <Badge variant="outline" className="capitalize text-xs">
                        {String(value || 'processo').replace('_', ' ')}
                      </Badge>
                    ),
                  },
                  {
                    id: 'inspector_name',
                    header: 'Inspetor Técnico',
                    accessorKey: 'inspector_name',
                    dataType: 'text',
                    defaultWidth: 160,
                    cell: ({ value }) => <span className="text-xs">{String(value || 'BPF')}</span>,
                  },
                  {
                    id: 'status',
                    header: 'Parecer',
                    accessorKey: 'status',
                    dataType: 'status',
                    defaultWidth: 130,
                    cell: ({ value }) => (
                      <Badge
                        className={`text-xs ${
                          value === 'aprovado'
                            ? 'bg-emerald-100 text-emerald-800'
                            : value === 'rejeitado'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {String(value || 'pendente')}
                      </Badge>
                    ),
                  },
                  {
                    id: 'measurements',
                    header: 'Parâmetros Medidos (pH / Peso Drenado)',
                    dataType: 'text',
                    defaultWidth: 260,
                    cell: ({ row }) => {
                      const m = (row as any).measurements || {}
                      return (
                        <span className="text-[11px] text-muted-foreground font-mono">
                          {m.ph_salmoura ? `pH: ${m.ph_salmoura} • ` : ''}
                          {m.peso_drenado_g ? `Drenado: ${m.peso_drenado_g}g • ` : ''}
                          {m.salinidade_pct ? `Sal: ${m.salinidade_pct}%` : 'Conforme'}
                        </span>
                      )
                    },
                  },
                ]}
                data={filteredInspections}
                emptyMessage="Nenhuma inspeção encontrada para este filtro."
                exportTitle="Inspeções de Qualidade"
                exportFilename="inspecoes-qualidade.xlsx"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA 2: ANÁLISES E LAUDOS */}
        <TabsContent value="laudos" className="space-y-4">
          <Card className="border-2 border-[#005B2E]/20">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#005B2E] flex items-center gap-2">
                    <FlaskConical className="w-4 h-4" /> Laudos Laboratoriais e Físico-Químicos
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Certificados de análise físico-química e microbiológica emitidos por lote.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg border bg-slate-50 space-y-1 text-xs">
                  <strong className="text-foreground block">Acidez e Salmoura</strong>
                  <p className="text-muted-foreground">
                    pH padrão de 3,8 a 4,2 e teor de cloreto de sódio em 6% a 8%.
                  </p>
                </div>
                <div className="p-3 rounded-lg border bg-slate-50 space-y-1 text-xs">
                  <strong className="text-foreground block">Microbiológico (MAPA)</strong>
                  <p className="text-muted-foreground">
                    Ausência de Salmonella sp em 25g e contagem de bolores/leveduras abaixo do teto
                    legal.
                  </p>
                </div>
                <div className="p-3 rounded-lg border bg-slate-50 space-y-1 text-xs">
                  <strong className="text-foreground block">Ensaio de Vácuo e Fechamento</strong>
                  <p className="text-muted-foreground">
                    Medição manométrica de vedação das tampas metálicas twist-off em vidros de
                    conserva.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA 3: NÃO CONFORMIDADES */}
        <TabsContent value="nc" className="space-y-4">
          <Card className="border-2 border-[#005B2E]/20">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#005B2E] flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Gestão de Não Conformidades (RNC)
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Registro de desvios, investigação de causa raiz e plano de ação corretiva
                    (CAPA).
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setNcDialogOpen(true)}
                  className="bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Abrir RNC
                </Button>
              </div>

              <div className="space-y-2">
                {nonConformities.map((nc) => (
                  <div key={nc.id} className="p-3 rounded-lg border bg-white space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <strong className="text-sm text-foreground">{nc.description}</strong>
                        <Badge variant="outline" className="font-mono text-xs">
                          Lote: {nc.lot_number || 'S/N'}
                        </Badge>
                      </div>
                      <Badge
                        className={
                          nc.status === 'resolvida'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }
                      >
                        {nc.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-muted-foreground">
                      <div>
                        <span>Severidade:</span>{' '}
                        <strong className="capitalize text-foreground">{nc.severity}</strong>
                      </div>
                      <div>
                        <span>Qtd Afetada:</span>{' '}
                        <strong className="text-foreground">{nc.quantity_affected || 0} UN</strong>
                      </div>
                      <div>
                        <span>Responsável:</span>{' '}
                        <strong className="text-foreground">{nc.responsible || 'Qualidade'}</strong>
                      </div>
                    </div>

                    {nc.corrective_action && (
                      <div className="p-2 rounded bg-muted/30">
                        <span className="font-semibold text-foreground">Ação Corretiva:</span>{' '}
                        {nc.corrective_action}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA 4: BLOQUEIO E LIBERAÇÃO DE LOTES */}
        <TabsContent value="bloqueio" className="space-y-4">
          <Card className="border-2 border-[#005B2E]/20">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#005B2E] flex items-center gap-2">
                    <Lock className="w-4 h-4" /> Controle de Quarentena, Bloqueio e Liberação de
                    Lotes
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Lotes em quarentena não podem ser faturados nem expedidos pelo WMS/Vendas até
                    liberação formal da Qualidade.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {nonConformities.map((nc) => (
                  <div
                    key={nc.id}
                    className="p-3 rounded-lg border bg-white flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-foreground">
                          LOTE #{nc.lot_number || 'S/N'}
                        </span>
                        <Badge
                          className={
                            nc.status === 'resolvida'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }
                        >
                          {nc.status === 'resolvida'
                            ? 'Liberado para Expedição'
                            : 'BLOQUEADO / QUARENTENA'}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-[11px] mt-0.5">
                        Motivo do bloqueio: {nc.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {nc.status !== 'resolvida' ? (
                        <Button
                          size="sm"
                          onClick={() => handleToggleBlockLot(nc, 'resolvida')}
                          className="h-8 text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
                        >
                          <Unlock className="w-3.5 h-3.5 mr-1" /> Liberar Lote
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleBlockLot(nc, 'aberta')}
                          className="h-8 text-xs text-rose-700 border-rose-300"
                        >
                          <Lock className="w-3.5 h-3.5 mr-1" /> Bloquear Lote
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA 5: VALIDADE */}
        <TabsContent value="validade" className="space-y-4">
          <Card className="border-2 border-[#005B2E]/20">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#005B2E] flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Gestão de Validade e Shelf-Life (FEFO)
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Acompanhamento de vencimentos de matérias-primas e produtos acabados para
                    garantir giro First-Expired, First-Out.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-lg border bg-emerald-50/50 border-emerald-200">
                  <span className="font-bold text-emerald-900 block">
                    Validade Segura (&gt; 180 dias)
                  </span>
                  <p className="text-muted-foreground">
                    Lotes recém-envasados com prazo de conservação pleno.
                  </p>
                </div>
                <div className="p-3 rounded-lg border bg-amber-50/50 border-amber-200">
                  <span className="font-bold text-amber-900 block">
                    Alerta de Giro (60 a 90 dias)
                  </span>
                  <p className="text-muted-foreground">
                    Recomendação automática de priorização comercial ou promoções.
                  </p>
                </div>
                <div className="p-3 rounded-lg border bg-rose-50/50 border-rose-200">
                  <span className="font-bold text-rose-900 block">
                    Vencimento Crítico (&lt; 30 dias)
                  </span>
                  <p className="text-muted-foreground">
                    Bloqueio preventivo no faturamento para evitar devoluções de clientes.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA 6: RASTREABILIDADE PONTA A PONTA (BASE PARA RECALL) */}
        <TabsContent value="rastreabilidade" className="space-y-4">
          <Card className="border-2 border-[#005B2E]/20">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#005B2E] flex items-center gap-2">
                    <GitBranch className="w-4 h-4" /> Rastreabilidade Bidirecional Ponta a Ponta
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Lote de entrada (fazenda/fornecedor) → Lote da OP → Palete/Caixa → Pedido e
                    Cliente de destino.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setRecallOpen(true)}
                  className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold text-xs"
                >
                  <Search className="w-3.5 h-3.5 mr-1" /> Simular Auditoria / Recall
                </Button>
              </div>

              <div className="p-4 rounded-xl border bg-slate-50 space-y-3 text-xs">
                <span className="font-bold text-foreground block">
                  Fluxo Canônico de Rastreamento Alimentício:
                </span>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <div className="p-2.5 rounded bg-white border">
                    <strong className="text-blue-900 block">1. Entrada / Fornecedor</strong>
                    <span>Lote colheita, NF de entrada, laudo do produtor rural.</span>
                  </div>
                  <div className="p-2.5 rounded bg-white border">
                    <strong className="text-amber-900 block">2. Preparo & Lavagem</strong>
                    <span>Classificação por calibre e preparo da salmoura padronizada.</span>
                  </div>
                  <div className="p-2.5 rounded bg-white border">
                    <strong className="text-[#005B2E] block">3. Envase & OP</strong>
                    <span>Lote da OP gravado na tampa metálica com hora e data de validade.</span>
                  </div>
                  <div className="p-2.5 rounded bg-white border">
                    <strong className="text-purple-900 block">4. Expedição / Cliente</strong>
                    <span>Nota Fiscal Eletrônica e romaneio com tracking do transportador.</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA 7: EVIDÊNCIAS SANITÁRIAS / BPF (ANVISA/MAPA) */}
        <TabsContent value="bpf" className="space-y-4">
          <Card className="border-2 border-[#005B2E]/20">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#005B2E] flex items-center gap-2">
                    <Scale className="w-4 h-4" /> Boas Práticas de Fabricação (BPF) & Foco
                    Conservas/Azeitonas
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Checklist auditável de higiene, sanitização CIP da linha, calibração de balanças
                    e verificação de peso drenado.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-lg border bg-white space-y-2">
                  <strong className="text-foreground block">
                    Controle Metrológico (INMETRO / MAPA)
                  </strong>
                  <div className="space-y-1.5 text-muted-foreground">
                    <p>• Peso Líquido Declarado: 500 g ± 3% tolerância metrológica</p>
                    <p>• Peso Drenado Mínimo: 320 g verificado a cada 30 minutos de envase</p>
                    <p>• Balanças calibradas com pesos-padrão rastreados RBC</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg border bg-white space-y-2">
                  <strong className="text-foreground block">
                    Higienização e Sanitização (CIP)
                  </strong>
                  <div className="space-y-1.5 text-muted-foreground">
                    <p>• Limpeza e desinfecção de tanques de salmoura antes de cada batelada</p>
                    <p>• Enxágue das tubulações e verificação de ausência de resíduos cáusticos</p>
                    <p>• Controle integrado de pragas com laudos mensais arquivados</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* DIÁLOGO: NOVA INSPEÇÃO */}
      <Dialog open={inspDialogOpen} onOpenChange={setInspDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E]">Registrar Inspeção de Qualidade</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateInspection} className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Tipo / Etapa *</Label>
                <Select name="inspection_type" defaultValue="processo">
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="materia_prima">Matéria-Prima (Recebimento)</SelectItem>
                    <SelectItem value="processo">Em Processo (Salmoura/Envase)</SelectItem>
                    <SelectItem value="acabado">Produto Acabado (Final)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-semibold">Lote Avaliado *</Label>
                <Input
                  name="lot_number"
                  required
                  placeholder="LOT-2026-..."
                  className="h-9 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t">
              <div>
                <Label className="text-[11px] font-semibold">pH Salmoura</Label>
                <Input
                  name="ph_salmoura"
                  type="number"
                  step="0.1"
                  defaultValue="4.0"
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-[11px] font-semibold">Salinidade (%)</Label>
                <Input
                  name="salinidade_pct"
                  type="number"
                  step="0.1"
                  defaultValue="6.5"
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-[11px] font-semibold">Peso Líquido (g)</Label>
                <Input
                  name="peso_liquido_g"
                  type="number"
                  defaultValue="500"
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-[11px] font-semibold">Peso Drenado (g)</Label>
                <Input
                  name="peso_drenado_g"
                  type="number"
                  defaultValue="320"
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Parecer do Laudo</Label>
                <Select name="status" defaultValue="aprovado">
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aprovado">Aprovado</SelectItem>
                    <SelectItem value="rejeitado">Rejeitado</SelectItem>
                    <SelectItem value="quarentena">Quarentena</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-semibold">Aspecto Visual</Label>
                <Input
                  name="aparencia"
                  defaultValue="Frutos íntegros, sem manchas"
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold">Observações do Inspetor</Label>
              <Textarea name="notes" rows={2} className="text-xs" />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setInspDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
              >
                Salvar Laudo
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIÁLOGO: NOVA NÃO CONFORMIDADE */}
      <Dialog open={ncDialogOpen} onOpenChange={setNcDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-rose-700 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Abrir Relatório de Não Conformidade (RNC)
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              const fd = new FormData(e.currentTarget)
              try {
                await createNonConformity({
                  description: String(fd.get('description') || ''),
                  severity: String(fd.get('severity') || 'alta') as any,
                  status: 'aberta',
                  lot_number: String(fd.get('lot_number') || ''),
                  quantity_affected: Number(fd.get('quantity_affected') || 0),
                  root_cause: String(fd.get('root_cause') || ''),
                  corrective_action: String(fd.get('corrective_action') || ''),
                  responsible: user?.name || 'Qualidade',
                })
                toast({ title: 'RNC cadastrada com sucesso!' })
                setNcDialogOpen(false)
                loadData(true)
              } catch (err: any) {
                toast({
                  title: 'Erro ao cadastrar RNC',
                  description: err?.message,
                  variant: 'destructive',
                })
              }
            }}
            className="space-y-3 pt-2"
          >
            <div>
              <Label className="text-xs font-semibold">Descrição do Defeito / Desvio *</Label>
              <Input
                name="description"
                required
                placeholder="Ex: Tampa folgada, vazamento de salmoura..."
                className="h-9"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Lote Afetado</Label>
                <Input name="lot_number" placeholder="LOT-..." className="h-9 font-mono" />
              </div>
              <div>
                <Label className="text-xs font-semibold">Severidade</Label>
                <Select name="severity" defaultValue="alta">
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baixa">Baixa</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="critica">Crítica (Bloqueio)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs font-semibold">Causa Raiz</Label>
              <Input
                name="root_cause"
                placeholder="Ex: Descalibração do cabeçote recravador..."
                className="h-9"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Ação Corretiva Imediata</Label>
              <Textarea
                name="corrective_action"
                rows={2}
                placeholder="Ex: Interrupção do lote e reajuste..."
                className="text-xs"
              />
            </div>
            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setNcDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-rose-700 hover:bg-rose-800 text-white font-bold"
              >
                Abrir RNC
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIÁLOGO DE RECALL INTEGRADO */}
      <TraceabilityRecallDialog open={recallOpen} onOpenChange={setRecallOpen} />
    </div>
  )
}
