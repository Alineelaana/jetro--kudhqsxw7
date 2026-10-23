import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Truck,
  User,
  Wrench,
  Search,
  Plus,
  RefreshCw,
  Building2,
  Calendar,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react'
import { useBrand } from '@/hooks/use-brand'
import { LogisticsVehicles } from '@/components/logistics/logistics-vehicles'
import { LogisticsDrivers } from '@/components/logistics/logistics-drivers'
import { JetroTable } from '@/components/jetro-table'
import type { JetroColumnDef } from '@/components/jetro-table/types'
import { getVehicles, getDrivers } from '@/services/logistics'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ManutencaoFrota {
  id: string
  veiculo_placa: string
  veiculo_modelo: string
  tipo: 'Preventiva' | 'Corretiva' | 'Revisão Periódica' | 'Pneus'
  data_programada: string
  status: 'Agendada' | 'Em Andamento' | 'Concluída' | 'Atrasada'
  oficina: string
  custo_estimado: number
  responsavel: string
  observacoes?: string
}

const MOCK_MANUTENCOES: ManutencaoFrota[] = [
  {
    id: 'MAN-001',
    veiculo_placa: 'BRA2E19',
    veiculo_modelo: 'Volvo FH 540',
    tipo: 'Preventiva',
    data_programada: new Date().toISOString().split('T')[0],
    status: 'Em Andamento',
    oficina: 'Oficina Central Huram',
    custo_estimado: 1850.0,
    responsavel: 'Carlos Mecânica',
    observacoes: 'Troca de óleo, filtros de ar e verificação de lonas',
  },
  {
    id: 'MAN-002',
    veiculo_placa: 'MER3A45',
    veiculo_modelo: 'Mercedes-Benz Actros',
    tipo: 'Pneus',
    data_programada: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    status: 'Agendada',
    oficina: 'Rodas & Cia',
    custo_estimado: 4200.0,
    responsavel: 'Gerência de Frotas',
    observacoes: 'Alinhamento, balanceamento e rodízio de pneus',
  },
  {
    id: 'MAN-003',
    veiculo_placa: 'SCN9B88',
    veiculo_modelo: 'Scania R450',
    tipo: 'Revisão Periódica',
    data_programada: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0],
    status: 'Concluída',
    oficina: 'Concessionária Autorizada',
    custo_estimado: 3100.0,
    responsavel: 'Marcos Frota',
    observacoes: 'Revisão de 50.000 km concluída com garantia',
  },
]

export function ScreenTransporteFrota() {
  const { brand, empresasDisponiveis, empresaAtivaId } = useBrand()
  const [currentTab, setCurrentTab] = useState('veiculos')
  const [manutencoes, setManutencoes] = useState<ManutencaoFrota[]>(MOCK_MANUTENCOES)
  const [openManutencaoDialog, setOpenManutencaoDialog] = useState(false)
  const [newManutencao, setNewManutencao] = useState<Partial<ManutencaoFrota>>({
    tipo: 'Preventiva',
    status: 'Agendada',
    data_programada: new Date().toISOString().split('T')[0],
  })

  const [vehiclesSummary, setVehiclesSummary] = useState({
    total: 0,
    disponiveis: 0,
    emRota: 0,
    manutencao: 0,
  })
  const [driversSummary, setDriversSummary] = useState({ total: 0, disponiveis: 0, emRota: 0 })

  const empresaAtualNome = useMemo(() => {
    const emp = empresasDisponiveis?.find((e: any) => e.id === empresaAtivaId)
    return (
      emp?.nome_fantasia ||
      emp?.razao_social ||
      brand?.nomeExibicao ||
      brand?.empresaNome ||
      'Todas as Empresas'
    )
  }, [empresasDisponiveis, empresaAtivaId, brand])

  const loadSummaries = async () => {
    try {
      const [veics, drivs] = await Promise.all([
        getVehicles().catch(() => []),
        getDrivers().catch(() => []),
      ])
      const vArr = veics as any[]
      const dArr = drivs as any[]
      setVehiclesSummary({
        total: vArr.length,
        disponiveis: vArr.filter((v) => v.situacao === 'Disponível').length,
        emRota: vArr.filter((v) => v.situacao === 'Em Rota').length,
        manutencao: vArr.filter((v) => v.situacao === 'Em Manutenção' || v.situacao === 'Oficina')
          .length,
      })
      setDriversSummary({
        total: dArr.length,
        disponiveis: dArr.filter((d) => d.situacao === 'Disponível').length,
        emRota: dArr.filter((d) => d.situacao === 'Em Rota').length,
      })
    } catch {
      // safe
    }
  }

  useEffect(() => {
    loadSummaries()
  }, [empresaAtivaId])

  useRealtime('logistics_vehicles', () => loadSummaries())
  useRealtime('logistics_drivers', () => loadSummaries())

  const manutencaoColumns: JetroColumnDef<ManutencaoFrota>[] = [
    {
      id: 'id',
      header: 'Código OS',
      accessorKey: 'id',
      cell: ({ row }) => (
        <span className="font-mono font-bold text-xs text-[#005B2E]">{row.id}</span>
      ),
    },
    {
      id: 'veiculo_placa',
      header: 'Placa',
      accessorKey: 'veiculo_placa',
      cell: ({ row }) => <span className="font-bold text-foreground">{row.veiculo_placa}</span>,
    },
    {
      id: 'veiculo_modelo',
      header: 'Modelo',
      accessorKey: 'veiculo_modelo',
    },
    {
      id: 'tipo',
      header: 'Tipo Manutenção',
      accessorKey: 'tipo',
      cell: ({ row }) => (
        <Badge variant="outline" className="text-xs font-semibold">
          {row.tipo}
        </Badge>
      ),
    },
    {
      id: 'data_programada',
      header: 'Data Programada',
      accessorKey: 'data_programada',
      cell: ({ row }) =>
        row.data_programada ? new Date(row.data_programada).toLocaleDateString('pt-BR') : '—',
    },
    {
      id: 'oficina',
      header: 'Oficina / Local',
      accessorKey: 'oficina',
    },
    {
      id: 'custo_estimado',
      header: 'Custo Estimado',
      accessorKey: 'custo_estimado',
      cell: ({ row }) =>
        row.custo_estimado
          ? row.custo_estimado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
          : 'R$ 0,00',
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => {
        const colors: Record<string, string> = {
          Agendada: 'bg-blue-100 text-blue-700',
          'Em Andamento': 'bg-amber-100 text-amber-700',
          Concluída: 'bg-emerald-100 text-emerald-700',
          Atrasada: 'bg-red-100 text-red-700',
        }
        return (
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded ${colors[row.status] || 'bg-muted'}`}
          >
            {row.status}
          </span>
        )
      },
    },
  ]

  const handleCreateManutencao = () => {
    if (!newManutencao.veiculo_placa) {
      toast({ title: 'Informe a placa do veículo', variant: 'destructive' })
      return
    }
    const created: ManutencaoFrota = {
      id: `MAN-${Date.now().toString(36).toUpperCase().slice(-5)}`,
      veiculo_placa: newManutencao.veiculo_placa.toUpperCase(),
      veiculo_modelo: newManutencao.veiculo_modelo || 'Caminhão Pesado',
      tipo: (newManutencao.tipo as any) || 'Preventiva',
      data_programada: newManutencao.data_programada || new Date().toISOString().split('T')[0],
      status: (newManutencao.status as any) || 'Agendada',
      oficina: newManutencao.oficina || 'Oficina Credenciada',
      custo_estimado: Number(newManutencao.custo_estimado) || 0,
      responsavel: newManutencao.responsavel || 'Gestor de Frota',
      observacoes: newManutencao.observacoes || '',
    }
    setManutencoes([created, ...manutencoes])
    setOpenManutencaoDialog(false)
    toast({ title: 'Ordem de manutenção agendada com sucesso' })
  }

  return (
    <div className="space-y-4">
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#005B2E] text-white shadow-sm">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                Transporte e Frota
              </h1>
              <Badge
                variant="outline"
                className="text-xs bg-[#005B2E]/10 text-[#005B2E] font-bold border-[#005B2E]/30"
              >
                Gestão de Ativos & Equipe Operacional
              </Badge>
              {empresaAtivaId && (
                <Badge variant="secondary" className="text-xs flex items-center gap-1 font-medium">
                  <Building2 className="w-3 h-3 text-[#005B2E]" />
                  {empresaAtualNome}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Cadastro e controle de veículos próprios e terceirizados, habilitação de motoristas e
              plano preventivo/corretivo de manutenção de frota.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={loadSummaries}
            className="text-xs focus-visible:ring-[#005B2E]"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* CARDS DE RESUMO */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-2 border-[#005B2E]/20 p-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-100 text-[#005B2E]">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xl font-black text-foreground">{vehiclesSummary.total}</p>
              <p className="text-xs text-muted-foreground">
                Veículos na Frota ({vehiclesSummary.disponiveis} disp.)
              </p>
            </div>
          </div>
        </Card>
        <Card className="border-2 border-[#005B2E]/20 p-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
              <User className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xl font-black text-foreground">{driversSummary.total}</p>
              <p className="text-xs text-muted-foreground">
                Motoristas Cadastrados ({driversSummary.emRota} em rota)
              </p>
            </div>
          </div>
        </Card>
        <Card className="border-2 border-[#005B2E]/20 p-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xl font-black text-foreground">
                {manutencoes.filter((m) => m.status === 'Em Andamento').length}
              </p>
              <p className="text-xs text-muted-foreground">Em Manutenção Ativa</p>
            </div>
          </div>
        </Card>
        <Card className="border-2 border-[#005B2E]/20 p-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-purple-100 text-purple-700">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xl font-black text-foreground">
                {manutencoes.filter((m) => m.status === 'Agendada').length}
              </p>
              <p className="text-xs text-muted-foreground">Revisões Preventivas Agendadas</p>
            </div>
          </div>
        </Card>
      </div>

      {/* ABAS: VEÍCULOS, MOTORISTAS, MANUTENÇÃO */}
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
        <TabsList className="bg-muted/60 p-1 rounded-xl grid grid-cols-3 h-auto gap-1">
          <TabsTrigger
            value="veiculos"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <Truck className="w-3.5 h-3.5 text-[#005B2E]" />
            <span>Veículos e Implementos</span>
          </TabsTrigger>
          <TabsTrigger
            value="motoristas"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <User className="w-3.5 h-3.5 text-blue-600" />
            <span>Motoristas e Condutores</span>
          </TabsTrigger>
          <TabsTrigger
            value="manutencao"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <Wrench className="w-3.5 h-3.5 text-amber-600" />
            <span>Manutenção de Frota</span>
          </TabsTrigger>
        </TabsList>

        {/* ABA 1: VEÍCULOS */}
        <TabsContent value="veiculos" className="space-y-4">
          <LogisticsVehicles />
        </TabsContent>

        {/* ABA 2: MOTORISTAS */}
        <TabsContent value="motoristas" className="space-y-4">
          <LogisticsDrivers />
        </TabsContent>

        {/* ABA 3: MANUTENÇÃO DE FROTA */}
        <TabsContent value="manutencao" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Plano de Manutenção Preventiva e Corretiva
              </h3>
              <p className="text-xs text-muted-foreground">
                Acompanhamento de ordens de serviço mecânicas, borracharia, revisões e
                licenciamentos.
              </p>
            </div>
            <Button
              onClick={() => setOpenManutencaoDialog(true)}
              className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold text-xs"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Nova Ordem de Manutenção
            </Button>
          </div>

          <JetroTable
            data={manutencoes}
            columns={manutencaoColumns}
            screenId="logistica.transporte-frota.manutencao"
            exportTitle="Plano de Manutenção de Frota — HURAM ERP"
            exportFilename="manutencoes-frota"
            showToolbar={true}
          />
        </TabsContent>
      </Tabs>

      {/* DIÁLOGO NOVA MANUTENÇÃO */}
      <Dialog open={openManutencaoDialog} onOpenChange={setOpenManutencaoDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E]">Nova Ordem de Manutenção de Frota</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Placa do Veículo *</Label>
              <Input
                placeholder="Ex: ABC1D23"
                value={newManutencao.veiculo_placa || ''}
                onChange={(e) =>
                  setNewManutencao({ ...newManutencao, veiculo_placa: e.target.value })
                }
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Modelo</Label>
              <Input
                placeholder="Ex: Volvo FH 540"
                value={newManutencao.veiculo_modelo || ''}
                onChange={(e) =>
                  setNewManutencao({ ...newManutencao, veiculo_modelo: e.target.value })
                }
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Tipo de Intervenção</Label>
              <Select
                value={newManutencao.tipo}
                onValueChange={(v) => setNewManutencao({ ...newManutencao, tipo: v as any })}
              >
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Preventiva">Preventiva</SelectItem>
                  <SelectItem value="Corretiva">Corretiva</SelectItem>
                  <SelectItem value="Revisão Periódica">Revisão Periódica</SelectItem>
                  <SelectItem value="Pneus">Pneus / Borracharia</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Data Programada</Label>
              <Input
                type="date"
                value={newManutencao.data_programada || ''}
                onChange={(e) =>
                  setNewManutencao({ ...newManutencao, data_programada: e.target.value })
                }
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Oficina Prestadora</Label>
              <Input
                placeholder="Nome da oficina"
                value={newManutencao.oficina || ''}
                onChange={(e) => setNewManutencao({ ...newManutencao, oficina: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Custo Estimado (R$)</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={newManutencao.custo_estimado || ''}
                onChange={(e) =>
                  setNewManutencao({
                    ...newManutencao,
                    custo_estimado: parseFloat(e.target.value) || 0,
                  })
                }
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="col-span-2 space-y-1">
              <Label className="text-xs font-semibold">Observações / Peças Solicitadas</Label>
              <Input
                placeholder="Descrição dos serviços"
                value={newManutencao.observacoes || ''}
                onChange={(e) =>
                  setNewManutencao({ ...newManutencao, observacoes: e.target.value })
                }
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenManutencaoDialog(false)}
              className="text-xs"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateManutencao}
              className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold text-xs"
            >
              Salvar Ordem
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
