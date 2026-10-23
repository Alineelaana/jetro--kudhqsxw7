import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Tag,
  Percent,
  Sparkles,
  Building2,
  ShieldCheck,
  Plus,
  Pencil,
  Trash2,
  CheckCircle,
  Clock,
  Layers,
} from 'lucide-react'
import { useBrand } from '@/hooks/use-brand'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import { JetroTable, type JetroColumnDef } from '@/components/jetro-table'
import { PricingTables } from '@/components/pricing/pricing-tables'
import { PromotionPanel } from '@/components/promotions/promotion-panel'

interface DiscountPolicy {
  id: string
  role: string
  canal: string
  desconto_maximo: number
  requer_aprovacao_acima_de: number
  status: 'Ativa' | 'Inativa'
  empresa_id?: string
}

export function ScreenTabelasPreco() {
  const { brand, empresasDisponiveis, empresaAtivaId } = useBrand()
  const { user } = useAuth()
  const [currentTab, setCurrentTab] = useState('tabelas')

  // Políticas de desconto
  const [policies, setPolicies] = useState<DiscountPolicy[]>([
    {
      id: '1',
      role: 'Vendedor / RCA',
      canal: 'Varejo / Farma',
      desconto_maximo: 5.0,
      requer_aprovacao_acima_de: 3.0,
      status: 'Ativa',
    },
    {
      id: '2',
      role: 'Supervisor Comercial',
      canal: 'Todos os Canais',
      desconto_maximo: 10.0,
      requer_aprovacao_acima_de: 7.0,
      status: 'Ativa',
    },
    {
      id: '3',
      role: 'Gerente Regional',
      canal: 'Atacado / Distribuição',
      desconto_maximo: 15.0,
      requer_aprovacao_acima_de: 12.0,
      status: 'Ativa',
    },
    {
      id: '4',
      role: 'Diretoria Comercial',
      canal: 'Institucional / Grandes Redes',
      desconto_maximo: 25.0,
      requer_aprovacao_acima_de: 20.0,
      status: 'Ativa',
    },
  ])

  const [policyDialogOpen, setPolicyDialogOpen] = useState(false)
  const [editingPolicy, setEditingPolicy] = useState<DiscountPolicy | null>(null)
  const [roleForm, setRoleForm] = useState('Vendedor / RCA')
  const [canalForm, setCanalForm] = useState('Varejo / Farma')
  const [descMaxForm, setDescMaxForm] = useState('5.0')
  const [reqAprovForm, setReqAprovForm] = useState('3.0')

  const empresaAtualNome =
    empresasDisponiveis?.find((e: any) => e.id === empresaAtivaId)?.nome_fantasia ||
    brand?.nomeExibicao ||
    'Todas as Empresas'

  const handleOpenNewPolicy = () => {
    setEditingPolicy(null)
    setRoleForm('Vendedor / RCA')
    setCanalForm('Varejo / Farma')
    setDescMaxForm('5.0')
    setReqAprovForm('3.0')
    setPolicyDialogOpen(true)
  }

  const handleEditPolicy = (p: DiscountPolicy) => {
    setEditingPolicy(p)
    setRoleForm(p.role)
    setCanalForm(p.canal)
    setDescMaxForm(String(p.desconto_maximo))
    setReqAprovForm(String(p.requer_aprovacao_acima_de))
    setPolicyDialogOpen(true)
  }

  const handleSavePolicy = () => {
    const dMax = parseFloat(descMaxForm) || 0
    const dAprov = parseFloat(reqAprovForm) || 0

    if (editingPolicy) {
      setPolicies((prev) =>
        prev.map((p) =>
          p.id === editingPolicy.id
            ? {
                ...p,
                role: roleForm,
                canal: canalForm,
                desconto_maximo: dMax,
                requer_aprovacao_acima_de: dAprov,
              }
            : p,
        ),
      )
      toast({ title: 'Política de desconto atualizada' })
    } else {
      const newP: DiscountPolicy = {
        id: String(Date.now()),
        role: roleForm,
        canal: canalForm,
        desconto_maximo: dMax,
        requer_aprovacao_acima_de: dAprov,
        status: 'Ativa',
      }
      setPolicies((prev) => [newP, ...prev])
      toast({ title: 'Nova política de desconto registrada' })
    }
    setPolicyDialogOpen(false)
  }

  const handleDeletePolicy = (id: string) => {
    setPolicies((prev) => prev.filter((p) => p.id !== id))
    toast({ title: 'Política removida' })
  }

  const policyColumns: JetroColumnDef<DiscountPolicy>[] = [
    {
      id: 'role',
      header: 'Perfil / Alçada',
      accessorKey: 'role',
      cell: ({ value }) => <span className="font-bold text-foreground">{String(value)}</span>,
    },
    {
      id: 'canal',
      header: 'Canal de Venda',
      accessorKey: 'canal',
      cell: ({ value }) => <span className="text-xs text-muted-foreground">{String(value)}</span>,
    },
    {
      id: 'desconto_maximo',
      header: 'Desconto Máx. Permitido',
      accessorKey: 'desconto_maximo',
      dataType: 'percent',
      align: 'right',
      cell: ({ value }) => (
        <span className="font-semibold text-emerald-700">{Number(value).toFixed(1)}%</span>
      ),
    },
    {
      id: 'requer_aprovacao_acima_de',
      header: 'Aprovação Acima de',
      accessorKey: 'requer_aprovacao_acima_de',
      dataType: 'percent',
      align: 'right',
      cell: ({ value }) => (
        <span className="font-medium text-amber-700">{Number(value).toFixed(1)}%</span>
      ),
    },
    {
      id: 'status',
      header: 'Situação',
      accessorKey: 'status',
      dataType: 'badge',
      cell: ({ value }) => (
        <Badge
          variant="outline"
          className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs"
        >
          {String(value)}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Ações',
      align: 'center',
      defaultWidth: 100,
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleEditPolicy(row)}
            className="h-7 w-7 p-0 text-[#005B2E]"
            title="Editar Política"
          >
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleDeletePolicy(row.id)}
            className="h-7 w-7 p-0 text-red-600 hover:bg-red-50"
            title="Excluir"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#005B2E] text-white shadow-sm">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                Tabelas de Preço e Descontos
              </h1>
              <Badge
                variant="outline"
                className="text-xs bg-[#005B2E]/10 text-[#005B2E] font-bold border-[#005B2E]/30"
              >
                Precificação & Alçadas Comerciais
              </Badge>
              {empresaAtivaId && (
                <Badge variant="secondary" className="text-xs flex items-center gap-1 font-medium">
                  <Building2 className="w-3 h-3 text-[#005B2E]" />
                  {empresaAtualNome}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Gestão integrada de tabelas de preço por empresa/filial com vigência, políticas de
              alçadas de desconto por perfil de operador e campanhas promocionais ativas.
            </p>
          </div>
        </div>
      </div>

      {/* ABAS */}
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
        <TabsList className="bg-muted/60 p-1 rounded-xl grid grid-cols-3 max-w-lg h-auto gap-1">
          <TabsTrigger value="tabelas" className="text-xs py-2 font-bold flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-[#005B2E]" />
            <span>Tabelas de Preço</span>
          </TabsTrigger>
          <TabsTrigger
            value="descontos"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Descontos e Políticas</span>
          </TabsTrigger>
          <TabsTrigger
            value="campanhas"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Campanhas de Preço</span>
          </TabsTrigger>
        </TabsList>

        {/* ABA 1: TABELAS DE PREÇO */}
        <TabsContent value="tabelas" className="space-y-4">
          <PricingTables />
        </TabsContent>

        {/* ABA 2: DESCONTOS E POLÍTICAS */}
        <TabsContent value="descontos" className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Alçadas de Desconto e Aprovação
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Limites de desconto autorizados para cada perfil de usuário. Descontos acima da
                    alçada exigem aprovação de superior imediato.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={handleOpenNewPolicy}
                  className="bg-[#005B2E] hover:bg-[#004724] text-white font-bold text-xs"
                >
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  Nova Política de Desconto
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-2">
                <div className="p-3 rounded-xl border bg-emerald-50/40">
                  <span className="text-xs text-emerald-800 block font-semibold">
                    Alçada RCA/Vendedor
                  </span>
                  <span className="text-xl font-black text-emerald-700 block mt-0.5">Até 5.0%</span>
                  <span className="text-[11px] text-muted-foreground">
                    Liberação automática em tela
                  </span>
                </div>
                <div className="p-3 rounded-xl border bg-amber-50/40">
                  <span className="text-xs text-amber-800 block font-semibold">
                    Alçada Supervisão
                  </span>
                  <span className="text-xl font-black text-amber-700 block mt-0.5">
                    5.1% a 10.0%
                  </span>
                  <span className="text-[11px] text-muted-foreground">Requer aprovação em 24h</span>
                </div>
                <div className="p-3 rounded-xl border bg-blue-50/40">
                  <span className="text-xs text-blue-800 block font-semibold">
                    Alçada Gerência/Diretoria
                  </span>
                  <span className="text-xl font-black text-blue-700 block mt-0.5">
                    Acima de 10.0%
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Exige parecer comercial formal
                  </span>
                </div>
              </div>

              <JetroTable<DiscountPolicy>
                data={policies}
                columns={policyColumns}
                pageSize={10}
                screenId="comercial-politicas-desconto"
                emptyMessage="Nenhuma política de desconto cadastrada."
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA 3: CAMPANHAS DE PREÇO */}
        <TabsContent value="campanhas" className="space-y-4">
          <PromotionPanel />
        </TabsContent>
      </Tabs>

      {/* MODAL NOVA / EDITAR POLÍTICA */}
      <Dialog open={policyDialogOpen} onOpenChange={setPolicyDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E]">
              {editingPolicy ? 'Editar' : 'Nova'} Política de Desconto
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label className="text-xs font-semibold">Perfil / Alçada</Label>
              <Input
                value={roleForm}
                onChange={(e) => setRoleForm(e.target.value)}
                placeholder="Ex: Vendedor Externo, RCA, Gerente..."
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Canal de Venda</Label>
              <Input
                value={canalForm}
                onChange={(e) => setCanalForm(e.target.value)}
                placeholder="Ex: Varejo, Farma, Atacado..."
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Desconto Máximo (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={descMaxForm}
                  onChange={(e) => setDescMaxForm(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Requer Aprovação Acima de (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={reqAprovForm}
                  onChange={(e) => setReqAprovForm(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPolicyDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSavePolicy}
              className="bg-[#005B2E] hover:bg-[#004724] text-white font-bold"
            >
              Salvar Política
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
