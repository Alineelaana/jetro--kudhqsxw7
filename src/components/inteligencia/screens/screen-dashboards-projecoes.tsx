import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  TrendingUp,
  Sparkles,
  RefreshCw,
  Building2,
  CalendarClock,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useBrand } from '@/hooks/use-brand'
import { toast } from '@/hooks/use-toast'
import { BiCustomDashboards } from '@/components/bi/bi-custom-dashboards'
import { BiProjection } from '@/components/bi/bi-projection'

export function ScreenDashboardsProjecoes() {
  const navigate = useNavigate()
  const { brand, empresasDisponiveis, empresaAtivaId } = useBrand()
  const [activeTab, setActiveTab] = useState<'dashboards' | 'projecoes'>('dashboards')
  const [refreshKey, setRefreshKey] = useState(0)

  const empresaAtualNome =
    empresasDisponiveis?.find((e: any) => e.id === empresaAtivaId)?.nome_fantasia ||
    brand?.nomeExibicao ||
    'Todas as Empresas'

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1)
    toast({ title: 'Painel de Dashboards e Projeções atualizado' })
  }

  return (
    <div className="space-y-4">
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#005B2E] text-white shadow-sm">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                Dashboards e Projeções
              </h1>
              <Badge
                variant="outline"
                className="text-xs bg-[#005B2E]/10 text-[#005B2E] font-bold border-[#005B2E]/30"
              >
                Inteligência Analítica & Preditiva
              </Badge>
              {empresaAtivaId && (
                <Badge variant="secondary" className="text-xs flex items-center gap-1 font-medium">
                  <Building2 className="w-3 h-3 text-[#005B2E]" />
                  {empresaAtualNome}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Gestão de dashboards customizados e modelagem de projeções de faturamento com dias
              úteis e tendências.
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
            onClick={() => navigate('/admin/inteligencia/relatorios')}
            className="text-xs bg-[#005B2E] hover:bg-[#004724] text-white font-bold"
          >
            <CalendarClock className="w-3.5 h-3.5 mr-1.5" />
            Relatórios
          </Button>
        </div>
      </div>

      {/* ABAS: Dashboards Personalizados · Projeções e Tendências */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as 'dashboards' | 'projecoes')}
        className="space-y-4"
      >
        <TabsList className="bg-muted/60 p-1 border border-border">
          <TabsTrigger
            value="dashboards"
            className="data-[state=active]:bg-background data-[state=active]:text-[#005B2E] data-[state=active]:shadow-sm font-semibold text-xs flex items-center gap-2"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Dashboards Personalizados
          </TabsTrigger>
          <TabsTrigger
            value="projecoes"
            className="data-[state=active]:bg-background data-[state=active]:text-[#005B2E] data-[state=active]:shadow-sm font-semibold text-xs flex items-center gap-2"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Projeções e Tendências
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboards" className="space-y-4">
          <BiCustomDashboards key={`dash-${refreshKey}`} />
        </TabsContent>

        <TabsContent value="projecoes" className="space-y-4">
          <BiProjection key={`proj-${refreshKey}`} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
