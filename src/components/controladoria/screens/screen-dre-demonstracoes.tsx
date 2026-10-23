import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  FileSpreadsheet,
  TrendingUp,
  BarChart2,
  Scale,
  RefreshCw,
  Building2,
  Landmark,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useBrand } from '@/hooks/use-brand'
import { toast } from '@/hooks/use-toast'
import { ControladoriaDRE } from '../controladoria-dre'
import { ControladoriaEbitda } from '../controladoria-ebitda'
import { ControladoriaBalanco } from '../controladoria-balanco'

export function ScreenDreDemonstracoes() {
  const navigate = useNavigate()
  const { brand, empresasDisponiveis, empresaAtivaId } = useBrand()
  const [activeTab, setActiveTab] = useState<'dre' | 'dre_analitica' | 'ebitda' | 'balanco'>('dre')
  const [refreshKey, setRefreshKey] = useState(0)

  const empresaAtualNome =
    empresasDisponiveis?.find((e: any) => e.id === empresaAtivaId)?.nome_fantasia ||
    brand?.nomeExibicao ||
    'Todas as Empresas'

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1)
    toast({ title: 'Demonstrações Contábeis e Gerenciais atualizadas' })
  }

  return (
    <div className="space-y-4">
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#005B2E] text-white shadow-sm">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                DRE e Demonstrações
              </h1>
              <Badge
                variant="outline"
                className="text-xs bg-[#005B2E]/10 text-[#005B2E] font-bold border-[#005B2E]/30"
              >
                Controladoria Corporativa
              </Badge>
              {empresaAtivaId && (
                <Badge variant="secondary" className="text-xs flex items-center gap-1 font-medium">
                  <Building2 className="w-3 h-3 text-[#005B2E]" />
                  {empresaAtualNome}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Demonstrativo de Resultado do Exercício (Gerencial e Analítico), EBITDA e Balanço
              Patrimonial estruturado.
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
          <Button
            size="sm"
            onClick={() => navigate('/admin/financeiro')}
            className="text-xs bg-[#005B2E] hover:bg-[#004724] text-white font-bold"
          >
            <Landmark className="w-3.5 h-3.5 mr-1.5" />
            Origem: Financeiro
          </Button>
        </div>
      </div>

      {/* ABAS: DRE | DRE Analítica | EBITDA | Balanço Patrimonial */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as 'dre' | 'dre_analitica' | 'ebitda' | 'balanco')}
        className="space-y-4"
      >
        <TabsList className="bg-muted/60 p-1 border border-border">
          <TabsTrigger
            value="dre"
            className="data-[state=active]:bg-background data-[state=active]:text-[#005B2E] data-[state=active]:shadow-sm font-semibold text-xs flex items-center gap-2"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            DRE Gerencial
          </TabsTrigger>
          <TabsTrigger
            value="dre_analitica"
            className="data-[state=active]:bg-background data-[state=active]:text-[#005B2E] data-[state=active]:shadow-sm font-semibold text-xs flex items-center gap-2"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            DRE Analítica
          </TabsTrigger>
          <TabsTrigger
            value="ebitda"
            className="data-[state=active]:bg-background data-[state=active]:text-[#005B2E] data-[state=active]:shadow-sm font-semibold text-xs flex items-center gap-2"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            EBITDA
          </TabsTrigger>
          <TabsTrigger
            value="balanco"
            className="data-[state=active]:bg-background data-[state=active]:text-[#005B2E] data-[state=active]:shadow-sm font-semibold text-xs flex items-center gap-2"
          >
            <Scale className="w-3.5 h-3.5" />
            Balanço Patrimonial
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dre" className="space-y-4">
          <ControladoriaDRE key={`dre-${refreshKey}`} />
        </TabsContent>

        <TabsContent value="dre_analitica" className="space-y-4">
          <ControladoriaDRE key={`dre-an-${refreshKey}`} />
        </TabsContent>

        <TabsContent value="ebitda" className="space-y-4">
          <ControladoriaEbitda key={`ebitda-${refreshKey}`} />
        </TabsContent>

        <TabsContent value="balanco" className="space-y-4">
          <ControladoriaBalanco key={`balanco-${refreshKey}`} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
