import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { FileCheck2, RotateCcw, Building2 } from 'lucide-react'
import { useBrand } from '@/hooks/use-brand'
import { ContractsOperationsPanel } from '@/components/contracts-operations-panel'
import { SalesReturnsPanel } from '@/components/sales/sales-returns-panel'

export function ScreenContratosDevolucoes() {
  const { brand, empresasDisponiveis, empresaAtivaId } = useBrand()
  const [currentTab, setCurrentTab] = useState('contratos')

  const empresaAtualNome =
    empresasDisponiveis?.find((e: any) => e.id === empresaAtivaId)?.nome_fantasia ||
    brand?.nomeExibicao ||
    'Todas as Empresas'

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#005B2E] text-white shadow-sm">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                Contratos e Devoluções
              </h1>
              <Badge
                variant="outline"
                className="text-xs bg-[#005B2E]/10 text-[#005B2E] font-bold border-[#005B2E]/30"
              >
                Pós-Venda & Jurídico Comercial
              </Badge>
              {empresaAtivaId && (
                <Badge variant="secondary" className="text-xs flex items-center gap-1 font-medium">
                  <Building2 className="w-3 h-3 text-[#005B2E]" />
                  {empresaAtualNome}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Gestão de contratos comerciais de fornecimento, comodato e controle integrado de
              devoluções e trocas.
            </p>
          </div>
        </div>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
        <TabsList className="bg-muted/60 p-1 rounded-xl grid grid-cols-2 max-w-md h-auto gap-1">
          <TabsTrigger
            value="contratos"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <FileCheck2 className="w-3.5 h-3.5 text-[#005B2E]" />
            <span>Contratos de Venda</span>
          </TabsTrigger>
          <TabsTrigger
            value="devolucoes"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
            <span>Devoluções e Trocas</span>
          </TabsTrigger>
        </TabsList>

        {/* ABA 1: CONTRATOS DE VENDA */}
        <TabsContent value="contratos" className="space-y-4">
          <ContractsOperationsPanel />
        </TabsContent>

        {/* ABA 2: DEVOLUÇÕES E TROCAS */}
        <TabsContent value="devolucoes" className="space-y-4">
          <SalesReturnsPanel />
        </TabsContent>
      </Tabs>
    </div>
  )
}
