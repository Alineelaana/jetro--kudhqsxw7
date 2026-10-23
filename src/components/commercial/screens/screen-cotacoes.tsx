import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { FileText, Calculator, History, Building2, Scale, Sparkles } from 'lucide-react'
import { useBrand } from '@/hooks/use-brand'
import { MkExternalQuotationsPanel } from '@/components/trade-marketing/mk-eq-panel'
import { PricingSimulator } from '@/components/pricing/pricing-simulator'
import { PricingSimulations } from '@/components/pricing/pricing-simulations'

export function ScreenCotacoes() {
  const { brand, empresasDisponiveis, empresaAtivaId } = useBrand()
  const [currentTab, setCurrentTab] = useState('cotacoes')

  const empresaAtualNome =
    empresasDisponiveis?.find((e: any) => e.id === empresaAtivaId)?.nome_fantasia ||
    brand?.nomeExibicao ||
    'Todas as Empresas'

  return (
    <div className="space-y-4">
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#005B2E] text-white shadow-sm">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                Cotações e Cotador Comercial
              </h1>
              <Badge
                variant="outline"
                className="text-xs bg-[#005B2E]/10 text-[#005B2E] font-bold border-[#005B2E]/30"
              >
                Origem Única de Preços
              </Badge>
              {empresaAtivaId && (
                <Badge variant="secondary" className="text-xs flex items-center gap-1 font-medium">
                  <Building2 className="w-3 h-3 text-[#005B2E]" />
                  {empresaAtualNome}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Origem única para solicitações e cotações com fornecedores/concorrência, cotador e
              simulador de formação de preços de venda e histórico comparativo de simulações.
            </p>
          </div>
        </div>
      </div>

      {/* ABAS */}
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
        <TabsList className="bg-muted/60 p-1 rounded-xl grid grid-cols-3 max-w-lg h-auto gap-1">
          <TabsTrigger
            value="cotacoes"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-[#005B2E]" />
            <span>Cotações e Solicitações</span>
          </TabsTrigger>
          <TabsTrigger value="cotador" className="text-xs py-2 font-bold flex items-center gap-1.5">
            <Calculator className="w-3.5 h-3.5 text-blue-600" />
            <span>Cotador Comercial</span>
          </TabsTrigger>
          <TabsTrigger
            value="historico"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <History className="w-3.5 h-3.5 text-amber-600" />
            <span>Histórico de Simulações</span>
          </TabsTrigger>
        </TabsList>

        {/* ABA 1: COTAÇÕES E SOLICITAÇÕES (Origem única consolidada com Trade) */}
        <TabsContent value="cotacoes" className="space-y-4">
          <MkExternalQuotationsPanel />
        </TabsContent>

        {/* ABA 2: COTADOR (Simulador de custos, impostos e margem) */}
        <TabsContent value="cotador" className="space-y-4">
          <PricingSimulator />
        </TabsContent>

        {/* ABA 3: HISTÓRICO */}
        <TabsContent value="historico" className="space-y-4">
          <PricingSimulations />
        </TabsContent>
      </Tabs>
    </div>
  )
}
