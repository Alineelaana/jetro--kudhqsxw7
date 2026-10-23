import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  MapPin,
  Route as RouteIcon,
  Container,
  Compass,
  Boxes,
  Building2,
  RefreshCw,
  Navigation,
} from 'lucide-react'
import { useBrand } from '@/hooks/use-brand'
import { LogisticsRoutes } from '@/components/logistics/logistics-routes'
import { LogisticsRoutePlanning } from '@/components/logistics/logistics-route-planning'
import { TransporteLoadBuilding } from '@/components/transporte/transporte-load-building'
import { TransporteRouting } from '@/components/transporte/transporte-routing'
import { TransporteJourneys } from '@/components/transporte/transporte-journeys'

export function ScreenRotasRoteirizacao() {
  const { brand, empresasDisponiveis, empresaAtivaId } = useBrand()
  const [currentTab, setCurrentTab] = useState('rotas')
  const [refreshKey, setRefreshKey] = useState(0)

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

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1)
  }

  return (
    <div className="space-y-4" key={refreshKey}>
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#005B2E] text-white shadow-sm">
            <RouteIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                Rotas e Roteirização
              </h1>
              <Badge
                variant="outline"
                className="text-xs bg-[#005B2E]/10 text-[#005B2E] font-bold border-[#005B2E]/30"
              >
                Planejamento Geográfico & Cargas
              </Badge>
              {empresaAtivaId && (
                <Badge variant="secondary" className="text-xs flex items-center gap-1 font-medium">
                  <Building2 className="w-3 h-3 text-[#005B2E]" />
                  {empresaAtualNome}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Cadastro de rotas padrão, formação e cubagem de cargas, roteirização geográfica
              otimizada, planejamento de sequenciamento e controle de viagens.
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

      {/* ABAS DE ROTAS E ROTEIRIZAÇÃO */}
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
        <TabsList className="bg-muted/60 p-1 rounded-xl grid grid-cols-2 md:grid-cols-5 h-auto gap-1">
          <TabsTrigger value="rotas" className="text-xs py-2 font-bold flex items-center gap-1.5">
            <RouteIcon className="w-3.5 h-3.5 text-[#005B2E]" />
            <span>Rotas Cadastradas</span>
          </TabsTrigger>
          <TabsTrigger
            value="roteirizacao"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <Compass className="w-3.5 h-3.5 text-blue-600" />
            <span>Roteirização Otimizada</span>
          </TabsTrigger>
          <TabsTrigger value="cargas" className="text-xs py-2 font-bold flex items-center gap-1.5">
            <Boxes className="w-3.5 h-3.5 text-purple-600" />
            <span>Formação de Cargas</span>
          </TabsTrigger>
          <TabsTrigger value="viagens" className="text-xs py-2 font-bold flex items-center gap-1.5">
            <Container className="w-3.5 h-3.5 text-amber-600" />
            <span>Viagens e Jornadas</span>
          </TabsTrigger>
          <TabsTrigger
            value="planejamento"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <Navigation className="w-3.5 h-3.5 text-emerald-600" />
            <span>Sequenciamento</span>
          </TabsTrigger>
        </TabsList>

        {/* ABA 1: ROTAS CADASTRADAS */}
        <TabsContent value="rotas" className="space-y-4">
          <LogisticsRoutes />
        </TabsContent>

        {/* ABA 2: ROTEIRIZAÇÃO */}
        <TabsContent value="roteirizacao" className="space-y-4">
          <TransporteRouting />
        </TabsContent>

        {/* ABA 3: FORMAÇÃO DE CARGAS */}
        <TabsContent value="cargas" className="space-y-4">
          <TransporteLoadBuilding />
        </TabsContent>

        {/* ABA 4: VIAGENS */}
        <TabsContent value="viagens" className="space-y-4">
          <TransporteJourneys />
        </TabsContent>

        {/* ABA 5: PLANEJAMENTO E SEQUENCIAMENTO */}
        <TabsContent value="planejamento" className="space-y-4">
          <LogisticsRoutePlanning />
        </TabsContent>
      </Tabs>
    </div>
  )
}
