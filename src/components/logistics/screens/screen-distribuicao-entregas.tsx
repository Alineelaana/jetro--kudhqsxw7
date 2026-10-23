import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  PackageCheck,
  Truck,
  RotateCcw,
  Smartphone,
  Layers,
  ArrowRightLeft,
  Building2,
  RefreshCw,
  Boxes,
} from 'lucide-react'
import { useBrand } from '@/hooks/use-brand'
import { WmsRomaneios } from '@/components/stock/wms-romaneios'
import { LogisticsDeliveries } from '@/components/logistics/logistics-deliveries'
import { LogisticsCollections } from '@/components/logistics/logistics-collections'
import { LogisticsReverseOrchestration } from '@/components/logistics/logistics-reverse-orchestration'
import { LogisticsDriverApp } from '@/components/logistics/logistics-driver-app'
import { LogisticsTransfers } from '@/components/logistics/logistics-transfers'

export function ScreenDistribuicaoEntregas() {
  const { brand, empresasDisponiveis, empresaAtivaId } = useBrand()
  const [currentTab, setCurrentTab] = useState('romaneios')
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
            <PackageCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                Distribuição e Entregas
              </h1>
              <Badge
                variant="outline"
                className="text-xs bg-[#005B2E]/10 text-[#005B2E] font-bold border-[#005B2E]/30"
              >
                Orquestração de Ponta a Ponta
              </Badge>
              {empresaAtivaId && (
                <Badge variant="secondary" className="text-xs flex items-center gap-1 font-medium">
                  <Building2 className="w-3 h-3 text-[#005B2E]" />
                  {empresaAtualNome}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Emissão de romaneios de carga, monitoramento de entregas aos clientes, ordens de
              coleta, transferências entre filiais, logística reversa e aplicativo móvel do
              motorista.
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

      {/* ABAS DA TELA DE DISTRIBUIÇÃO E ENTREGAS */}
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
        <TabsList className="bg-muted/60 p-1 rounded-xl grid grid-cols-2 md:grid-cols-6 h-auto gap-1">
          <TabsTrigger
            value="romaneios"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <Boxes className="w-3.5 h-3.5 text-[#005B2E]" />
            <span>Romaneios</span>
          </TabsTrigger>
          <TabsTrigger
            value="entregas"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <Truck className="w-3.5 h-3.5 text-blue-600" />
            <span>Entregas</span>
          </TabsTrigger>
          <TabsTrigger value="coletas" className="text-xs py-2 font-bold flex items-center gap-1.5">
            <PackageCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Coletas</span>
          </TabsTrigger>
          <TabsTrigger
            value="transferencias"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-600" />
            <span>Transferências</span>
          </TabsTrigger>
          <TabsTrigger value="reversa" className="text-xs py-2 font-bold flex items-center gap-1.5">
            <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
            <span>Logística Reversa</span>
          </TabsTrigger>
          <TabsTrigger
            value="driver_app"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <Smartphone className="w-3.5 h-3.5 text-purple-600" />
            <span>App do Motorista</span>
          </TabsTrigger>
        </TabsList>

        {/* ABA 1: ROMANEIOS */}
        <TabsContent value="romaneios" className="space-y-4">
          <WmsRomaneios />
        </TabsContent>

        {/* ABA 2: ENTREGAS */}
        <TabsContent value="entregas" className="space-y-4">
          <LogisticsDeliveries />
        </TabsContent>

        {/* ABA 3: COLETAS */}
        <TabsContent value="coletas" className="space-y-4">
          <LogisticsCollections />
        </TabsContent>

        {/* ABA 4: TRANSFERÊNCIAS ENTRE UNIDADES */}
        <TabsContent value="transferencias" className="space-y-4">
          <LogisticsTransfers />
        </TabsContent>

        {/* ABA 5: LOGÍSTICA REVERSA E DEVOLUÇÕES */}
        <TabsContent value="reversa" className="space-y-4">
          <LogisticsReverseOrchestration />
        </TabsContent>

        {/* ABA 6: APLICATIVO DO MOTORISTA */}
        <TabsContent value="driver_app" className="space-y-4">
          <LogisticsDriverApp />
        </TabsContent>
      </Tabs>
    </div>
  )
}
