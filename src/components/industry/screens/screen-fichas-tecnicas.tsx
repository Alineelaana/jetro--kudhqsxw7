import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  FileCode2,
  BookOpen,
  Layers,
  GitBranch,
  Route,
  DollarSign,
  Plus,
  Loader2,
  RefreshCw,
  Search,
  Check,
  X,
  ChevronRight,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react'
import {
  getIndustrialItems,
  getBomVersions,
  getBomComponents,
  getProductionRoutes,
  getRouteOperations,
  createBomVersion,
  createBomComponent,
} from '@/services/industry'
import { getBomExplosion, approveBomRevision, getEngineeringChanges } from '@/services/engineering'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/hooks/use-toast'
import { JetroTable } from '@/components/jetro-table'
import { ExportActions } from '@/components/shared/export-actions'
import { Link } from 'react-router-dom'

const REV_STATUS_COLORS: Record<string, string> = {
  rascunho: 'bg-gray-100 text-gray-700',
  em_aprovacao: 'bg-amber-100 text-amber-800',
  aprovada: 'bg-emerald-100 text-emerald-800',
  rejeitada: 'bg-rose-100 text-rose-800',
  obsoleta: 'bg-slate-100 text-slate-600',
}

export function ScreenFichasTecnicas() {
  const { user } = useAuth()
  const [currentTab, setCurrentTab] = useState('fichas')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Dados principais
  const [items, setItems] = useState<any[]>([])
  const [boms, setBoms] = useState<any[]>([])
  const [routes, setRoutes] = useState<any[]>([])
  const [operations, setOperations] = useState<any[]>([])
  const [engChanges, setEngChanges] = useState<any[]>([])

  // Seleções ativas
  const [selectedItemId, setSelectedItemId] = useState<string>('')
  const [selectedBomId, setSelectedBomId] = useState<string>('')
  const [selectedBomComponents, setSelectedBomComponents] = useState<any[]>([])
  const [explosionResult, setExplosionResult] = useState<any>(null)
  const [exploding, setExploding] = useState(false)

  // Diálogos
  const [newBomDialogOpen, setNewBomDialogOpen] = useState(false)
  const [newCompDialogOpen, setNewCompDialogOpen] = useState(false)

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const [it, bv, rt, ec] = await Promise.all([
        getIndustrialItems(),
        getBomVersions(),
        getProductionRoutes(),
        getEngineeringChanges().catch(() => []),
      ])

      setItems(it as any[])
      setBoms(bv as any[])
      setRoutes(rt as any[])
      setEngChanges(ec as any[])

      if (!selectedItemId && it.length > 0) {
        setSelectedItemId((it[0] as any).id)
      }
      if (!selectedBomId && bv.length > 0) {
        setSelectedBomId((bv[0] as any).id)
      }
    } catch (err) {
      console.error(err)
      toast({ title: 'Erro ao carregar Fichas e BOM', variant: 'destructive' })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Carrega componentes da BOM selecionada
  const loadBomComponents = async (bomId: string) => {
    if (!bomId) return
    try {
      const comps = await getBomComponents(bomId)
      setSelectedBomComponents(comps)
    } catch (err) {
      console.warn('Erro ao carregar componentes:', err)
      setSelectedBomComponents([])
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedBomId) {
      loadBomComponents(selectedBomId)
    }
  }, [selectedBomId])

  useRealtime('bom_versions', () => loadData(true))
  useRealtime('bom_components', () => {
    if (selectedBomId) loadBomComponents(selectedBomId)
  })

  const selectedItem = useMemo(
    () => items.find((i) => i.id === selectedItemId) || null,
    [items, selectedItemId],
  )

  const selectedBom = useMemo(
    () => boms.find((b) => b.id === selectedBomId) || null,
    [boms, selectedBomId],
  )

  // Explosão da BOM
  const handleExplodeBom = async () => {
    if (!selectedBom?.product_id) return
    setExploding(true)
    try {
      const res = await getBomExplosion(selectedBom.product_id)
      setExplosionResult(res)
      toast({ title: `BOM explodida: ${res.total_components || 0} componentes em multinível` })
    } catch (err: any) {
      toast({ title: 'Erro ao explodir BOM', description: err?.message, variant: 'destructive' })
    } finally {
      setExploding(false)
    }
  }

  // Aprovação ou rejeição de versão de BOM
  const handleApproveBom = async (bomId: string, action: 'approve' | 'reject') => {
    try {
      await approveBomRevision({ bom_id: bomId, action })
      toast({
        title:
          action === 'approve'
            ? 'Revisão da BOM aprovada com sucesso!'
            : 'Revisão da BOM rejeitada.',
      })
      loadData(true)
    } catch (err: any) {
      toast({ title: 'Erro ao aprovar revisão', description: err?.message, variant: 'destructive' })
    }
  }

  // Custo Teórico total da BOM selecionada
  const theoreticalCostTotal = useMemo(() => {
    return selectedBomComponents.reduce((sum, c) => {
      const itemCost = Number(c.expand?.item_id?.standard_cost) || 12.5
      const qty = Number(c.quantidade) || 0
      const waste = Number(c.perda_prevista) || 0
      const effectiveQty = qty * (1 + waste / 100)
      return sum + effectiveQty * itemCost
    }, 0)
  }, [selectedBomComponents])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <Loader2 className="w-10 h-10 text-[#005B2E] animate-spin" />
        <p className="text-sm font-medium text-muted-foreground">
          Carregando Engenharia de Produtos & Fichas...
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
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                Fichas Técnicas, Fórmulas e Produtos
              </h1>
              <Badge
                variant="outline"
                className="text-xs bg-[#005B2E]/10 text-[#005B2E] font-bold border-[#005B2E]/30"
              >
                Engenharia de Produto
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Catálogo técnico, formulações, receitas com controle de versões (BOM), roteiros de
              fabricação e custos teóricos.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
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
            onClick={() => setNewBomDialogOpen(true)}
            className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold text-xs"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Nova Versão de BOM
          </Button>
        </div>
      </div>

      {/* AS 5 ABAS ESPECIFICADAS */}
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
        <TabsList className="bg-muted/60 p-1 rounded-xl grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 h-auto gap-1">
          <TabsTrigger value="fichas" className="text-xs py-2 font-bold flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-[#005B2E]" />
            <span>1. Ficha Técnica</span>
          </TabsTrigger>
          <TabsTrigger
            value="formulas"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <FileCode2 className="w-3.5 h-3.5 text-blue-600" />
            <span>2. Fórmulas & Receitas</span>
          </TabsTrigger>
          <TabsTrigger
            value="estrutura"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-purple-600" />
            <span>3. Estrutura (BOM)</span>
          </TabsTrigger>
          <TabsTrigger
            value="roteiros"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <Route className="w-3.5 h-3.5 text-amber-600" />
            <span>4. Etapas & Roteiros</span>
          </TabsTrigger>
          <TabsTrigger value="custos" className="text-xs py-2 font-bold flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            <span>5. Custos Teóricos</span>
          </TabsTrigger>
        </TabsList>

        {/* ABA 1: FICHA TÉCNICA DO PRODUTO */}
        <TabsContent value="fichas" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Lista lateral de produtos */}
            <Card className="border-2 border-[#005B2E]/20 md:col-span-4">
              <CardContent className="p-3 space-y-2">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                  Catálogo Industrial ({items.length})
                </span>
                <div className="space-y-1.5 max-h-[550px] overflow-y-auto">
                  {items.map((it) => (
                    <button
                      key={it.id}
                      type="button"
                      onClick={() => setSelectedItemId(it.id)}
                      className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${
                        selectedItemId === it.id
                          ? 'bg-[#005B2E]/10 border-[#005B2E] font-bold text-[#005B2E]'
                          : 'bg-white hover:bg-muted/40 border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate">{it.name}</span>
                        <Badge variant="outline" className="text-[10px] ml-1">
                          {it.type || 'PA'}
                        </Badge>
                      </div>
                      <span className="text-[11px] font-mono text-muted-foreground block">
                        Cód: {it.code || '—'} • Un: {it.unit || 'UN'}
                      </span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Detalhes da Ficha Técnica */}
            <Card className="border-2 border-[#005B2E]/20 md:col-span-8">
              <CardContent className="p-4 space-y-4">
                {selectedItem ? (
                  <>
                    <div className="flex items-center justify-between border-b pb-3">
                      <div>
                        <span className="text-xs text-muted-foreground font-mono">
                          CÓDIGO: {selectedItem.code || 'S/C'}
                        </span>
                        <h2 className="text-xl font-black text-foreground">{selectedItem.name}</h2>
                        <p className="text-xs text-muted-foreground">
                          Tipo:{' '}
                          <strong className="capitalize">
                            {selectedItem.type || 'Produto Acabado'}
                          </strong>{' '}
                          • Unidade de Medida: <strong>{selectedItem.unit || 'UN'}</strong>
                        </p>
                      </div>
                      <Badge className="bg-[#005B2E] text-white">Ativo no Portfólio</Badge>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-2.5 rounded bg-muted/30">
                        <span className="text-muted-foreground block">Estoque Mínimo:</span>
                        <strong className="text-sm font-mono">
                          {selectedItem.min_stock || 100} {selectedItem.unit}
                        </strong>
                      </div>
                      <div className="p-2.5 rounded bg-muted/30">
                        <span className="text-muted-foreground block">Estoque Máximo:</span>
                        <strong className="text-sm font-mono">
                          {selectedItem.max_stock || 5000} {selectedItem.unit}
                        </strong>
                      </div>
                      <div className="p-2.5 rounded bg-muted/30">
                        <span className="text-muted-foreground block">Ponto de Reposição:</span>
                        <strong className="text-sm font-mono">
                          {selectedItem.reorder_point || 300} {selectedItem.unit}
                        </strong>
                      </div>
                      <div className="p-2.5 rounded bg-muted/30">
                        <span className="text-muted-foreground block">Lead Time Compra:</span>
                        <strong className="text-sm font-mono">
                          {selectedItem.lead_time_days || 7} dias
                        </strong>
                      </div>
                    </div>

                    {/* Especificações de alimentos / conservas */}
                    <div className="p-3 rounded-lg border bg-slate-50 space-y-2 text-xs">
                      <strong className="text-foreground block">
                        Parâmetros Canônicos de Especificação:
                      </strong>
                      <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                        <p>
                          • Peso Líquido Canônico: <strong>500 g</strong>
                        </p>
                        <p>
                          • Peso Drenado Mínimo: <strong>320 g</strong>
                        </p>
                        <p>
                          • Validade Padrão: <strong>24 meses</strong>
                        </p>
                        <p>
                          • Temperatura de Armazenagem: <strong>Ambiente (15-25°C)</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCurrentTab('formulas')}
                        className="text-xs"
                      >
                        <FileCode2 className="w-3.5 h-3.5 mr-1 text-[#005B2E]" /> Ver Fórmulas e
                        Versões
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCurrentTab('estrutura')}
                        className="text-xs"
                      >
                        <Layers className="w-3.5 h-3.5 mr-1 text-purple-600" /> Estrutura da BOM
                      </Button>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-12">
                    Selecione um produto para visualizar a ficha técnica.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ABA 2: FÓRMULAS & RECEITAS (VERSÕES + APROVAÇÃO) */}
        <TabsContent value="formulas" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-[#005B2E] flex items-center gap-2">
                <FileCode2 className="w-4 h-4" /> Gestão de Versões e Receitas (Versionamento
                Imutável)
              </h3>
              <p className="text-xs text-muted-foreground">
                Alterações de receitas passam por fluxo de aprovação formal. Ordens já abertas
                mantêm seu snapshot histórico intacto.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setNewBomDialogOpen(true)}
              className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Nova Versão de Receita
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {boms.map((b) => (
              <Card
                key={b.id}
                className={`border-2 transition-all cursor-pointer ${
                  selectedBomId === b.id
                    ? 'border-[#005B2E] bg-[#005B2E]/5 shadow-sm'
                    : 'border-[#005B2E]/20 hover:border-[#005B2E]/40'
                }`}
                onClick={() => setSelectedBomId(b.id)}
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-sm text-foreground">
                          {b.expand?.product_id?.name || 'Item Industrial'}
                        </strong>
                        <Badge className="font-mono text-xs bg-slate-100 text-slate-800">
                          v{b.version} {b.revision_number ? `(Rev ${b.revision_number})` : ''}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground capitalize">
                        Tipo: {b.type || 'Estrutura Canônica'} • Responsável:{' '}
                        {b.responsible || 'Engenharia'}
                      </p>
                    </div>

                    <Badge
                      className={`text-xs ${REV_STATUS_COLORS[b.revision_status || b.status] || 'bg-gray-100'}`}
                    >
                      {b.revision_status || b.status}
                    </Badge>
                  </div>

                  {/* Ações de aprovação de engenharia */}
                  {(b.revision_status === 'rascunho' || b.revision_status === 'em_aprovacao') && (
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleApproveBom(b.id, 'approve')
                        }}
                        className="h-7 text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
                      >
                        <Check className="w-3 h-3 mr-1" /> Aprovar Versão
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleApproveBom(b.id, 'reject')
                        }}
                        className="h-7 text-xs text-rose-700 border-rose-300"
                      >
                        <X className="w-3 h-3 mr-1" /> Rejeitar
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ABA 3: ESTRUTURA (BOM MULTINÍVEL) */}
        <TabsContent value="estrutura" className="space-y-4">
          <Card className="border-2 border-[#005B2E]/20">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#005B2E] flex items-center gap-2">
                    <Layers className="w-4 h-4" /> Componentes da BOM Selecionada
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Produto:{' '}
                    <strong>{selectedBom?.expand?.product_id?.name || 'Selecione uma BOM'}</strong>{' '}
                    (v{selectedBom?.version || 1})
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={exploding || !selectedBom}
                    onClick={handleExplodeBom}
                    className="text-xs"
                  >
                    <GitBranch className="w-3.5 h-3.5 mr-1 text-[#005B2E]" />
                    {exploding ? 'Calculando Explosão...' : 'Explodir Multinível'}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setNewCompDialogOpen(true)}
                    disabled={!selectedBom}
                    className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold text-xs"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Adicionar Insumo
                  </Button>
                </div>
              </div>

              {/* Tabela de componentes */}
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-[#01361D] text-white">
                    <tr>
                      <th className="text-left p-2.5 font-bold">Seq</th>
                      <th className="text-left p-2.5 font-bold">Item Componente / Insumo</th>
                      <th className="text-right p-2.5 font-bold">Qtd Base</th>
                      <th className="text-center p-2.5 font-bold">Unidade</th>
                      <th className="text-right p-2.5 font-bold">Perda Prevista (%)</th>
                      <th className="text-center p-2.5 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {selectedBomComponents.map((c) => (
                      <tr key={c.id} className="hover:bg-muted/30">
                        <td className="p-2.5 font-mono">{c.ordem || 1}</td>
                        <td className="p-2.5 font-medium">
                          {c.expand?.item_id?.name || 'Insumo Industrial'}
                          <span className="text-[11px] text-muted-foreground block font-mono">
                            Cód: {c.expand?.item_id?.code || '—'}
                          </span>
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold">
                          {Number(c.quantidade || 1).toLocaleString('pt-BR')}
                        </td>
                        <td className="p-2.5 text-center">{c.unidade || 'KG'}</td>
                        <td className="p-2.5 text-right font-mono text-muted-foreground">
                          {c.perda_prevista ? `${c.perda_prevista}%` : '0.0%'}
                        </td>
                        <td className="p-2.5 text-center">
                          <Badge className="bg-emerald-100 text-emerald-800 text-[10px]">
                            Ativo
                          </Badge>
                        </td>
                      </tr>
                    ))}
                    {selectedBomComponents.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-6 text-muted-foreground italic">
                          Nenhum componente cadastrado para esta versão de BOM.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Resultado de explosão multinível */}
              {explosionResult && (
                <div className="p-4 rounded-xl border bg-slate-50 space-y-2">
                  <span className="font-bold text-xs text-[#005B2E] uppercase tracking-wider block">
                    Árvore de Explosão Multinível ({explosionResult.total_components || 0} nós):
                  </span>
                  <div className="space-y-1">
                    {(explosionResult.components || []).map((ec: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-xs py-1"
                        style={{ paddingLeft: `${(ec.level || 0) * 20}px` }}
                      >
                        {ec.level > 0 && (
                          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                        )}
                        <strong className="text-foreground">{ec.item_name}</strong>
                        <span className="text-[11px] text-muted-foreground font-mono">
                          ({ec.item_code})
                        </span>
                        <Badge variant="outline" className="text-[10px]">
                          Nível {ec.level}
                        </Badge>
                        <span className="text-xs font-mono font-bold text-[#005B2E]">
                          {ec.total_quantity} {ec.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA 4: ETAPAS E ROTEIROS */}
        <TabsContent value="roteiros" className="space-y-4">
          <Card className="border-2 border-[#005B2E]/20">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#005B2E] flex items-center gap-2">
                    <Route className="w-4 h-4" /> Roteiros Operacionais de Fabricação
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Sequência padrão de fases do chão de fábrica (Recebimento, Lavagem, Salmoura,
                    Envase, Rotulagem, Paletização).
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {routes.map((r) => (
                  <Card key={r.id} className="border bg-slate-50/50">
                    <CardContent className="p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <strong className="text-sm text-foreground">{r.name}</strong>
                        <Badge className="bg-[#005B2E] text-white text-xs">v{r.version || 1}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Produto: {r.expand?.product_id?.name || 'Geral'} • Lead Time Total:{' '}
                        {r.total_lead_time_hours || 4}h
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA 5: CUSTOS TEÓRICOS */}
        <TabsContent value="custos" className="space-y-4">
          <Card className="border-2 border-[#005B2E]/20">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#005B2E] flex items-center gap-2">
                    <DollarSign className="w-4 h-4" /> Formação Teórica do Custo de Produção (BOM
                    Standard)
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Custo padrão somando matérias-primas, embalagens e tolerância de perdas
                    teóricas.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-muted-foreground block">
                    Custo Teórico Calculado:
                  </span>
                  <span className="text-2xl font-black text-[#005B2E]">
                    R${' '}
                    {theoreticalCostTotal.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg border bg-blue-50/50 border-blue-200 text-xs">
                  <span className="font-bold text-blue-900 block">Matérias-Primas Diretas</span>
                  <p className="text-muted-foreground">
                    Azeitonas frescas, azeite, sal iodado, ervas aromáticas e acidulantes.
                  </p>
                </div>
                <div className="p-3 rounded-lg border bg-amber-50/50 border-amber-200 text-xs">
                  <span className="font-bold text-amber-900 block">Embalagens & Rótulos</span>
                  <p className="text-muted-foreground">
                    Potes de vidro 500g, tampas metálicas twist-off, rótulos e caixas de papelão.
                  </p>
                </div>
                <div className="p-3 rounded-lg border bg-emerald-50/50 border-emerald-200 text-xs">
                  <span className="font-bold text-emerald-900 block">Mão de Obra e GGF</span>
                  <p className="text-muted-foreground">
                    Apropriação estimada de horas-máquina da linha de envase.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* DIÁLOGO: NOVA VERSÃO DE BOM */}
      <Dialog open={newBomDialogOpen} onOpenChange={setNewBomDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E]">Cadastrar Versão de BOM</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              const fd = new FormData(e.currentTarget)
              try {
                await createBomVersion({
                  product_id: String(fd.get('product_id') || selectedItemId),
                  version: Number(fd.get('version') || 1),
                  type: String(fd.get('type') || 'formulacao') as any,
                  status: 'ativo',
                  revision_status: 'aprovada',
                  effective_date: new Date().toISOString().substring(0, 10),
                  responsible: user?.name || 'Engenharia',
                })
                toast({ title: 'Versão de BOM cadastrada!' })
                setNewBomDialogOpen(false)
                loadData(true)
              } catch (err: any) {
                toast({
                  title: 'Erro ao cadastrar',
                  description: err?.message,
                  variant: 'destructive',
                })
              }
            }}
            className="space-y-3 pt-2"
          >
            <div>
              <Label className="text-xs font-semibold">Produto Canônico *</Label>
              <Select name="product_id" defaultValue={selectedItemId}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {items.map((it) => (
                    <SelectItem key={it.id} value={it.id}>
                      {it.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Nº Versão</Label>
                <Input name="version" type="number" defaultValue="2" min="1" className="h-9" />
              </div>
              <div>
                <Label className="text-xs font-semibold">Tipo</Label>
                <Select name="type" defaultValue="formulacao">
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formulacao">Formulação</SelectItem>
                    <SelectItem value="estrutura">Estrutura</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setNewBomDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
              >
                Salvar Versão
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIÁLOGO: NOVO COMPONENTE DE BOM */}
      <Dialog open={newCompDialogOpen} onOpenChange={setNewCompDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E]">Adicionar Insumo à BOM</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              const fd = new FormData(e.currentTarget)
              try {
                await createBomComponent({
                  bom_version_id: selectedBomId,
                  item_id: String(fd.get('item_id') || ''),
                  quantidade: String(fd.get('quantidade') || 1),
                  unidade: String(fd.get('unidade') || 'KG'),
                  perda_prevista: String(fd.get('perda_prevista') || 0),
                  ordem: selectedBomComponents.length + 1,
                })
                toast({ title: 'Componente adicionado à receita!' })
                setNewCompDialogOpen(false)
                loadBomComponents(selectedBomId)
              } catch (err: any) {
                toast({
                  title: 'Erro ao adicionar insumo',
                  description: err?.message,
                  variant: 'destructive',
                })
              }
            }}
            className="space-y-3 pt-2"
          >
            <div>
              <Label className="text-xs font-semibold">Item Insumo / Embalagem *</Label>
              <Select name="item_id" required>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Selecione o insumo..." />
                </SelectTrigger>
                <SelectContent>
                  {items.map((it) => (
                    <SelectItem key={it.id} value={it.id}>
                      {it.name} ({it.unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs font-semibold">Qtd Base</Label>
                <Input
                  name="quantidade"
                  type="number"
                  step="0.001"
                  defaultValue="1"
                  className="h-9"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Unidade</Label>
                <Input name="unidade" defaultValue="KG" className="h-9" />
              </div>
              <div>
                <Label className="text-xs font-semibold">Perda (%)</Label>
                <Input
                  name="perda_prevista"
                  type="number"
                  step="0.1"
                  defaultValue="2"
                  className="h-9"
                />
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setNewCompDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
              >
                Adicionar Insumo
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
