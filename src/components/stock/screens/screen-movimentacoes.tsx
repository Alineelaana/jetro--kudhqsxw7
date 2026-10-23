import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
  SlidersHorizontal,
  History,
  Building2,
  Boxes,
  FileSpreadsheet,
} from 'lucide-react'
import { useBrand } from '@/hooks/use-brand'
import { StockMovements } from '@/components/stock/stock-movements'
import { StockTransfers } from '@/components/stock/stock-transfers'
import { StockAdjustments } from '@/components/stock/stock-adjustments'

export function ScreenMovimentacoes() {
  const { brand, empresasDisponiveis, empresaAtivaId } = useBrand()
  const [currentTab, setCurrentTab] = useState('entradas')

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

  return (
    <div className="space-y-4">
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#005B2E] text-white shadow-sm">
            <ArrowRightLeft className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-foreground tracking-tight">Movimentações</h1>
              <Badge
                variant="outline"
                className="text-xs bg-[#005B2E]/10 text-[#005B2E] font-bold border-[#005B2E]/30"
              >
                Entradas, Saídas e Transferências
              </Badge>
              {empresaAtivaId && (
                <Badge variant="secondary" className="text-xs flex items-center gap-1 font-medium">
                  <Building2 className="w-3 h-3 text-[#005B2E]" />
                  {empresaAtualNome}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Gestão completa do fluxo físico de mercadorias: entradas de compras e devoluções,
              saídas de expedição, transferências entre depósitos/filiais, ajustes e auditoria de
              movimentações.
            </p>
          </div>
        </div>
      </div>

      {/* ABAS DA TELA CONFORME ESPECIFICAÇÃO:
          1. Entradas · 2. Saídas · 3. Transferências entre filiais/depósitos · 4. Ajustes e Inventário de precisão · 5. Histórico completo */}
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
        <TabsList className="bg-muted/60 p-1 rounded-xl grid grid-cols-2 md:grid-cols-5 h-auto gap-1">
          <TabsTrigger
            value="entradas"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
            <span>Entradas</span>
          </TabsTrigger>
          <TabsTrigger value="saidas" className="text-xs py-2 font-bold flex items-center gap-1.5">
            <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
            <span>Saídas</span>
          </TabsTrigger>
          <TabsTrigger
            value="transferencias"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-blue-600" />
            <span>Transferências</span>
          </TabsTrigger>
          <TabsTrigger value="ajustes" className="text-xs py-2 font-bold flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600" />
            <span>Ajustes & Precisão</span>
          </TabsTrigger>
          <TabsTrigger
            value="historico"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <History className="w-3.5 h-3.5 text-purple-600" />
            <span>Histórico Completo</span>
          </TabsTrigger>
        </TabsList>

        {/* ABA 1: ENTRADAS */}
        <TabsContent value="entradas" className="space-y-4">
          <Card className="border-2 border-[#005B2E]/10 bg-emerald-50/20 p-3 mb-2">
            <div className="flex items-center gap-2">
              <ArrowDownLeft className="w-4 h-4 text-emerald-700" />
              <span className="text-xs font-semibold text-emerald-950">
                Visualização filtrada por movimentações de <strong>Entrada</strong> (compras, notas
                fiscais de recebimento, devoluções de clientes e bonificações).
              </span>
            </div>
          </Card>
          <StockMovements initialFilter="Entrada" />
        </TabsContent>

        {/* ABA 2: SAÍDAS */}
        <TabsContent value="saidas" className="space-y-4">
          <Card className="border-2 border-[#005B2E]/10 bg-rose-50/20 p-3 mb-2">
            <div className="flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-rose-700" />
              <span className="text-xs font-semibold text-rose-950">
                Visualização filtrada por movimentações de <strong>Saída</strong> (faturamento de
                pedidos de venda, devoluções a fornecedores, requisições internas e perdas).
              </span>
            </div>
          </Card>
          <StockMovements initialFilter="Saída" />
        </TabsContent>

        {/* ABA 3: TRANSFERÊNCIAS ENTRE FILIAIS E DEPÓSITOS */}
        <TabsContent value="transferencias" className="space-y-4">
          <StockTransfers />
        </TabsContent>

        {/* ABA 4: AJUSTES E INVENTÁRIO DE PRECISÃO */}
        <TabsContent value="ajustes" className="space-y-4">
          <StockAdjustments />
        </TabsContent>

        {/* ABA 5: HISTÓRICO COMPLETO COM TODOS OS TIPOS E FILTROS */}
        <TabsContent value="historico" className="space-y-4">
          <StockMovements />
        </TabsContent>
      </Tabs>
    </div>
  )
}
