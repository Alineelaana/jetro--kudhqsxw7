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
  AlertOctagon,
  Plus,
  RefreshCw,
  Search,
  TrendingDown,
  DollarSign,
  PackageX,
  Factory,
  Trash2,
  AlertTriangle,
  Layers,
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { ExportActions } from '@/components/shared/export-actions'
import {
  getProductionLineLosses,
  createProductionLineLoss,
  deleteProductionLineLoss,
  type ProductionLineLoss,
} from '@/services/olive-industry-service'
import { getProductionOrders } from '@/services/production-orders'

export function ScreenPerdasLinha() {
  const [losses, setLosses] = useState<ProductionLineLoss[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterPhase, setFilterPhase] = useState('todas')
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form de perda
  const [formData, setFormData] = useState({
    production_order_id: '',
    phase_name: 'Descaroçamento',
    loss_type: 'refugo' as const,
    quantity: 120,
    unit: 'kg',
    reason: 'Frutos partidos no corte mecânico da máquina descaroçadora.',
    responsible_name: 'Operador Linha A',
    unit_cost_estimated: 8.5,
    destination: 'coproduto_oleo' as const,
    notes: 'Material destinado à extração secundária de óleo de oliva.',
  })

  const loadData = async () => {
    setLoading(true)
    try {
      const [lList, ordList] = await Promise.all([
        getProductionLineLosses(),
        getProductionOrders().catch(() => []),
      ])
      setLosses(lList)
      setOrders(ordList)
    } catch {
      toast({ title: 'Erro ao carregar perdas na linha', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpenNew = () => {
    setFormData({
      production_order_id: orders[0]?.id || '',
      phase_name: 'Descaroçamento',
      loss_type: 'refugo',
      quantity: 120,
      unit: 'kg',
      reason: 'Frutos partidos no corte mecânico da máquina descaroçadora.',
      responsible_name: 'Operador Linha A',
      unit_cost_estimated: 8.5,
      destination: 'coproduto_oleo',
      notes: 'Material destinado à extração secundária de óleo de oliva.',
    })
    setModalOpen(true)
  }

  const handleSaveLoss = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.production_order_id) {
      toast({ title: 'Selecione a ordem de produção', variant: 'destructive' })
      return
    }
    const qty = Number(formData.quantity) || 0
    const unitCost = Number(formData.unit_cost_estimated) || 0
    const totalCost = qty * unitCost

    setSubmitting(true)
    try {
      await createProductionLineLoss({
        production_order_id: formData.production_order_id,
        phase_name: formData.phase_name,
        loss_type: formData.loss_type,
        quantity: qty,
        unit: formData.unit,
        reason: formData.reason,
        responsible_name: formData.responsible_name,
        unit_cost_estimated: unitCost,
        total_cost_impact: totalCost,
        loss_date: new Date().toISOString(),
        destination: formData.destination,
        notes: formData.notes,
      })

      toast({
        title: 'Perda registrada na linha!',
        description: `${qty} ${formData.unit} registrado com impacto de R$ ${totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} na OP.`,
      })
      setModalOpen(false)
      loadData()
    } catch (err: any) {
      toast({ title: 'Erro ao registrar perda', description: err?.message, variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteLoss = async (id: string) => {
    if (!confirm('Deseja realmente excluir este registro de perda?')) return
    const ok = await deleteProductionLineLoss(id)
    if (ok) {
      toast({ title: 'Registro de perda removido' })
      loadData()
    } else {
      toast({ title: 'Erro ao excluir perda', variant: 'destructive' })
    }
  }

  // Filtragem
  const filteredLosses = useMemo(() => {
    return losses.filter((l) => {
      const matchSearch =
        (l.expand?.production_order_id?.order_number || '')
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        l.reason.toLowerCase().includes(search.toLowerCase()) ||
        l.responsible_name.toLowerCase().includes(search.toLowerCase())
      const matchPhase = filterPhase === 'todas' || l.phase_name === filterPhase
      return matchSearch && matchPhase
    })
  }, [losses, search, filterPhase])

  // KPIs
  const stats = useMemo(() => {
    const totalKg = losses
      .filter((l) => l.unit.toLowerCase() === 'kg')
      .reduce((acc, l) => acc + (l.quantity || 0), 0)
    const totalCost = losses.reduce((acc, l) => acc + (l.total_cost_impact || 0), 0)
    const descarteCount = losses.filter((l) => l.loss_type === 'descarte').length
    const refugoCount = losses.filter((l) => l.loss_type === 'refugo').length
    return { totalKg, totalCost, descarteCount, refugoCount }
  }, [losses])

  return (
    <div className="space-y-4">
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-700 text-white shadow-sm">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                Controle de Perdas na Linha
              </h1>
              <Badge
                variant="outline"
                className="text-xs bg-rose-50 text-rose-700 font-bold border-rose-200"
              >
                Refugo, Descarte & Custo Efetivo
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Apontamento discriminado por OP e fase fabril (descaroçamento, envase, salmoura) com
              apropriação no custo da ordem.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            onClick={handleOpenNew}
            className="bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Registrar Perda / Refugo
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
            title="Perdas na Linha"
            subtitle="Apontamentos de refugos, descartes e impacto no custo da OP"
            filenamePrefix="perdas_linha_huram"
            headers={[
              'OP',
              'Fase',
              'Tipo de Perda',
              'Quantidade',
              'Unidade',
              'Impacto no Custo (R$)',
              'Motivo',
              'Responsável',
              'Destinação',
              'Data',
            ]}
            data={filteredLosses.map((l) => [
              l.expand?.production_order_id?.order_number || 'N/D',
              l.phase_name,
              l.loss_type,
              l.quantity,
              l.unit,
              l.total_cost_impact || 0,
              l.reason,
              l.responsible_name,
              l.destination || 'N/D',
              l.loss_date,
            ])}
          />
        </div>
      </div>

      {/* KPIS DE PERDAS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-2 border-rose-200 bg-rose-50/40">
          <CardContent className="p-3">
            <span className="text-[11px] font-bold text-rose-900">Perda Acumulada em Massa</span>
            <span className="text-2xl font-black text-rose-700 block mt-1">
              {stats.totalKg.toLocaleString('pt-BR')} kg
            </span>
            <span className="text-[10px] text-muted-foreground">
              Matéria-prima perdida na linha
            </span>
          </CardContent>
        </Card>

        <Card className="border-2 border-amber-200 bg-amber-50/40">
          <CardContent className="p-3">
            <span className="text-[11px] font-bold text-amber-900">Impacto Financeiro (Custo)</span>
            <span className="text-2xl font-black text-amber-700 block mt-1">
              R$ {stats.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-muted-foreground">Abate do rendimento das OPs</span>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200 bg-purple-50/40">
          <CardContent className="p-3">
            <span className="text-[11px] font-bold text-purple-900">Refugo de Processo</span>
            <span className="text-2xl font-black text-purple-700 block mt-1">
              {stats.refugoCount}
            </span>
            <span className="text-[10px] text-muted-foreground">Possível coproduto / óleo</span>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200 bg-blue-50/40">
          <CardContent className="p-3">
            <span className="text-[11px] font-bold text-blue-900">Descartes Sanitários</span>
            <span className="text-2xl font-black text-blue-700 block mt-1">
              {stats.descarteCount}
            </span>
            <span className="text-[10px] text-muted-foreground">Sem reaproveitamento</span>
          </CardContent>
        </Card>
      </div>

      {/* FILTROS E BUSCA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-muted/30 p-2.5 rounded-xl border">
        <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por OP, motivo ou responsável..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 text-xs bg-background max-w-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Label className="text-xs text-muted-foreground whitespace-nowrap">Fase Fabril:</Label>
          <Select value={filterPhase} onValueChange={setFilterPhase}>
            <SelectTrigger className="h-8 text-xs w-[170px] bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as Fases</SelectItem>
              <SelectItem value="Descaroçamento">Descaroçamento</SelectItem>
              <SelectItem value="Fatiamento">Fatiamento</SelectItem>
              <SelectItem value="Envase">Envase</SelectItem>
              <SelectItem value="Salmoura de Cobertura">Salmoura de Cobertura</SelectItem>
              <SelectItem value="Pasteurização">Pasteurização</SelectItem>
              <SelectItem value="Rotulagem">Rotulagem</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* TABELA DE PERDAS */}
      <Card className="border shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-xs font-bold">Data/Hora</TableHead>
                <TableHead className="text-xs font-bold">Ordem de Produção</TableHead>
                <TableHead className="text-xs font-bold">Fase Fabril</TableHead>
                <TableHead className="text-xs font-bold text-center">Tipo de Perda</TableHead>
                <TableHead className="text-xs font-bold text-right">Qtd. Perdida</TableHead>
                <TableHead className="text-xs font-bold text-right">Custo Unitário</TableHead>
                <TableHead className="text-xs font-bold text-right">Impacto no Custo</TableHead>
                <TableHead className="text-xs font-bold">Motivo & Destinação</TableHead>
                <TableHead className="text-xs font-bold">Responsável</TableHead>
                <TableHead className="text-xs font-bold text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLosses.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="text-center py-8 text-xs text-muted-foreground"
                  >
                    Nenhum registro de perda na linha encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filteredLosses.map((loss) => (
                  <TableRow key={loss.id} className="hover:bg-muted/20">
                    <TableCell className="font-mono text-xs">
                      {new Date(loss.loss_date).toLocaleDateString('pt-BR')}{' '}
                      {new Date(loss.loss_date).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </TableCell>

                    <TableCell className="text-xs">
                      <span className="font-mono font-bold text-[#005B2E] block">
                        #{loss.expand?.production_order_id?.order_number || 'OP'}
                      </span>
                    </TableCell>

                    <TableCell className="text-xs font-semibold text-foreground">
                      {loss.phase_name}
                    </TableCell>

                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className={`text-[11px] capitalize font-bold ${
                          loss.loss_type === 'descarte'
                            ? 'border-rose-300 text-rose-700 bg-rose-50'
                            : loss.loss_type === 'refugo'
                              ? 'border-amber-300 text-amber-700 bg-amber-50'
                              : 'border-blue-300 text-blue-700 bg-blue-50'
                        }`}
                      >
                        {loss.loss_type.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-xs text-right font-mono font-bold text-rose-700">
                      {loss.quantity.toLocaleString('pt-BR')} {loss.unit}
                    </TableCell>

                    <TableCell className="text-xs text-right font-mono text-muted-foreground">
                      R$ {(loss.unit_cost_estimated || 0).toFixed(2)}
                    </TableCell>

                    <TableCell className="text-xs text-right font-mono font-black text-rose-800">
                      R${' '}
                      {(loss.total_cost_impact || 0).toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>

                    <TableCell className="text-xs max-w-xs">
                      <div className="font-medium text-foreground">{loss.reason}</div>
                      <div className="text-[10px] text-muted-foreground capitalize">
                        Destino: {loss.destination ? loss.destination.replace(/_/g, ' ') : 'N/D'}
                      </div>
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground">
                      {loss.responsible_name}
                    </TableCell>

                    <TableCell className="text-center">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteLoss(loss.id)}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* DIÁLOGO: REGISTRAR PERDA / REFUGO */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-rose-800 flex items-center gap-2">
              <AlertOctagon className="w-5 h-5" /> Apontamento de Perda / Refugo na Linha
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveLoss} className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs font-bold">Ordem de Produção (Impactada) *</Label>
              <Select
                value={formData.production_order_id}
                onValueChange={(val) => setFormData((p) => ({ ...p, production_order_id: val }))}
              >
                <SelectTrigger className="h-8 text-xs bg-background">
                  <SelectValue placeholder="Selecione a OP..." />
                </SelectTrigger>
                <SelectContent>
                  {orders.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      OP #{o.order_number} ({o.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold">Fase Fabril *</Label>
                <Select
                  value={formData.phase_name}
                  onValueChange={(val) => setFormData((p) => ({ ...p, phase_name: val }))}
                >
                  <SelectTrigger className="h-8 text-xs bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Descaroçamento">Descaroçamento</SelectItem>
                    <SelectItem value="Fatiamento">Fatiamento</SelectItem>
                    <SelectItem value="Envase">Envase</SelectItem>
                    <SelectItem value="Salmoura de Cobertura">Salmoura de Cobertura</SelectItem>
                    <SelectItem value="Pasteurização">Pasteurização</SelectItem>
                    <SelectItem value="Rotulagem">Rotulagem</SelectItem>
                    <SelectItem value="Paletização">Paletização</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold">Tipo de Perda *</Label>
                <Select
                  value={formData.loss_type}
                  onValueChange={(val: any) => setFormData((p) => ({ ...p, loss_type: val }))}
                >
                  <SelectTrigger className="h-8 text-xs bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="refugo">Refugo (Retrabalhável)</SelectItem>
                    <SelectItem value="descarte">Descarte Sanitário</SelectItem>
                    <SelectItem value="fora_de_padrao">Fora de Padrão</SelectItem>
                    <SelectItem value="avaria_embalagem">Avaria de Embalagem</SelectItem>
                    <SelectItem value="vazamento_salmoura">Vazamento Salmoura</SelectItem>
                    <SelectItem value="polpa_machucada">Polpa Machucada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Quantidade *</Label>
                <Input
                  type="number"
                  step="0.1"
                  className="h-8 text-xs font-mono"
                  value={formData.quantity}
                  onChange={(e) => setFormData((p) => ({ ...p, quantity: Number(e.target.value) }))}
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Unidade</Label>
                <Select
                  value={formData.unit}
                  onValueChange={(val) => setFormData((p) => ({ ...p, unit: val }))}
                >
                  <SelectTrigger className="h-8 text-xs bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="un">un (vidros/sachês)</SelectItem>
                    <SelectItem value="litros">litros</SelectItem>
                    <SelectItem value="caixas">caixas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Custo Unit. (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  className="h-8 text-xs font-mono"
                  value={formData.unit_cost_estimated}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, unit_cost_estimated: Number(e.target.value) }))
                  }
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Motivo da Perda *</Label>
              <Input
                className="h-8 text-xs"
                value={formData.reason}
                onChange={(e) => setFormData((p) => ({ ...p, reason: e.target.value }))}
                placeholder="Ex: Frutos esmagados por trava mecânica."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Destinação</Label>
                <Select
                  value={formData.destination}
                  onValueChange={(val: any) => setFormData((p) => ({ ...p, destination: val }))}
                >
                  <SelectTrigger className="h-8 text-xs bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="coproduto_oleo">Coproduto (Óleo)</SelectItem>
                    <SelectItem value="compostagem">Compostagem Agrícola</SelectItem>
                    <SelectItem value="descarte_sanitario">Descarte Sanitário</SelectItem>
                    <SelectItem value="retrabalho">Retrabalho</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Responsável</Label>
                <Input
                  className="h-8 text-xs"
                  value={formData.responsible_name}
                  onChange={(e) => setFormData((p) => ({ ...p, responsible_name: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Observações Adicionais</Label>
              <Textarea
                rows={2}
                className="text-xs"
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
                className="bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold"
              >
                {submitting ? 'Salvando...' : 'Gravar Perda na OP'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
