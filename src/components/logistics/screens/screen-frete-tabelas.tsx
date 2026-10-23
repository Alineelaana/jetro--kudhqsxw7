import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { DollarSign, TableProperties, Building2, RefreshCw, Percent } from 'lucide-react'
import { useBrand } from '@/hooks/use-brand'
import { LogisticsFreights } from '@/components/logistics/logistics-freights'
import { LogisticsFreightTables } from '@/components/logistics/logistics-freight-tables'

export function ScreenFreteTabelas() {
  const { brand, empresasDisponiveis, empresaAtivaId } = useBrand()
  const [currentTab, setCurrentTab] = useState('fretes')
  const [refreshKey, setRefreshKey] = useState(0)

  const empresaAtualNome = useMemo(() => {
    const emp = empresasDisponiveis?.find((e: any) => e.id === empresaAtivaId)
    return emp?.nome_fantasia || emp?.razao_social || brand?.name || 'Todas as Empresas'
  }, [empresasDisponiveis, empresaAtivaId, brand])

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1)
  }

  return (
    <div className="space-y-4" key={refreshKey}>
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#005B2E] text-white shadow-sm">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                Frete e Tabelas
              </h1>
              <Badge
                variant="outline"
                className="text-xs bg-[#005B2E]/10 text-[#005B2E] font-bold border-[#005B2E]/30"
              >
                Cálculo & Negociação Comercial de Transporte
              </Badge>
              {empresaAtivaId && (
                <Badge variant="secondary" className="text-xs flex items-center gap-1 font-medium">
                  <Building2 className="w-3 h-3 text-[#005B2E]" />
                  {empresaAtualNome}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Gestão de cotações e lançamentos de frete por transportadora, aprovações de pagamento,
              parametrização de tabelas de frete (faixa de peso, valor da nota e pedágio).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            className="text-xs focus-visible:ring-[#005B2E]"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* ABAS: FRETES E TABELAS DE FRETE */}
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
        <TabsList className="bg-muted/60 p-1 rounded-xl grid grid-cols-2 max-w-md h-auto gap-1">
          <TabsTrigger value="fretes" className="text-xs py-2 font-bold flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-[#005B2E]" />
            <span>Fretes e Pagamentos</span>
          </TabsTrigger>
          <TabsTrigger value="tabelas" className="text-xs py-2 font-bold flex items-center gap-1.5">
            <TableProperties className="w-3.5 h-3.5 text-blue-600" />
            <span>Tabelas de Frete</span>
          </TabsTrigger>
        </TabsList>

        {/* ABA 1: FRETES E PAGAMENTOS */}
        <TabsContent value="fretes" className="space-y-4">
          <LogisticsFreights />
        </TabsContent>

        {/* ABA 2: TABELAS DE FRETE */}
        <TabsContent value="tabelas" className="space-y-4">
          <LogisticsFreightTables />
        </TabsContent>
      </Tabs>
    </div>
  )
}
