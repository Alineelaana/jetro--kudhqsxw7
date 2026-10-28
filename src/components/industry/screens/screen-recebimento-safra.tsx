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
  Scale,
  Plus,
  RefreshCw,
  Search,
  DollarSign,
  Package,
  Layers,
  CheckCircle2,
  AlertCircle,
  FileText,
  UserCheck,
  Building2,
  Truck,
  Sparkles,
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { ExportActions } from '@/components/shared/export-actions'
import {
  getHarvestTickets,
  createHarvestTicket,
  updateHarvestTicket,
  generateHarvestPayment,
  generateHarvestStockIn,
  getAgriculturalProducers,
  type OliveHarvestTicket,
  type AgriculturalProducer,
} from '@/services/olive-industry-service'
import { getProducts } from '@/services/products'

export function ScreenRecebimentoSafra() {
  const [tickets, setTickets] = useState<OliveHarvestTicket[]>([])
  const [producers, setProducers] = useState<AgriculturalProducer[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('todos')
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Formulário do Ticket
  const [formData, setFormData] = useState({
    producer_id: '',
    raw_material_product_id: '',
    vehicle_plate: '',
    driver_name: '',
    variety: 'Arbequina',
    gross_weight_kg: 0,
    tare_weight_kg: 0,
    caliber_size: '200-240',
    maturation_index: 3.5,
    maturation_stage: 'Véraison',
    defect_percentage: 1.5,
    dirt_impurity_percentage: 0.8,
    quality_grade: 'A' as 'A' | 'B' | 'C' | 'DESCARTE',
    price_per_ton: 3200,
    deductions_amount: 0,
    notes: '',
  })

  // Cálculos automáticos de peso líquido e pagamento ao produtor
  const netWeightKg = useMemo(() => {
    const gross = Number(formData.gross_weight_kg) || 0
    const tare = Number(formData.tare_weight_kg) || 0
    return Math.max(gross - tare, 0)
  }, [formData.gross_weight_kg, formData.tare_weight_kg])

  const calculatedPayment = useMemo(() => {
    if (formData.quality_grade === 'DESCARTE') return 0
    const tons = netWeightKg / 1000
    const price = Number(formData.price_per_ton) || 0
    const deductions = Number(formData.deductions_amount) || 0
    const base = tons * price
    return Math.max(base - deductions, 0)
  }, [netWeightKg, formData.price_per_ton, formData.deductions_amount, formData.quality_grade])

  // Preço sugestivo por grade
  const handleGradeChange = (grade: 'A' | 'B' | 'C' | 'DESCARTE') => {
    let suggestedPrice = 3200
    if (grade === 'B') suggestedPrice = 2800
    else if (grade === 'C') suggestedPrice = 2200
    else if (grade === 'DESCARTE') suggestedPrice = 0

    setFormData((prev) => ({
      ...prev,
      quality_grade: grade,
      price_per_ton: suggestedPrice,
    }))
  }

  const loadData = async () => {
    setLoading(true)
    try {
      const [tList, pList, prodList] = await Promise.all([
        getHarvestTickets(),
        getAgriculturalProducers(),
        getProducts().catch(() => []),
      ])
      setTickets(tList)
      setProducers(pList)
      // Filtra matérias-primas se houver
      setProducts(prodList)
    } catch {
      toast({ title: 'Erro ao carregar recebimento de safra', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpenNew = () => {
    setFormData({
      producer_id: producers[0]?.id || '',
      raw_material_product_id: products[0]?.id || '',
      vehicle_plate: '',
      driver_name: '',
      variety: 'Arbequina',
      gross_weight_kg: 12500,
      tare_weight_kg: 4200,
      caliber_size: '200-240',
      maturation_index: 3.5,
      maturation_stage: 'Véraison',
      defect_percentage: 1.5,
      dirt_impurity_percentage: 0.8,
      quality_grade: 'A',
      price_per_ton: 3200,
      deductions_amount: 150,
      notes: 'Lote colhido pela manhã, frutos túrgidos e sem sinais de fermentação.',
    })
    setModalOpen(true)
  }

  const handleSaveTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.producer_id) {
      toast({ title: 'Selecione o produtor agrícola', variant: 'destructive' })
      return
    }
    if (netWeightKg <= 0) {
      toast({ title: 'Peso bruto deve ser maior que a tara', variant: 'destructive' })
      return
    }

    setSubmitting(true)
    try {
      const ticketNum = `TK-${new Date().getFullYear()}-${String(tickets.length + 1).padStart(4, '0')}`
      await createHarvestTicket({
        ticket_number: ticketNum,
        date_time: new Date().toISOString(),
        producer_id: formData.producer_id,
        raw_material_product_id: formData.raw_material_product_id || undefined,
        vehicle_plate: formData.vehicle_plate,
        driver_name: formData.driver_name,
        variety: formData.variety,
        gross_weight_kg: Number(formData.gross_weight_kg),
        tare_weight_kg: Number(formData.tare_weight_kg),
        net_weight_kg: netWeightKg,
        caliber_size: formData.caliber_size,
        maturation_index: Number(formData.maturation_index),
        maturation_stage: formData.maturation_stage,
        defect_percentage: Number(formData.defect_percentage),
        dirt_impurity_percentage: Number(formData.dirt_impurity_percentage),
        quality_grade: formData.quality_grade,
        price_per_ton: Number(formData.price_per_ton),
        deductions_amount: Number(formData.deductions_amount),
        final_payable_amount: calculatedPayment,
        payment_status: 'pendente',
        status: 'classificado',
        notes: formData.notes,
      })

      toast({
        title: 'Ticket de safra criado!',
        description: `Ticket ${ticketNum} classificado na Grade ${formData.quality_grade}.`,
      })
      setModalOpen(false)
      loadData()
    } catch (err: any) {
      toast({
        title: 'Erro ao criar ticket',
        description: err?.message || 'Verifique os dados informados.',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Ação: Fechar Ticket
  const handleCloseTicket = async (t: OliveHarvestTicket) => {
    setActionLoading(t.id)
    try {
      await updateHarvestTicket(t.id, { status: 'fechado' })
      toast({
        title: 'Ticket fechado com sucesso!',
        description: `Líquido: ${t.net_weight_kg} kg.`,
      })
      loadData()
    } catch (err: any) {
      toast({ title: 'Erro ao fechar ticket', description: err?.message, variant: 'destructive' })
    } finally {
      setActionLoading(null)
    }
  }

  // Ação: Gerar Pagamento ao Produtor (Contas a Pagar uma única vez)
  const handleGeneratePayment = async (t: OliveHarvestTicket) => {
    setActionLoading(t.id)
    try {
      const res = await generateHarvestPayment(t.id)
      toast({
        title: 'Título a pagar gerado no financeiro!',
        description: `Título SAFRA-${t.ticket_number} no valor de R$ ${res.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.`,
      })
      loadData()
    } catch (err: any) {
      toast({ title: 'Erro ao gerar pagamento', description: err?.message, variant: 'destructive' })
    } finally {
      setActionLoading(null)
    }
  }

  // Ação: Gerar Entrada de Matéria-Prima no Estoque (trilha imutável de custo)
  const handleGenerateStock = async (t: OliveHarvestTicket) => {
    setActionLoading(t.id)
    try {
      const res = await generateHarvestStockIn(t.id, t.raw_material_product_id)
      toast({
        title: 'Lote de matéria-prima gerado!',
        description: `Lote ${res.lot_number} com ${res.quantidade} kg registrado no estoque com custo da grade.`,
      })
      loadData()
    } catch (err: any) {
      toast({ title: 'Erro ao gerar estoque', description: err?.message, variant: 'destructive' })
    } finally {
      setActionLoading(null)
    }
  }

  // Filtragem
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchSearch =
        t.ticket_number.toLowerCase().includes(search.toLowerCase()) ||
        (t.expand?.producer_id?.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (t.vehicle_plate || '').toLowerCase().includes(search.toLowerCase())
      const matchStatus = filterStatus === 'todos' || t.status === filterStatus
      return matchSearch && matchStatus
    })
  }, [tickets, search, filterStatus])

  // KPIs
  const kpis = useMemo(() => {
    const totalTons = tickets.reduce((acc, t) => acc + (t.net_weight_kg || 0) / 1000, 0)
    const totalPayable = tickets.reduce((acc, t) => acc + (t.final_payable_amount || 0), 0)
    const gradeACount = tickets.filter((t) => t.quality_grade === 'A').length
    const titulosGerados = tickets.filter(
      (t) => t.payment_status === 'titulo_gerado' || t.payment_status === 'pago',
    ).length
    return { totalTons, totalPayable, gradeACount, titulosGerados }
  }, [tickets])

  return (
    <div className="space-y-4">
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#005B2E] text-white shadow-sm">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                Recebimento de Safra
              </h1>
              <Badge
                variant="outline"
                className="text-xs bg-[#005B2E]/10 text-[#005B2E] font-bold border-[#005B2E]/30"
              >
                Balança & Fruta In Natura
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Pesagem de caminhão, classificação por grade de qualidade, pagamento ao produtor e
              entrada de matéria-prima.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            onClick={handleOpenNew}
            className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold text-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Novo Ticket de Pesagem
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
            title="Recebimento de Safra"
            subtitle="Tickets de pesagem e classificação de azeitonas"
            filenamePrefix="recebimento_safra_huram"
            headers={[
              'Ticket',
              'Data',
              'Produtor',
              'Placa',
              'Bruto (kg)',
              'Tara (kg)',
              'Líquido (kg)',
              'Grade',
              'Preço/ton',
              'Valor a Pagar',
              'Status',
              'Pagamento',
              'Lote Estoque',
            ]}
            data={filteredTickets.map((t) => [
              t.ticket_number,
              t.date_time,
              t.expand?.producer_id?.name || 'N/D',
              t.vehicle_plate || '',
              t.gross_weight_kg,
              t.tare_weight_kg,
              t.net_weight_kg,
              t.quality_grade || '',
              t.price_per_ton,
              t.final_payable_amount,
              t.status,
              t.payment_status || 'pendente',
              t.stock_lot_number || '',
            ])}
          />
        </div>
      </div>

      {/* KPIS NO TOPO */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-2 border-[#005B2E]/20 bg-emerald-50/40">
          <CardContent className="p-3">
            <span className="text-[11px] font-bold text-emerald-800">Total Recebido (Safra)</span>
            <span className="text-2xl font-black text-[#005B2E] block mt-1">
              {kpis.totalTons.toFixed(1)} t
            </span>
            <span className="text-[10px] text-muted-foreground">
              {tickets.length} tickets emitidos
            </span>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200 bg-blue-50/40">
          <CardContent className="p-3">
            <span className="text-[11px] font-bold text-blue-800">Valor aos Produtores</span>
            <span className="text-2xl font-black text-blue-700 block mt-1">
              R$ {kpis.totalPayable.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {kpis.titulosGerados} títulos gerados
            </span>
          </CardContent>
        </Card>

        <Card className="border-2 border-amber-200 bg-amber-50/40">
          <CardContent className="p-3">
            <span className="text-[11px] font-bold text-amber-800">Fruta Grade A (Premium)</span>
            <span className="text-2xl font-black text-amber-700 block mt-1">
              {tickets.length > 0 ? Math.round((kpis.gradeACount / tickets.length) * 100) : 0}%
            </span>
            <span className="text-[10px] text-muted-foreground">
              {kpis.gradeACount} de {tickets.length} cargas
            </span>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200 bg-purple-50/40">
          <CardContent className="p-3">
            <span className="text-[11px] font-bold text-purple-800">Produtores Ativos</span>
            <span className="text-2xl font-black text-purple-700 block mt-1">
              {producers.length}
            </span>
            <span className="text-[10px] text-muted-foreground">Cadastros agrícolas</span>
          </CardContent>
        </Card>
      </div>

      {/* FILTROS E BUSCA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-muted/30 p-2.5 rounded-xl border">
        <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por ticket, produtor ou placa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 text-xs bg-background max-w-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Label className="text-xs text-muted-foreground whitespace-nowrap">Status:</Label>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="h-8 text-xs w-[150px] bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Status</SelectItem>
              <SelectItem value="em_pesagem">Em Pesagem</SelectItem>
              <SelectItem value="classificado">Classificado</SelectItem>
              <SelectItem value="fechado">Fechado</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* TABELA DE TICKETS */}
      <Card className="border shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-xs font-bold">Ticket</TableHead>
                <TableHead className="text-xs font-bold">Produtor / Propriedade</TableHead>
                <TableHead className="text-xs font-bold">Variedade</TableHead>
                <TableHead className="text-xs font-bold text-right">Peso Bruto</TableHead>
                <TableHead className="text-xs font-bold text-right">Tara</TableHead>
                <TableHead className="text-xs font-bold text-right">Peso Líquido</TableHead>
                <TableHead className="text-xs font-bold text-center">Grade</TableHead>
                <TableHead className="text-xs font-bold text-right">Preço/ton</TableHead>
                <TableHead className="text-xs font-bold text-right">A Pagar (Produtor)</TableHead>
                <TableHead className="text-xs font-bold text-center">Status</TableHead>
                <TableHead className="text-xs font-bold text-center">Ações Operacionais</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTickets.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={11}
                    className="text-center py-8 text-xs text-muted-foreground"
                  >
                    Nenhum ticket de pesagem encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTickets.map((t) => {
                  const prod = t.expand?.producer_id
                  return (
                    <TableRow key={t.id} className="hover:bg-muted/20">
                      <TableCell className="font-mono font-bold text-xs text-[#005B2E]">
                        {t.ticket_number}
                        <div className="text-[10px] text-muted-foreground font-normal">
                          {new Date(t.date_time).toLocaleDateString('pt-BR')}{' '}
                          {new Date(t.date_time).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </TableCell>

                      <TableCell className="text-xs">
                        <strong className="block text-foreground">
                          {prod?.name || 'Produtor não identificado'}
                        </strong>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Building2 className="w-3 h-3" /> {prod?.property_name || 'Propriedade'} |
                          Placa: {t.vehicle_plate || 'S/N'}
                        </span>
                      </TableCell>

                      <TableCell className="text-xs">
                        <Badge variant="outline" className="text-[11px] font-semibold">
                          {t.variety || 'Azeitona'}
                        </Badge>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          Calibre: {t.caliber_size || 'N/D'}
                        </div>
                      </TableCell>

                      <TableCell className="text-xs text-right font-mono">
                        {t.gross_weight_kg.toLocaleString('pt-BR')} kg
                      </TableCell>
                      <TableCell className="text-xs text-right font-mono text-muted-foreground">
                        {t.tare_weight_kg.toLocaleString('pt-BR')} kg
                      </TableCell>
                      <TableCell className="text-xs text-right font-mono font-bold text-emerald-800">
                        {t.net_weight_kg.toLocaleString('pt-BR')} kg
                      </TableCell>

                      <TableCell className="text-center">
                        <Badge
                          className={`text-xs font-bold ${
                            t.quality_grade === 'A'
                              ? 'bg-emerald-600 text-white'
                              : t.quality_grade === 'B'
                                ? 'bg-blue-600 text-white'
                                : t.quality_grade === 'C'
                                  ? 'bg-amber-600 text-white'
                                  : 'bg-rose-600 text-white'
                          }`}
                        >
                          Grade {t.quality_grade}
                        </Badge>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          Def: {t.defect_percentage}% | Imp: {t.dirt_impurity_percentage}%
                        </div>
                      </TableCell>

                      <TableCell className="text-xs text-right font-mono">
                        R$ {t.price_per_ton.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>

                      <TableCell className="text-xs text-right font-mono font-bold text-[#005B2E]">
                        R${' '}
                        {t.final_payable_amount.toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                        })}
                        <div className="text-[10px] text-muted-foreground font-normal">
                          {t.payment_status === 'titulo_gerado' ? (
                            <span className="text-blue-600 font-semibold flex items-center justify-end gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Título Gerado
                            </span>
                          ) : t.payment_status === 'pago' ? (
                            <span className="text-emerald-700 font-semibold">Pago</span>
                          ) : (
                            <span>Pendente</span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="text-center">
                        <Badge variant="outline" className="text-[11px] capitalize">
                          {t.status}
                        </Badge>
                        {t.stock_lot_number && (
                          <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                            Lote: {t.stock_lot_number}
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1 flex-wrap">
                          {t.status !== 'fechado' && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleCloseTicket(t)}
                              disabled={actionLoading === t.id}
                              className="h-7 text-[11px] bg-[#005B2E] hover:bg-[#01361D] text-white"
                            >
                              Fechar Ticket
                            </Button>
                          )}

                          {t.status === 'fechado' && !t.stock_lot_number && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleGenerateStock(t)}
                              disabled={actionLoading === t.id}
                              className="h-7 text-[11px] text-emerald-800 border-emerald-300 hover:bg-emerald-50"
                            >
                              <Package className="w-3 h-3 mr-1" />
                              Gerar Estoque MP
                            </Button>
                          )}

                          {t.status === 'fechado' && t.payment_status === 'pendente' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleGeneratePayment(t)}
                              disabled={actionLoading === t.id}
                              className="h-7 text-[11px] text-blue-700 border-blue-300 hover:bg-blue-50"
                            >
                              <DollarSign className="w-3 h-3 mr-1" />
                              Gerar Título (Pagar)
                            </Button>
                          )}

                          {t.status === 'fechado' &&
                            t.stock_lot_number &&
                            t.payment_status === 'titulo_gerado' && (
                              <Badge
                                variant="secondary"
                                className="text-[10px] bg-emerald-100 text-emerald-800"
                              >
                                Integrado 100%
                              </Badge>
                            )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* DIÁLOGO: NOVO TICKET DE PESAGEM E CLASSIFICAÇÃO */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-[#005B2E] flex items-center gap-2">
              <Scale className="w-5 h-5" /> Ticket de Pesagem & Classificação de Safra
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveTicket} className="space-y-4">
            {/* Bloco 1: Produtor e Veículo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-muted/30 rounded-xl border">
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs font-bold">Produtor / Propriedade Agrícola *</Label>
                <Select
                  value={formData.producer_id}
                  onValueChange={(val) => setFormData((p) => ({ ...p, producer_id: val }))}
                >
                  <SelectTrigger className="h-8 text-xs bg-background">
                    <SelectValue placeholder="Selecione o produtor..." />
                  </SelectTrigger>
                  <SelectContent>
                    {producers.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} — {p.property_name} ({p.cadpro_car || 'S/N'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Placa do Veículo / Bins</Label>
                <Input
                  className="h-8 text-xs bg-background"
                  value={formData.vehicle_plate}
                  onChange={(e) => setFormData((p) => ({ ...p, vehicle_plate: e.target.value }))}
                  placeholder="Ex: ABC-1D23"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Nome do Motorista / Transportador</Label>
                <Input
                  className="h-8 text-xs bg-background"
                  value={formData.driver_name}
                  onChange={(e) => setFormData((p) => ({ ...p, driver_name: e.target.value }))}
                  placeholder="Ex: João da Silva"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Variedade de Azeitona</Label>
                <Select
                  value={formData.variety}
                  onValueChange={(val) => setFormData((p) => ({ ...p, variety: val }))}
                >
                  <SelectTrigger className="h-8 text-xs bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Arbequina">Arbequina</SelectItem>
                    <SelectItem value="Picual">Picual</SelectItem>
                    <SelectItem value="Koroneiki">Koroneiki</SelectItem>
                    <SelectItem value="Gordal">Gordal Sevillana</SelectItem>
                    <SelectItem value="Manzanilla">Manzanilla</SelectItem>
                    <SelectItem value="Arauco">Arauco</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Matéria-Prima Vinculada (Estoque)</Label>
                <Select
                  value={formData.raw_material_product_id}
                  onValueChange={(val) =>
                    setFormData((p) => ({ ...p, raw_material_product_id: val }))
                  }
                >
                  <SelectTrigger className="h-8 text-xs bg-background">
                    <SelectValue placeholder="Selecione o produto de estoque..." />
                  </SelectTrigger>
                  <SelectContent>
                    {products.slice(0, 20).map((prod) => (
                      <SelectItem key={prod.id} value={prod.id}>
                        {prod.name} ({prod.code || prod.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Bloco 2: Pesagem (Bruto, Tara e Líquido Automático) */}
            <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-2">
              <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-[#005B2E]" /> Pesagem Oficial na Balança Rodoviária
              </span>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Peso Bruto (KG) *</Label>
                  <Input
                    type="number"
                    className="h-8 text-xs bg-background font-mono"
                    value={formData.gross_weight_kg || ''}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, gross_weight_kg: Number(e.target.value) }))
                    }
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Tara Veículo (KG) *</Label>
                  <Input
                    type="number"
                    className="h-8 text-xs bg-background font-mono"
                    value={formData.tare_weight_kg || ''}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, tare_weight_kg: Number(e.target.value) }))
                    }
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold text-emerald-900">Peso Líquido Apurado</Label>
                  <div className="h-8 px-3 rounded-md bg-white border border-emerald-300 flex items-center justify-end font-mono font-black text-sm text-[#005B2E]">
                    {netWeightKg.toLocaleString('pt-BR')} KG
                  </div>
                </div>
              </div>
            </div>

            {/* Bloco 3: Grade de Qualidade e Classificação */}
            <div className="p-3 bg-muted/40 rounded-xl border space-y-3">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" /> Classificação da Fruta por Grade de
                Qualidade
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Grade de Qualidade *</Label>
                  <Select
                    value={formData.quality_grade}
                    onValueChange={(val: any) => handleGradeChange(val)}
                  >
                    <SelectTrigger className="h-8 text-xs bg-background font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">Grade A (Premium)</SelectItem>
                      <SelectItem value="B">Grade B (Padrão)</SelectItem>
                      <SelectItem value="C">Grade C (Industrial)</SelectItem>
                      <SelectItem value="DESCARTE">Descarte (Sem Pagamento)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Calibre da Fruta</Label>
                  <Select
                    value={formData.caliber_size}
                    onValueChange={(val) => setFormData((p) => ({ ...p, caliber_size: val }))}
                  >
                    <SelectTrigger className="h-8 text-xs bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="140-180">140-180 (Extra Grande)</SelectItem>
                      <SelectItem value="180-200">180-200 (Grande)</SelectItem>
                      <SelectItem value="200-240">200-240 (Médio)</SelectItem>
                      <SelectItem value="240-280">240-280 (Pequeno)</SelectItem>
                      <SelectItem value="280+">280+ (Miúdo)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">% Defeitos (Mosca/Avaria)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    className="h-8 text-xs bg-background"
                    value={formData.defect_percentage}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, defect_percentage: Number(e.target.value) }))
                    }
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">% Impurezas / Folhas</Label>
                  <Input
                    type="number"
                    step="0.1"
                    className="h-8 text-xs bg-background"
                    value={formData.dirt_impurity_percentage}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        dirt_impurity_percentage: Number(e.target.value),
                      }))
                    }
                  />
                </div>
              </div>

              {/* Maturação */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                <div className="space-y-1">
                  <Label className="text-xs">Estágio de Maturação</Label>
                  <Select
                    value={formData.maturation_stage}
                    onValueChange={(val) => setFormData((p) => ({ ...p, maturation_stage: val }))}
                  >
                    <SelectTrigger className="h-8 text-xs bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Verde">Verde (Conservas firmes)</SelectItem>
                      <SelectItem value="Véraison">Véraison (Mudança de cor)</SelectItem>
                      <SelectItem value="Madura">Madura (Púrpura / Preta)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Índice de Maturação (0 a 7)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    className="h-8 text-xs bg-background"
                    value={formData.maturation_index}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, maturation_index: Number(e.target.value) }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* Bloco 4: Formação de Preço e Cálculo Automático do Pagamento */}
            <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200 space-y-2">
              <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-blue-700" /> Formação de Preço e Pagamento ao
                Produtor
              </span>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Preço por Tonelada (R$) *</Label>
                  <Input
                    type="number"
                    className="h-8 text-xs bg-background font-mono font-bold"
                    value={formData.price_per_ton || ''}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, price_per_ton: Number(e.target.value) }))
                    }
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Deduções / Impurezas (R$)</Label>
                  <Input
                    type="number"
                    className="h-8 text-xs bg-background font-mono"
                    value={formData.deductions_amount || ''}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, deductions_amount: Number(e.target.value) }))
                    }
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold text-blue-900">
                    Total a Pagar (Produtor)
                  </Label>
                  <div className="h-8 px-3 rounded-md bg-white border border-blue-300 flex items-center justify-end font-mono font-black text-sm text-blue-800">
                    R$ {calculatedPayment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-muted-foreground italic">
                Fórmula: (Peso Líquido ÷ 1.000) × Preço da Grade − Deduções. Alimenta o contas a
                pagar e a trilha imutável de custo.
              </p>
            </div>

            {/* Observações */}
            <div className="space-y-1">
              <Label className="text-xs">Observações da Carga</Label>
              <Textarea
                rows={2}
                className="text-xs bg-background"
                value={formData.notes}
                onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
              />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setModalOpen(false)}
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
                {submitting ? 'Salvando...' : 'Gravar Ticket de Safra'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
