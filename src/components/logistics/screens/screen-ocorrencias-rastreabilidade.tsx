import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  AlertTriangle,
  MapPin,
  FileCheck,
  ShieldAlert,
  Building2,
  RefreshCw,
  Search,
} from 'lucide-react'
import { useBrand } from '@/hooks/use-brand'
import { LogisticsOccurrences } from '@/components/logistics/logistics-occurrences'
import { LogisticsTracking } from '@/components/logistics/logistics-tracking'
import { LogisticsProofDelivery } from '@/components/logistics/logistics-proof-delivery'

export function ScreenOcorrenciasRastreabilidade() {
  const { brand, empresasDisponiveis, empresaAtivaId } = useBrand()
  const [currentTab, setCurrentTab] = useState('ocorrencias')
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
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                Ocorrências e Rastreabilidade
              </h1>
              <Badge
                variant="outline"
                className="text-xs bg-[#005B2E]/10 text-[#005B2E] font-bold border-[#005B2E]/30"
              >
                Auditoria de Entregas & Comprovantes
              </Badge>
              {empresaAtivaId && (
                <Badge variant="secondary" className="text-xs flex items-center gap-1 font-medium">
                  <Building2 className="w-3 h-3 text-[#005B2E]" />
                  {empresaAtualNome}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Abertura e tratativa de ocorrências de transporte (avarias, extravios, recusas),
              rastreamento de cargas em tempo real e repositório de canhotos/comprovantes digitais.
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

      {/* ABAS: OCORRÊNCIAS, RASTREAMENTO E COMPROVANTES */}
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
        <TabsList className="bg-muted/60 p-1 rounded-xl grid grid-cols-3 max-w-xl h-auto gap-1">
          <TabsTrigger
            value="ocorrencias"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>Ocorrências em Trânsito</span>
          </TabsTrigger>
          <TabsTrigger
            value="rastreamento"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span>Rastreamento em Tempo Real</span>
          </TabsTrigger>
          <TabsTrigger
            value="comprovantes"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Comprovantes de Entrega (POD)</span>
          </TabsTrigger>
        </TabsList>

        {/* ABA 1: OCORRÊNCIAS */}
        <TabsContent value="ocorrencias" className="space-y-4">
          <LogisticsOccurrences />
        </TabsContent>

        {/* ABA 2: RASTREAMENTO */}
        <TabsContent value="rastreamento" className="space-y-4">
          <LogisticsTracking />
        </TabsContent>

        {/* ABA 3: COMPROVANTES */}
        <TabsContent value="comprovantes" className="space-y-4">
          <LogisticsProofDelivery />
        </TabsContent>
      </Tabs>
    </div>
  )
}
