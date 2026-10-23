import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { BarChart3, TrendingUp, FileText, PieChart, Building2, Boxes, Activity } from 'lucide-react'
import { useBrand } from '@/hooks/use-brand'
import { WmsManagerialDashboard } from '@/components/stock/wms-managerial-dashboard'
import { WmsReports } from '@/components/stock/wms-reports'

export function ScreenWmsGerencial() {
  const { brand, empresasDisponiveis, empresaAtivaId } = useBrand()
  const [currentTab, setCurrentTab] = useState('desempenho')

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
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-foreground tracking-tight">WMS Gerencial</h1>
              <Badge
                variant="outline"
                className="text-xs bg-[#005B2E]/10 text-[#005B2E] font-bold border-[#005B2E]/30"
              >
                Inteligência Analítica & Armazenagem
              </Badge>
              {empresaAtivaId && (
                <Badge variant="secondary" className="text-xs flex items-center gap-1 font-medium">
                  <Building2 className="w-3 h-3 text-[#005B2E]" />
                  {empresaAtualNome}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Inteligência analítica do armazém: KPIs de produtividade operacional, taxa de ocupação
              volumétrica por rua/prédio, curva ABC e rotatividade de estoque (giro), e relatórios
              gerenciais consolidados.
            </p>
          </div>
        </div>
      </div>

      {/* ABAS DA TELA CONFORME ESPECIFICAÇÃO:
          1. Indicadores de desempenho
          2. Ocupação e rotatividade
          3. Relatórios gerenciais */}
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
        <TabsList className="bg-muted/60 p-1 rounded-xl grid grid-cols-1 sm:grid-cols-3 max-w-2xl h-auto gap-1">
          <TabsTrigger
            value="desempenho"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <Activity className="w-3.5 h-3.5 text-[#005B2E]" />
            <span>Indicadores de Desempenho</span>
          </TabsTrigger>
          <TabsTrigger
            value="ocupacao"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
            <span>Ocupação & Rotatividade</span>
          </TabsTrigger>
          <TabsTrigger
            value="relatorios"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-amber-600" />
            <span>Relatórios Gerenciais</span>
          </TabsTrigger>
        </TabsList>

        {/* ABA 1: INDICADORES DE DESEMPENHO */}
        <TabsContent value="desempenho" className="space-y-4">
          <WmsManagerialDashboard />
        </TabsContent>

        {/* ABA 2: OCUPAÇÃO E ROTATIVIDADE (GIRO DE ESTOQUE E CAPACIDADE) */}
        <TabsContent value="ocupacao" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-2 border-emerald-200 bg-emerald-50/30 p-4">
              <span className="text-xs font-bold text-emerald-800">Ocupação Média do Armazém</span>
              <span className="text-2xl font-black text-[#005B2E] block mt-1">82.4%</span>
              <span className="text-[11px] text-muted-foreground mt-1 block">
                1.648 de 2.000 posições-palete ocupadas
              </span>
            </Card>

            <Card className="border-2 border-blue-200 bg-blue-50/30 p-4">
              <span className="text-xs font-bold text-blue-800">Giro de Estoque Médio</span>
              <span className="text-2xl font-black text-blue-700 block mt-1">4.2x / ano</span>
              <span className="text-[11px] text-muted-foreground mt-1 block">
                Lead time de renovação: 28 dias
              </span>
            </Card>

            <Card className="border-2 border-purple-200 bg-purple-50/30 p-4">
              <span className="text-xs font-bold text-purple-800">Acuracidade de Inventário</span>
              <span className="text-2xl font-black text-purple-700 block mt-1">99.1%</span>
              <span className="text-[11px] text-muted-foreground mt-1 block">
                Baseado nos últimos 3 ciclos de contagem
              </span>
            </Card>
          </div>

          <WmsManagerialDashboard showRotativityDetail />
        </TabsContent>

        {/* ABA 3: RELATÓRIOS GERENCIAIS */}
        <TabsContent value="relatorios" className="space-y-4">
          <WmsReports />
        </TabsContent>
      </Tabs>
    </div>
  )
}
