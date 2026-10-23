import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  TrendingUp,
  DollarSign,
  BarChart3,
  FileSpreadsheet,
  Building2,
  RefreshCw,
} from 'lucide-react'
import { useBrand } from '@/hooks/use-brand'
import { LogisticsCosts } from '@/components/logistics/logistics-costs'
import { LogisticsIndicators } from '@/components/logistics/logistics-indicators'
import { LogisticsReports } from '@/components/logistics/logistics-reports'

export function ScreenCustosIndicadores() {
  const { brand, empresasDisponiveis, empresaAtivaId } = useBrand()
  const [currentTab, setCurrentTab] = useState('custos')
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
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                Custos e Indicadores Logísticos
              </h1>
              <Badge
                variant="outline"
                className="text-xs bg-[#005B2E]/10 text-[#005B2E] font-bold border-[#005B2E]/30"
              >
                Inteligência Analítica & KPIs
              </Badge>
              {empresaAtivaId && (
                <Badge variant="secondary" className="text-xs flex items-center gap-1 font-medium">
                  <Building2 className="w-3 h-3 text-[#005B2E]" />
                  {empresaAtualNome}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Apropriação e rateio de custos de transporte, indicadores de performance (OTIF, Lead
              Time, Nível de Serviço) e relatórios executivos de expedição.
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

      {/* ABAS: CUSTOS, INDICADORES E RELATÓRIOS */}
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
        <TabsList className="bg-muted/60 p-1 rounded-xl grid grid-cols-3 max-w-xl h-auto gap-1">
          <TabsTrigger value="custos" className="text-xs py-2 font-bold flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-amber-600" />
            <span>Custos Logísticos</span>
          </TabsTrigger>
          <TabsTrigger
            value="indicadores"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <BarChart3 className="w-3.5 h-3.5 text-[#005B2E]" />
            <span>Indicadores & OTIF</span>
          </TabsTrigger>
          <TabsTrigger
            value="relatorios"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
            <span>Relatórios Gerenciais</span>
          </TabsTrigger>
        </TabsList>

        {/* ABA 1: CUSTOS LOGÍSTICOS */}
        <TabsContent value="custos" className="space-y-4">
          <LogisticsCosts />
        </TabsContent>

        {/* ABA 2: INDICADORES E OTIF */}
        <TabsContent value="indicadores" className="space-y-4">
          <LogisticsIndicators />
        </TabsContent>

        {/* ABA 3: RELATÓRIOS GERENCIAIS */}
        <TabsContent value="relatorios" className="space-y-4">
          <LogisticsReports />
        </TabsContent>
      </Tabs>
    </div>
  )
}
