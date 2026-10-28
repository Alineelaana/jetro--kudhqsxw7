import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Waves,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Layers,
  Thermometer,
  Calendar,
  Factory,
  ArrowRight,
  TrendingDown,
  Sparkles,
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { ExportActions } from '@/components/shared/export-actions'
import {
  getCuringTanks,
  getCuringBatches,
  getCuringMeasurements,
  createCuringBatch,
  createCuringMeasurement,
  completeCuringBatch,
  consumeCuringBatch,
  getHarvestTickets,
  type CuringTank,
  type CuringBatch,
  type CuringMeasurement,
  type OliveHarvestTicket,
} from '@/services/olive-industry-service'
import { getProductionOrders } from '@/services/production-orders'

export function ScreenTanquesCura() {
  const [tanks, setTanks] = useState<CuringTank[]>([])
  const [batches, setBatches] = useState<CuringBatch[]>([])
  const [measurements, setMeasurements] = useState<CuringMeasurement[]>([])
  const [tickets, setTickets] = useState<OliveHarvestTicket[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTankId, setSelectedTankId] = useState<string>('todos')
  const [selectedBatch, setSelectedBatch] = useState<CuringBatch | null>(null)

  // Diálogos
  const [newBatchModalOpen, setNewBatchModalOpen] = useState(false)
  const [newMeasurementModalOpen, setNewMeasurementModalOpen] = useState(false)
  const [consumeModalOpen, setConsumeModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Form Lote de Cura
  const [batchFormData, setBatchFormData] = useState({
    tank_id: '',
    harvest_ticket_id: '',
    initial_weight_kg: 8500,
    brine_type: 'salmoura_natural' as const,
    initial_salt_concentration_percent: 9.0,
    initial_ph: 4.2,
    target_curing_days: 120,
    responsible_technician: 'Eng. Alimentos Resp.',
    notes: 'Início de fermentação lática controlada.',
  })

  // Form Medição Periódica
  const [measFormData, setMeasFormData] = useState({
    salt_concentration_percent: 8.5,
    ph: 4.1,
    temperature_celsius: 22.5,
    acidity_free_percentage: 0.75,
    observed_loss_kg: 45,
    corrective_action: 'Adição de 50kg de sal grosso e aeração da salmoura.',
    analyst_name: 'Laboratório Huram',
  })

  // Form Consumo por Ordem
  const [selectedOrderId, setSelectedOrderId] = useState<string>('')

  const loadData = async () => {
    setLoading(true)
    try {
      const [tnkList, btcList, msrList, tktList, ordList] = await Promise.all([
        getCuringTanks(),
        getCuringBatches(),
        getCuringMeasurements(),
        getHarvestTickets(),
        getProductionOrders().catch(() => []),
      ])
      setTanks(tnkList)
      setBatches(btcList)
      setMeasurements(msrList)
      setTickets(tktList.filter((t) => t.status === 'fechado'))
      setOrders(
        ordList.filter((o: any) => ['planejada', 'liberada', 'em_producao'].includes(o.status)),
      )

      // Se havia lote selecionado, atualiza referência
      if (selectedBatch) {
        const found = btcList.find((b) => b.id === selectedBatch.id)
        if (found) setSelectedBatch(found)
      } else if (btcList.length > 0) {
        setSelectedBatch(btcList[0])
      }
    } catch {
      toast({ title: 'Erro ao carregar tanques de cura', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Filtragem dos lotes
  const filteredBatches = useMemo(() => {
    if (selectedTankId === 'todos') return batches
    return batches.filter((b) => b.tank_id === selectedTankId)
  }, [batches, selectedTankId])

  // Medições do lote selecionado
  const activeMeasurements = useMemo(() => {
    if (!selectedBatch) return []
    return measurements
      .filter((m) => m.batch_id === selectedBatch.id)
      .sort(
        (a, b) => new Date(b.measurement_date).getTime() - new Date(a.measurement_date).getTime(),
      )
  }, [measurements, selectedBatch])

  // KPIs dos tanques
  const stats = useMemo(() => {
    const emCura = tanks.filter((t) => t.current_status === 'em_cura').length
    const prontos = tanks.filter((t) => t.current_status === 'pronto_para_processamento').length
    const vazios = tanks.filter((t) => t.current_status === 'vazio').length
    const totalCap = tanks.reduce((acc, t) => acc + (t.capacity_kg || 0), 0)
    return { emCura, prontos, vazios, totalCap }
  }, [tanks])

  // Abertura do diálogo de novo lote
  const handleOpenNewBatch = (tankId?: string) => {
    setBatchFormData({
      tank_id: tankId || tanks[0]?.id || '',
      harvest_ticket_id: tickets[0]?.id || '',
      initial_weight_kg: 8500,
      brine_type: 'salmoura_natural',
      initial_salt_concentration_percent: 9.0,
      initial_ph: 4.2,
      target_curing_days: 120,
      responsible_technician: 'Eng. Alimentos Resp.',
      notes: 'Início de fermentação lática controlada.',
    })
    setNewBatchModalOpen(true)
  }

  // Gravar Novo Lote de Cura
  const handleSaveBatch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!batchFormData.tank_id) {
      toast({ title: 'Selecione o tanque físico', variant: 'destructive' })
      return
    }
    setSubmitting(true)
    try {
      const batchCode = `LCURA-${new Date().getFullYear()}-${String(batches.length + 1).padStart(3, '0')}`
      const created = await createCuringBatch({
        batch_code: batchCode,
        tank_id: batchFormData.tank_id,
        harvest_ticket_id: batchFormData.harvest_ticket_id || undefined,
        entry_date: new Date().toISOString(),
        initial_weight_kg: Number(batchFormData.initial_weight_kg),
        current_weight_kg: Number(batchFormData.initial_weight_kg),
        brine_type: batchFormData.brine_type,
        initial_salt_concentration_percent: Number(
          batchFormData.initial_salt_concentration_percent,
        ),
        initial_ph: Number(batchFormData.initial_ph),
        target_curing_days: Number(batchFormData.target_curing_days),
        status: 'em_cura',
        responsible_technician: batchFormData.responsible_technician,
        notes: batchFormData.notes,
      })

      // Primeira medição de entrada no tanque
      await createCuringMeasurement({
        batch_id: created.id,
        tank_id: batchFormData.tank_id,
        measurement_date: new Date().toISOString(),
        salt_concentration_percent: Number(batchFormData.initial_salt_concentration_percent),
        ph: Number(batchFormData.initial_ph),
        temperature_celsius: 22.0,
        acidity_free_percentage: 0.6,
        observed_loss_kg: 0,
        analyst_name: batchFormData.responsible_technician,
      })

      toast({
        title: 'Lote de cura criado!',
        description: `Lote ${batchCode} alocado no tanque. Cura iniciada com sucesso.`,
      })
      setNewBatchModalOpen(false)
      loadData()
    } catch (err: any) {
      toast({
        title: 'Erro ao criar lote de cura',
        description: err?.message,
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Gravar Nova Medição Periódica
  const handleSaveMeasurement = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBatch) return
    setSubmitting(true)
    try {
      await createCuringMeasurement({
        batch_id: selectedBatch.id,
        tank_id: selectedBatch.tank_id,
        measurement_date: new Date().toISOString(),
        salt_concentration_percent: Number(measFormData.salt_concentration_percent),
        ph: Number(measFormData.ph),
        temperature_celsius: Number(measFormData.temperature_celsius),
        acidity_free_percentage: Number(measFormData.acidity_free_percentage),
        observed_loss_kg: Number(measFormData.observed_loss_kg),
        corrective_action: measFormData.corrective_action,
        analyst_name: measFormData.analyst_name,
      })

      toast({
        title: 'Medição periódica registrada!',
        description: `pH: ${measFormData.ph} | Sal: ${measFormData.salt_concentration_percent}% | Temp: ${measFormData.temperature_celsius}°C`,
      })
      setNewMeasurementModalOpen(false)
      loadData()
    } catch (err: any) {
      toast({
        title: 'Erro ao registrar medição',
        description: err?.message,
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Concluir Cura do Tanque (Passa para "Pronto para Processamento")
  const handleCompleteBatch = async (b: CuringBatch) => {
    setActionLoading(b.id)
    try {
      const res = await completeCuringBatch(b.id)
      toast({
        title: 'Cura concluída!',
        description: `Tanque ${res.tank_code} liberado para processamento nas OPs. Peso final: ${res.final_weight_kg.toLocaleString('pt-BR')} kg.`,
      })
      loadData()
    } catch (err: any) {
      toast({ title: 'Erro ao concluir cura', description: err?.message, variant: 'destructive' })
    } finally {
      setActionLoading(null)
    }
  }

  // Consumir Tanque pela Ordem de Produção
  const handleConsumeBatch = async () => {
    if (!selectedBatch || !selectedOrderId) {
      toast({ title: 'Selecione a ordem de produção', variant: 'destructive' })
      return
    }
    setSubmitting(true)
    try {
      await consumeCuringBatch(selectedBatch.id, selectedOrderId)
      toast({
        title: 'Lote de cura transferido para a OP!',
        description: `Lote ${selectedBatch.batch_code} consumido na Ordem de Produção com sucesso.`,
      })
      setConsumeModalOpen(false)
      loadData()
    } catch (err: any) {
      toast({ title: 'Erro ao consumir tanque', description: err?.message, variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#005B2E] text-white shadow-sm">
            <Waves className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                Tanques de Cura & Salmoura
              </h1>
              <Badge
                variant="outline"
                className="text-xs bg-[#005B2E]/10 text-[#005B2E] font-bold border-[#005B2E]/30"
              >
                Parque Fermentativo
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Monitoramento diário de salinidade, pH e temperatura, controle de perdas de
              fermentação e liberação para envase.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            onClick={() => handleOpenNewBatch()}
            className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold text-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Novo Lote de Cura
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={loadData}
            disabled={loading}
            className="text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>

          <ExportActions
            title="Tanques de Cura"
            subtitle="Lotes em fermentação e controle de salmoura"
            filenamePrefix="tanques_cura_huram"
            headers={[
              'Lote',
              'Tanque',
              'Status',
              'Peso Inicial (kg)',
              'Peso Atual (kg)',
              'Salmoura',
              'pH Inicial',
              'Sal Inicial (%)',
              'Dias Cura',
              'Data Entrada',
            ]}
            data={batches.map((b) => [
              b.batch_code,
              b.expand?.tank_id?.code || 'N/D',
              b.status,
              b.initial_weight_kg,
              b.current_weight_kg || b.initial_weight_kg,
              b.brine_type,
              b.initial_ph || '',
              b.initial_salt_concentration_percent || '',
              b.target_curing_days || '',
              b.entry_date,
            ])}
          />
        </div>
      </div>

      {/* KPIS DO PARQUE DE TANQUES */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-2 border-[#005B2E]/20 bg-emerald-50/40">
          <CardContent className="p-3">
            <span className="text-[11px] font-bold text-emerald-800">Tanques em Cura Ativa</span>
            <span className="text-2xl font-black text-[#005B2E] block mt-1">{stats.emCura}</span>
            <span className="text-[10px] text-muted-foreground">Fermentando com monitoramento</span>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200 bg-blue-50/40">
          <CardContent className="p-3">
            <span className="text-[11px] font-bold text-blue-800">Prontos p/ Processamento</span>
            <span className="text-2xl font-black text-blue-700 block mt-1">{stats.prontos}</span>
            <span className="text-[10px] text-muted-foreground">
              Liberados para as ordens (OPs)
            </span>
          </CardContent>
        </Card>

        <Card className="border-2 border-amber-200 bg-amber-50/40">
          <CardContent className="p-3">
            <span className="text-[11px] font-bold text-amber-800">Tanques Livres / Vazio</span>
            <span className="text-2xl font-black text-amber-700 block mt-1">{stats.vazios}</span>
            <span className="text-[10px] text-muted-foreground">Prontos para nova safra</span>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200 bg-purple-50/40">
          <CardContent className="p-3">
            <span className="text-[11px] font-bold text-purple-800">Capacidade Instalada</span>
            <span className="text-2xl font-black text-purple-700 block mt-1">
              {(stats.totalCap / 1000).toFixed(0)} t
            </span>
            <span className="text-[10px] text-muted-foreground">
              {tanks.length} tanques operacionais
            </span>
          </CardContent>
        </Card>
      </div>

      {/* MAPA VISUAL DOS TANQUES (CARDS RÁPIDOS) */}
      <Card className="border shadow-sm">
        <CardHeader className="py-3 px-4 border-b bg-muted/20">
          <CardTitle className="text-xs font-bold text-foreground flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Factory className="w-4 h-4 text-[#005B2E]" /> Parque Físico de Tanques de Cura
            </span>
            <span className="text-[11px] font-normal text-muted-foreground">
              Clique em um tanque para detalhar o lote ativo e histórico de medições
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {tanks.map((tank) => {
              const activeBatch = batches.find(
                (b) =>
                  b.tank_id === tank.id &&
                  (b.status === 'em_cura' || b.status === 'pronto_para_processamento'),
              )
              const isSelected = selectedBatch?.tank_id === tank.id

              return (
                <div
                  key={tank.id}
                  onClick={() => {
                    if (activeBatch) setSelectedBatch(activeBatch)
                    setSelectedTankId(tank.id)
                  }}
                  className={`cursor-pointer p-3 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'border-[#005B2E] bg-emerald-50/60 shadow-md ring-2 ring-[#005B2E]/20'
                      : tank.current_status === 'em_cura'
                        ? 'border-blue-300 bg-blue-50/30 hover:border-blue-500'
                        : tank.current_status === 'pronto_para_processamento'
                          ? 'border-emerald-300 bg-emerald-50/30 hover:border-emerald-500'
                          : 'border-muted bg-muted/10 hover:border-muted-foreground/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-foreground">{tank.code}</span>
                    <Badge
                      variant="outline"
                      className={`text-[9px] px-1 py-0 uppercase font-bold ${
                        tank.current_status === 'em_cura'
                          ? 'border-blue-400 text-blue-700 bg-blue-100'
                          : tank.current_status === 'pronto_para_processamento'
                            ? 'border-emerald-400 text-emerald-800 bg-emerald-100'
                            : 'border-gray-300 text-gray-600'
                      }`}
                    >
                      {tank.current_status === 'em_cura'
                        ? 'Cura'
                        : tank.current_status === 'pronto_para_processamento'
                          ? 'Pronto'
                          : 'Livre'}
                    </Badge>
                  </div>

                  <span className="text-[10px] text-muted-foreground block mt-1 truncate">
                    {tank.name}
                  </span>

                  <div className="mt-2 pt-2 border-t text-[10px] space-y-0.5">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Capacidade:</span>
                      <strong className="text-foreground font-mono">
                        {(tank.capacity_kg / 1000).toFixed(1)}t
                      </strong>
                    </div>
                    {activeBatch && (
                      <div className="flex justify-between text-emerald-800 font-semibold font-mono">
                        <span>Lote:</span>
                        <span>{activeBatch.batch_code}</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* DETALHE DO LOTE SELECIONADO E MEDIÇÕES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Painel do Lote Selecionado */}
        <Card className="border shadow-sm lg:col-span-1">
          <CardHeader className="py-3 px-4 border-b bg-muted/20">
            <CardTitle className="text-xs font-bold text-[#005B2E] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Layers className="w-4 h-4" /> Detalhes do Lote em Cura
              </span>
              {selectedBatch && (
                <Badge className="text-xs capitalize">
                  {selectedBatch.status.replace(/_/g, ' ')}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {selectedBatch ? (
              <>
                <div className="space-y-1">
                  <span className="text-[11px] text-muted-foreground font-mono">
                    Código do Lote:
                  </span>
                  <div className="font-mono font-black text-lg text-foreground">
                    {selectedBatch.batch_code}
                  </div>
                  <span className="text-xs text-muted-foreground block">
                    Tanque: {selectedBatch.expand?.tank_id?.name || 'Tanque'} (
                    {selectedBatch.expand?.tank_id?.code})
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t">
                  <div className="p-2 rounded-lg bg-muted/40">
                    <span className="text-[10px] text-muted-foreground block">Peso Inicial</span>
                    <strong className="font-mono text-foreground">
                      {selectedBatch.initial_weight_kg.toLocaleString('pt-BR')} kg
                    </strong>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/40">
                    <span className="text-[10px] text-muted-foreground block">
                      Peso Atual (Estimado)
                    </span>
                    <strong className="font-mono text-emerald-800">
                      {(
                        selectedBatch.current_weight_kg || selectedBatch.initial_weight_kg
                      ).toLocaleString('pt-BR')}{' '}
                      kg
                    </strong>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/40">
                    <span className="text-[10px] text-muted-foreground block">Salmoura</span>
                    <strong className="capitalize text-foreground">
                      {selectedBatch.brine_type.replace(/_/g, ' ')}
                    </strong>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/40">
                    <span className="text-[10px] text-muted-foreground block">Prazo de Cura</span>
                    <strong className="font-mono text-foreground">
                      {selectedBatch.target_curing_days} dias
                    </strong>
                  </div>
                </div>

                {selectedBatch.expand?.harvest_ticket_id && (
                  <div className="p-2.5 rounded-lg border bg-emerald-50/40 text-xs space-y-1">
                    <span className="text-[10px] font-bold text-emerald-900 block">
                      Ticket de Origem:
                    </span>
                    <div className="flex justify-between">
                      <span className="font-mono text-emerald-800 font-bold">
                        #{selectedBatch.expand.harvest_ticket_id.ticket_number}
                      </span>
                      <span>Grade {selectedBatch.expand.harvest_ticket_id.quality_grade}</span>
                    </div>
                  </div>
                )}

                {/* Ações do Lote */}
                <div className="pt-2 space-y-2">
                  <Button
                    size="sm"
                    onClick={() => setNewMeasurementModalOpen(true)}
                    className="w-full bg-[#005B2E] hover:bg-[#01361D] text-white text-xs font-bold"
                  >
                    <Activity className="w-3.5 h-3.5 mr-1.5" />
                    Registrar Nova Medição (Sal / pH)
                  </Button>

                  {selectedBatch.status === 'em_cura' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCompleteBatch(selectedBatch)}
                      disabled={actionLoading === selectedBatch.id}
                      className="w-full text-xs text-blue-700 border-blue-300 hover:bg-blue-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                      Concluir Cura (Liberar Tanque)
                    </Button>
                  )}

                  {selectedBatch.status === 'pronto_para_processamento' && (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => setConsumeModalOpen(true)}
                      className="w-full text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
                    >
                      <Factory className="w-3.5 h-3.5 mr-1.5" />
                      Consumir em Ordem de Produção (OP)
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-xs text-muted-foreground">
                Selecione um tanque com lote ativo acima.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Histórico e Evolução de Medições Periódicas */}
        <Card className="border shadow-sm lg:col-span-2">
          <CardHeader className="py-3 px-4 border-b bg-muted/20 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-blue-600" /> Histórico de Medições Periódicas
              (Salmoura, pH e Perdas)
            </CardTitle>
            <span className="text-[11px] text-muted-foreground">
              {activeMeasurements.length} medições registradas
            </span>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-bold">Data/Hora</TableHead>
                  <TableHead className="text-xs font-bold text-center">
                    Concentração Sal (%)
                  </TableHead>
                  <TableHead className="text-xs font-bold text-center">pH da Salmoura</TableHead>
                  <TableHead className="text-xs font-bold text-center">Temperatura</TableHead>
                  <TableHead className="text-xs font-bold text-right">
                    Perda Drenagem/Fermentação
                  </TableHead>
                  <TableHead className="text-xs font-bold">Ação Corretiva / Alerta</TableHead>
                  <TableHead className="text-xs font-bold">Analista</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeMeasurements.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-xs text-muted-foreground"
                    >
                      Nenhuma medição registrada para este lote. Clique em "Registrar Nova Medição".
                    </TableCell>
                  </TableRow>
                ) : (
                  activeMeasurements.map((m) => (
                    <TableRow key={m.id} className="hover:bg-muted/20">
                      <TableCell className="font-mono text-xs">
                        {new Date(m.measurement_date).toLocaleDateString('pt-BR')}{' '}
                        {new Date(m.measurement_date).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>

                      <TableCell className="text-center font-mono font-bold text-blue-700 text-xs">
                        {m.salt_concentration_percent}%
                      </TableCell>

                      <TableCell className="text-center font-mono font-bold text-xs">
                        <span
                          className={`px-2 py-0.5 rounded ${
                            m.ph > 5.0 || m.ph < 2.5
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {m.ph.toFixed(2)}
                        </span>
                      </TableCell>

                      <TableCell className="text-center font-mono text-xs">
                        {m.temperature_celsius}°C
                      </TableCell>

                      <TableCell className="text-right font-mono text-xs text-rose-700">
                        {m.observed_loss_kg ? `-${m.observed_loss_kg} kg` : '0 kg'}
                      </TableCell>

                      <TableCell className="text-xs">
                        {m.alert_raised && (
                          <div className="flex items-center gap-1 text-rose-600 font-semibold mb-0.5">
                            <AlertTriangle className="w-3 h-3" /> Fora de faixa
                          </div>
                        )}
                        <span className="text-[11px] text-muted-foreground">
                          {m.corrective_action || 'Sem necessidade de ajuste.'}
                        </span>
                      </TableCell>

                      <TableCell className="text-xs text-muted-foreground">
                        {m.analyst_name || 'Laboratório'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* DIÁLOGO: NOVO LOTE DE CURA */}
      <Dialog open={newBatchModalOpen} onOpenChange={setNewBatchModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-[#005B2E] flex items-center gap-2">
              <Waves className="w-5 h-5" /> Entrada de Lote no Tanque de Cura
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveBatch} className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs font-bold">Tanque de Destino *</Label>
              <Select
                value={batchFormData.tank_id}
                onValueChange={(val) => setBatchFormData((p) => ({ ...p, tank_id: val }))}
              >
                <SelectTrigger className="h-8 text-xs bg-background">
                  <SelectValue placeholder="Selecione o tanque..." />
                </SelectTrigger>
                <SelectContent>
                  {tanks.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.code} — {t.name} (Capacidade: {(t.capacity_kg / 1000).toFixed(1)}t)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Ticket de Safra de Origem</Label>
              <Select
                value={batchFormData.harvest_ticket_id}
                onValueChange={(val) => setBatchFormData((p) => ({ ...p, harvest_ticket_id: val }))}
              >
                <SelectTrigger className="h-8 text-xs bg-background">
                  <SelectValue placeholder="Vincule ao ticket de safra..." />
                </SelectTrigger>
                <SelectContent>
                  {tickets.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      #{t.ticket_number} — {t.expand?.producer_id?.name || 'Produtor'} (
                      {t.net_weight_kg} kg)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Peso Inicial da Fruta (KG) *</Label>
                <Input
                  type="number"
                  className="h-8 text-xs font-mono"
                  value={batchFormData.initial_weight_kg}
                  onChange={(e) =>
                    setBatchFormData((p) => ({ ...p, initial_weight_kg: Number(e.target.value) }))
                  }
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Tipo de Salmoura</Label>
                <Select
                  value={batchFormData.brine_type}
                  onValueChange={(val: any) => setBatchFormData((p) => ({ ...p, brine_type: val }))}
                >
                  <SelectTrigger className="h-8 text-xs bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="salmoura_natural">Salmoura Natural</SelectItem>
                    <SelectItem value="estilo_sevilhano_soda">Estilo Sevilhano (Soda)</SelectItem>
                    <SelectItem value="estilo_californiano">Estilo Californiano</SelectItem>
                    <SelectItem value="cura_seca_sal">Cura Seca (Sal)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">% Sal Inicial</Label>
                <Input
                  type="number"
                  step="0.1"
                  className="h-8 text-xs font-mono"
                  value={batchFormData.initial_salt_concentration_percent}
                  onChange={(e) =>
                    setBatchFormData((p) => ({
                      ...p,
                      initial_salt_concentration_percent: Number(e.target.value),
                    }))
                  }
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">pH Inicial</Label>
                <Input
                  type="number"
                  step="0.1"
                  className="h-8 text-xs font-mono"
                  value={batchFormData.initial_ph}
                  onChange={(e) =>
                    setBatchFormData((p) => ({ ...p, initial_ph: Number(e.target.value) }))
                  }
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Dias Previstos</Label>
                <Input
                  type="number"
                  className="h-8 text-xs font-mono"
                  value={batchFormData.target_curing_days}
                  onChange={(e) =>
                    setBatchFormData((p) => ({ ...p, target_curing_days: Number(e.target.value) }))
                  }
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Responsável Técnico</Label>
              <Input
                className="h-8 text-xs"
                value={batchFormData.responsible_technician}
                onChange={(e) =>
                  setBatchFormData((p) => ({ ...p, responsible_technician: e.target.value }))
                }
              />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setNewBatchModalOpen(false)}
                className="text-xs"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={submitting}
                className="bg-[#005B2E] hover:bg-[#01361D] text-white text-xs font-bold"
              >
                {submitting ? 'Salvando...' : 'Iniciar Cura no Tanque'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIÁLOGO: NOVA MEDIÇÃO PERIÓDICA */}
      <Dialog open={newMeasurementModalOpen} onOpenChange={setNewMeasurementModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-[#005B2E] flex items-center gap-2">
              <Activity className="w-5 h-5" /> Registro de Medição da Salmoura & Tanque
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveMeasurement} className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label className="text-xs font-bold">Sal (%) *</Label>
                <Input
                  type="number"
                  step="0.1"
                  className="h-8 text-xs font-mono"
                  value={measFormData.salt_concentration_percent}
                  onChange={(e) =>
                    setMeasFormData((p) => ({
                      ...p,
                      salt_concentration_percent: Number(e.target.value),
                    }))
                  }
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold">pH *</Label>
                <Input
                  type="number"
                  step="0.05"
                  className="h-8 text-xs font-mono"
                  value={measFormData.ph}
                  onChange={(e) => setMeasFormData((p) => ({ ...p, ph: Number(e.target.value) }))}
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold">Temperatura (°C) *</Label>
                <Input
                  type="number"
                  step="0.5"
                  className="h-8 text-xs font-mono"
                  value={measFormData.temperature_celsius}
                  onChange={(e) =>
                    setMeasFormData((p) => ({
                      ...p,
                      temperature_celsius: Number(e.target.value),
                    }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Acidez Livre (% ác. lático)</Label>
                <Input
                  type="number"
                  step="0.05"
                  className="h-8 text-xs font-mono"
                  value={measFormData.acidity_free_percentage}
                  onChange={(e) =>
                    setMeasFormData((p) => ({
                      ...p,
                      acidity_free_percentage: Number(e.target.value),
                    }))
                  }
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Perda de Fermentação / Drenagem (KG)</Label>
                <Input
                  type="number"
                  className="h-8 text-xs font-mono text-rose-700"
                  value={measFormData.observed_loss_kg}
                  onChange={(e) =>
                    setMeasFormData((p) => ({
                      ...p,
                      observed_loss_kg: Number(e.target.value),
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Ação Corretiva Realizada / Justificativa</Label>
              <Textarea
                rows={2}
                className="text-xs"
                value={measFormData.corrective_action}
                onChange={(e) =>
                  setMeasFormData((p) => ({ ...p, corrective_action: e.target.value }))
                }
                placeholder="Ex: Adição de salmoura a 10% para elevação de sal; correção com ácido lático."
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Analista / Responsável</Label>
              <Input
                className="h-8 text-xs"
                value={measFormData.analyst_name}
                onChange={(e) => setMeasFormData((p) => ({ ...p, analyst_name: e.target.value }))}
              />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setNewMeasurementModalOpen(false)}
                className="text-xs"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={submitting}
                className="bg-[#005B2E] hover:bg-[#01361D] text-white text-xs font-bold"
              >
                {submitting ? 'Salvando...' : 'Gravar Medição'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIÁLOGO: CONSUMIR TANQUE EM ORDEM DE PRODUÇÃO */}
      <Dialog open={consumeModalOpen} onOpenChange={setConsumeModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-emerald-800 flex items-center gap-2">
              <Factory className="w-5 h-5" /> Transferência para Ordem de Produção (OP)
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Selecione a Ordem de Produção aberta que consumirá o lote{' '}
              <strong className="text-foreground">{selectedBatch?.batch_code}</strong>. O tanque
              será marcado como processado e entrará em ciclo de higienização.
            </p>

            <div className="space-y-1">
              <Label className="text-xs font-bold">Ordem de Produção (Destino) *</Label>
              <Select value={selectedOrderId} onValueChange={setSelectedOrderId}>
                <SelectTrigger className="h-8 text-xs bg-background">
                  <SelectValue placeholder="Selecione a OP..." />
                </SelectTrigger>
                <SelectContent>
                  {orders.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      OP #{o.order_number} — {o.expand?.product_id?.name || 'Produto'} ({o.quantity}{' '}
                      {o.unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setConsumeModalOpen(false)}
                className="text-xs"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleConsumeBatch}
                disabled={submitting || !selectedOrderId}
                className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold"
              >
                {submitting ? 'Transferindo...' : 'Confirmar Consumo na OP'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
