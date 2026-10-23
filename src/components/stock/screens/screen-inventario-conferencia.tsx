import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  ClipboardCheck,
  RotateCw,
  CheckCheck,
  SlidersHorizontal,
  Building2,
  ScanBarcode,
} from 'lucide-react'
import { useBrand } from '@/hooks/use-brand'
import { StockInventory } from '@/components/stock/stock-inventory'
import { StockChecking } from '@/components/stock/stock-checking'
import { StockAdjustments } from '@/components/stock/stock-adjustments'
import { WmsRotationalInventory } from '@/components/stock/wms-rotational-inventory'
import { WmsBlindCount } from '@/components/stock/wms-blind-count'

export function ScreenInventarioConferencia() {
  const { brand, empresasDisponiveis, empresaAtivaId } = useBrand()
  const [currentTab, setCurrentTab] = useState('inventarios')

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
            <ClipboardCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                Inventário e Conferência
              </h1>
              <Badge
                variant="outline"
                className="text-xs bg-[#005B2E]/10 text-[#005B2E] font-bold border-[#005B2E]/30"
              >
                Auditoria de Estoque & Precisão
              </Badge>
              {empresaAtivaId && (
                <Badge variant="secondary" className="text-xs flex items-center gap-1 font-medium">
                  <Building2 className="w-3 h-3 text-[#005B2E]" />
                  {empresaAtualNome}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Ciclos de auditoria física de estoque: inventários gerais abertos/fechados, contagem
              cíclica e rotativa, conferência cega e apuração de divergências com fluxo de aprovação
              de ajustes.
            </p>
          </div>
        </div>
      </div>

      {/* ABAS DA TELA CONFORME ESPECIFICAÇÃO:
          1. Inventários (abertos/fechados) · 2. Contagem cíclica · 3. Divergências e aprovação de ajustes */}
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
        <TabsList className="bg-muted/60 p-1 rounded-xl grid grid-cols-1 sm:grid-cols-3 max-w-2xl h-auto gap-1">
          <TabsTrigger
            value="inventarios"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <ClipboardCheck className="w-3.5 h-3.5 text-[#005B2E]" />
            <span>Inventários Gerais</span>
          </TabsTrigger>
          <TabsTrigger value="ciclica" className="text-xs py-2 font-bold flex items-center gap-1.5">
            <RotateCw className="w-3.5 h-3.5 text-blue-600" />
            <span>Contagem Cíclica & Cega</span>
          </TabsTrigger>
          <TabsTrigger
            value="divergencias"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600" />
            <span>Divergências & Ajustes</span>
          </TabsTrigger>
        </TabsList>

        {/* ABA 1: INVENTÁRIOS (ABERTOS/FECHADOS) */}
        <TabsContent value="inventarios" className="space-y-4">
          <StockInventory />
        </TabsContent>

        {/* ABA 2: CONTAGEM CÍCLICA E CONFERÊNCIA CEGA */}
        <TabsContent value="ciclica" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="border-2 border-[#005B2E]/20 p-4 space-y-3">
              <div className="flex items-center gap-2 border-b pb-2">
                <RotateCw className="w-4 h-4 text-[#005B2E]" />
                <h3 className="text-sm font-bold text-foreground">
                  Inventário Rotativo Programado
                </h3>
              </div>
              <WmsRotationalInventory />
            </Card>

            <Card className="border-2 border-[#005B2E]/20 p-4 space-y-3">
              <div className="flex items-center gap-2 border-b pb-2">
                <ScanBarcode className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-foreground">Contagem Cega de Campo</h3>
              </div>
              <WmsBlindCount />
            </Card>
          </div>
        </TabsContent>

        {/* ABA 3: DIVERGÊNCIAS E APROVAÇÃO DE AJUSTES */}
        <TabsContent value="divergencias" className="space-y-4">
          <div className="space-y-6">
            <Card className="border-2 border-[#005B2E]/20 p-4 space-y-3">
              <div className="flex items-center gap-2 border-b pb-2">
                <CheckCheck className="w-4 h-4 text-[#005B2E]" />
                <h3 className="text-sm font-bold text-foreground">
                  Conferência de Recebimento & Expedição
                </h3>
              </div>
              <StockChecking />
            </Card>

            <Card className="border-2 border-[#005B2E]/20 p-4 space-y-3">
              <div className="flex items-center gap-2 border-b pb-2">
                <SlidersHorizontal className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-foreground">
                  Ajustes de Estoque & Fluxo de Aprovação
                </h3>
              </div>
              <StockAdjustments />
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
