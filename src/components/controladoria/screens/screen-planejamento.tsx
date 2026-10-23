import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  CalendarRange,
  Target,
  LineChart,
  Gauge,
  Briefcase,
  RefreshCw,
  Building2,
} from 'lucide-react'
import { useBrand } from '@/hooks/use-brand'
import { toast } from '@/hooks/use-toast'
import { ControladoriaBudget } from '../controladoria-budget'
import { ControladoriaForecast } from '../controladoria-forecast'
import { ControladoriaDrivers } from '../controladoria-drivers'
import { ControladoriaGenericScreen } from '../controladoria-generic'

export function ScreenPlanejamento() {
  const { brand, empresasDisponiveis, empresaAtivaId } = useBrand()
  const [activeTab, setActiveTab] = useState<'budget' | 'forecast' | 'drivers' | 'centros'>(
    'budget',
  )
  const [refreshKey, setRefreshKey] = useState(0)

  const empresaAtualNome =
    empresasDisponiveis?.find((e: any) => e.id === empresaAtivaId)?.nome_fantasia ||
    brand?.nomeExibicao ||
    'Todas as Empresas'

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1)
    toast({ title: 'Planejamento e Orçamento atualizados' })
  }

  return (
    <div className="space-y-4">
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#005B2E] text-white shadow-sm">
            <CalendarRange className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                Planejamento e Orçamento
              </h1>
              <Badge
                variant="outline"
                className="text-xs bg-[#005B2E]/10 text-[#005B2E] font-bold border-[#005B2E]/30"
              >
                Budget & Forecast
              </Badge>
              {empresaAtivaId && (
                <Badge variant="secondary" className="text-xs flex items-center gap-1 font-medium">
                  <Building2 className="w-3 h-3 text-[#005B2E]" />
                  {empresaAtualNome}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Acompanhamento de Orçado × Realizado (Budget), projeções contínuas de Forecast,
              drivers operacionais e centros de resultado.
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

      {/* ABAS: Orçamento/Budget | Forecast | Drivers | Centros de Resultado */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as 'budget' | 'forecast' | 'drivers' | 'centros')}
        className="space-y-4"
      >
        <TabsList className="bg-muted/60 p-1 border border-border">
          <TabsTrigger
            value="budget"
            className="data-[state=active]:bg-background data-[state=active]:text-[#005B2E] data-[state=active]:shadow-sm font-semibold text-xs flex items-center gap-2"
          >
            <Target className="w-3.5 h-3.5" />
            Orçamento / Budget
          </TabsTrigger>
          <TabsTrigger
            value="forecast"
            className="data-[state=active]:bg-background data-[state=active]:text-[#005B2E] data-[state=active]:shadow-sm font-semibold text-xs flex items-center gap-2"
          >
            <LineChart className="w-3.5 h-3.5" />
            Forecast & Projeções
          </TabsTrigger>
          <TabsTrigger
            value="drivers"
            className="data-[state=active]:bg-background data-[state=active]:text-[#005B2E] data-[state=active]:shadow-sm font-semibold text-xs flex items-center gap-2"
          >
            <Gauge className="w-3.5 h-3.5" />
            Drivers Empresariais
          </TabsTrigger>
          <TabsTrigger
            value="centros"
            className="data-[state=active]:bg-background data-[state=active]:text-[#005B2E] data-[state=active]:shadow-sm font-semibold text-xs flex items-center gap-2"
          >
            <Briefcase className="w-3.5 h-3.5" />
            Centros de Resultado
          </TabsTrigger>
        </TabsList>

        <TabsContent value="budget" className="space-y-4">
          <ControladoriaBudget key={`budget-${refreshKey}`} />
        </TabsContent>

        <TabsContent value="forecast" className="space-y-4">
          <ControladoriaForecast key={`forecast-${refreshKey}`} />
        </TabsContent>

        <TabsContent value="drivers" className="space-y-4">
          <ControladoriaDrivers key={`drivers-${refreshKey}`} />
        </TabsContent>

        <TabsContent value="centros" className="space-y-4">
          <ControladoriaGenericScreen configKey="result_centers" key={`centros-${refreshKey}`} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
