import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ShoppingCart, FileSpreadsheet, Receipt, Percent, Building2 } from 'lucide-react'
import { useBrand } from '@/hooks/use-brand'
import { SalesOrdersPanel } from '@/components/sales/sales-orders-panel'
import { InvoicingPanel } from '@/components/sales/invoicing-panel'
import { BudgetRequestsPanel } from '@/components/budget-requests-panel'
import { PromotionPanel } from '@/components/promotions/promotion-panel'

export function ScreenPedidosFaturamento() {
  const { brand, empresasDisponiveis, empresaAtivaId } = useBrand()
  const [currentTab, setCurrentTab] = useState('pedidos')

  const empresaAtualNome =
    empresasDisponiveis?.find((e: any) => e.id === empresaAtivaId)?.nome_fantasia ||
    brand?.nomeExibicao ||
    'Todas as Empresas'

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#005B2E] text-white shadow-sm">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                Pedidos e Faturamento
              </h1>
              <Badge
                variant="outline"
                className="text-xs bg-[#005B2E]/10 text-[#005B2E] font-bold border-[#005B2E]/30"
              >
                Operação Comercial
              </Badge>
              {empresaAtivaId && (
                <Badge variant="secondary" className="text-xs flex items-center gap-1 font-medium">
                  <Building2 className="w-3 h-3 text-[#005B2E]" />
                  {empresaAtualNome}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Emissão e acompanhamento de pedidos de venda, orçamentos, faturamento integrado e
              campanhas promocionais.
            </p>
          </div>
        </div>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
        <TabsList className="bg-muted/60 p-1 rounded-xl grid grid-cols-4 max-w-xl h-auto gap-1">
          <TabsTrigger value="pedidos" className="text-xs py-2 font-bold flex items-center gap-1.5">
            <ShoppingCart className="w-3.5 h-3.5 text-[#005B2E]" />
            <span>Pedidos de Venda</span>
          </TabsTrigger>
          <TabsTrigger
            value="orcamentos"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
            <span>Orçamentos</span>
          </TabsTrigger>
          <TabsTrigger
            value="faturamento"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <Receipt className="w-3.5 h-3.5 text-purple-600" />
            <span>Faturamento</span>
          </TabsTrigger>
          <TabsTrigger
            value="promocoes"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <Percent className="w-3.5 h-3.5 text-amber-600" />
            <span>Promoções</span>
          </TabsTrigger>
        </TabsList>

        {/* ABA 1: PEDIDOS DE VENDA */}
        <TabsContent value="pedidos" className="space-y-4">
          <SalesOrdersPanel />
        </TabsContent>

        {/* ABA 2: ORÇAMENTOS E PROPOSTAS */}
        <TabsContent value="orcamentos" className="space-y-4">
          <BudgetRequestsPanel />
        </TabsContent>

        {/* ABA 3: FATURAMENTO */}
        <TabsContent value="faturamento" className="space-y-4">
          <InvoicingPanel />
        </TabsContent>

        {/* ABA 4: PROMOÇÕES */}
        <TabsContent value="promocoes" className="space-y-4">
          <PromotionPanel />
        </TabsContent>
      </Tabs>
    </div>
  )
}
