import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Truck,
  MapPin,
  PackageSearch,
  Waves,
  RefreshCw,
  Boxes,
  ScanBarcode,
  Users,
  Building2,
} from 'lucide-react'
import { useBrand } from '@/hooks/use-brand'
import { WmsReceiving } from '@/components/stock/wms-receiving'
import { WmsPutaway } from '@/components/stock/wms-putaway'
import { WmsSeparation } from '@/components/stock/wms-separation'
import { StockPicking } from '@/components/stock/stock-picking'
import { WmsWaves } from '@/components/stock/wms-waves'
import { WmsReplenishment } from '@/components/stock/wms-replenishment'
import { WmsPallets } from '@/components/stock/wms-pallets'
import { WmsVolumes } from '@/components/stock/wms-volumes'
import { WmsCollectors } from '@/components/stock/wms-collectors'
import { WmsOperators } from '@/components/stock/wms-operators'
import { StockLocations } from '@/components/stock/stock-locations'

export function ScreenWmsOperacional() {
  const { brand, empresasDisponiveis, empresaAtivaId } = useBrand()
  const [currentTab, setCurrentTab] = useState('recebimento')

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
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                WMS Operacional
              </h1>
              <Badge
                variant="outline"
                className="text-xs bg-[#005B2E]/10 text-[#005B2E] font-bold border-[#005B2E]/30"
              >
                Chão de Armazém & Execução WMS
              </Badge>
              {empresaAtivaId && (
                <Badge variant="secondary" className="text-xs flex items-center gap-1 font-medium">
                  <Building2 className="w-3 h-3 text-[#005B2E]" />
                  {empresaAtualNome}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Execução física do armazém: recebimento em docas, endereçamento inteligente (putaway),
              separação de pedidos (picking), consolidação de ondas, reabastecimento ativo, pallets,
              volumes, coletores RF e escala de operadores.
            </p>
          </div>
        </div>
      </div>

      {/* ABAS DA TELA CONFORME ESPECIFICAÇÃO:
          1. Recebimento
          2. Endereçamento
          3. Separação/Picking
          4. Ondas
          5. Reabastecimento
          6. Pallets e Volumes
          7. Coletores (código de barras)
          8. Operadores */}
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
        <TabsList className="bg-muted/60 p-1 rounded-xl grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 h-auto gap-1">
          <TabsTrigger
            value="recebimento"
            className="text-xs py-2 font-bold flex items-center gap-1"
          >
            <Truck className="w-3.5 h-3.5 text-blue-600" />
            <span className="truncate">Recebimento</span>
          </TabsTrigger>
          <TabsTrigger
            value="enderecamento"
            className="text-xs py-2 font-bold flex items-center gap-1"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span className="truncate">Endereçamento</span>
          </TabsTrigger>
          <TabsTrigger value="separacao" className="text-xs py-2 font-bold flex items-center gap-1">
            <PackageSearch className="w-3.5 h-3.5 text-purple-600" />
            <span className="truncate">Picking</span>
          </TabsTrigger>
          <TabsTrigger value="ondas" className="text-xs py-2 font-bold flex items-center gap-1">
            <Waves className="w-3.5 h-3.5 text-indigo-600" />
            <span className="truncate">Ondas</span>
          </TabsTrigger>
          <TabsTrigger
            value="reabastecimento"
            className="text-xs py-2 font-bold flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
            <span className="truncate">Reabastecimento</span>
          </TabsTrigger>
          <TabsTrigger value="pallets" className="text-xs py-2 font-bold flex items-center gap-1">
            <Boxes className="w-3.5 h-3.5 text-teal-600" />
            <span className="truncate">Pallets/Volumes</span>
          </TabsTrigger>
          <TabsTrigger value="coletores" className="text-xs py-2 font-bold flex items-center gap-1">
            <ScanBarcode className="w-3.5 h-3.5 text-orange-600" />
            <span className="truncate">Coletores</span>
          </TabsTrigger>
          <TabsTrigger
            value="operadores"
            className="text-xs py-2 font-bold flex items-center gap-1"
          >
            <Users className="w-3.5 h-3.5 text-[#005B2E]" />
            <span className="truncate">Operadores</span>
          </TabsTrigger>
        </TabsList>

        {/* ABA 1: RECEBIMENTO */}
        <TabsContent value="recebimento" className="space-y-4">
          <WmsReceiving />
        </TabsContent>

        {/* ABA 2: ENDEREÇAMENTO (PUTAWAY E LOCALIZAÇÕES) */}
        <TabsContent value="enderecamento" className="space-y-4">
          <div className="space-y-4">
            <WmsPutaway />
            <Card className="border-2 border-[#005B2E]/20 p-4 space-y-3">
              <div className="flex items-center gap-2 border-b pb-2">
                <MapPin className="w-4 h-4 text-[#005B2E]" />
                <h3 className="text-sm font-bold text-foreground">
                  Estrutura de Localizações e Ruas do Armazém
                </h3>
              </div>
              <StockLocations />
            </Card>
          </div>
        </TabsContent>

        {/* ABA 3: SEPARAÇÃO / PICKING */}
        <TabsContent value="separacao" className="space-y-4">
          <div className="space-y-4">
            <WmsSeparation />
            <Card className="border-2 border-[#005B2E]/20 p-4 space-y-3">
              <div className="flex items-center gap-2 border-b pb-2">
                <PackageSearch className="w-4 h-4 text-[#005B2E]" />
                <h3 className="text-sm font-bold text-foreground">Fila de Separação de Pedidos</h3>
              </div>
              <StockPicking />
            </Card>
          </div>
        </TabsContent>

        {/* ABA 4: ONDAS */}
        <TabsContent value="ondas" className="space-y-4">
          <WmsWaves />
        </TabsContent>

        {/* ABA 5: REABASTECIMENTO */}
        <TabsContent value="reabastecimento" className="space-y-4">
          <WmsReplenishment />
        </TabsContent>

        {/* ABA 6: PALLETS E VOLUMES */}
        <TabsContent value="pallets" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="border-2 border-[#005B2E]/20 p-4 space-y-3">
              <div className="flex items-center gap-2 border-b pb-2">
                <Boxes className="w-4 h-4 text-[#005B2E]" />
                <h3 className="text-sm font-bold text-foreground">Controle de Pallets e Lastro</h3>
              </div>
              <WmsPallets />
            </Card>

            <Card className="border-2 border-[#005B2E]/20 p-4 space-y-3">
              <div className="flex items-center gap-2 border-b pb-2">
                <Boxes className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-foreground">
                  Gestão de Volumes e Embalagens
                </h3>
              </div>
              <WmsVolumes />
            </Card>
          </div>
        </TabsContent>

        {/* ABA 7: COLETORES (CÓDIGO DE BARRAS) */}
        <TabsContent value="coletores" className="space-y-4">
          <WmsCollectors />
        </TabsContent>

        {/* ABA 8: OPERADORES */}
        <TabsContent value="operadores" className="space-y-4">
          <WmsOperators />
        </TabsContent>
      </Tabs>
    </div>
  )
}
