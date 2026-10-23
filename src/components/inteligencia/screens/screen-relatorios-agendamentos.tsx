import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, CalendarClock, RefreshCw, Building2, BarChart3 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useBrand } from '@/hooks/use-brand'
import { toast } from '@/hooks/use-toast'
import { BiReportCenter } from '@/components/bi/bi-report-center'
import ReportSchedulesPage from '@/pages/admin/ReportSchedulesPage'

export function ScreenRelatoriosAgendamentos() {
  const navigate = useNavigate()
  const { brand, empresasDisponiveis, empresaAtivaId } = useBrand()
  const [activeTab, setActiveTab] = useState<'relatorios' | 'agendamentos'>('relatorios')
  const [refreshKey, setRefreshKey] = useState(0)

  const empresaAtualNome =
    empresasDisponiveis?.find((e: any) => e.id === empresaAtivaId)?.nome_fantasia ||
    brand?.nomeExibicao ||
    'Todas as Empresas'

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1)
    toast({ title: 'Painel de Relatórios e Agendamentos atualizado' })
  }

  return (
    <div className="space-y-4">
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#005B2E] text-white shadow-sm">
            <CalendarClock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                Relatórios e Agendamentos
              </h1>
              <Badge
                variant="outline"
                className="text-xs bg-[#005B2E]/10 text-[#005B2E] font-bold border-[#005B2E]/30"
              >
                Centro Corporativo de Disparos & Consultas
              </Badge>
              {empresaAtivaId && (
                <Badge variant="secondary" className="text-xs flex items-center gap-1 font-medium">
                  <Building2 className="w-3 h-3 text-[#005B2E]" />
                  {empresaAtualNome}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Catálogo centralizado de relatórios de todos os módulos e motor de agendamentos
              periódicos por e-mail.
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
            onClick={() => navigate('/admin/inteligencia')}
            className="text-xs bg-[#005B2E] hover:bg-[#004724] text-white font-bold"
          >
            <BarChart3 className="w-3.5 h-3.5 mr-1.5" />
            Central Executiva
          </Button>
        </div>
      </div>

      {/* ABAS: Catálogo de Relatórios · Agendamentos Automáticos */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as 'relatorios' | 'agendamentos')}
        className="space-y-4"
      >
        <TabsList className="bg-muted/60 p-1 border border-border">
          <TabsTrigger
            value="relatorios"
            className="data-[state=active]:bg-background data-[state=active]:text-[#005B2E] data-[state=active]:shadow-sm font-semibold text-xs flex items-center gap-2"
          >
            <FileText className="w-3.5 h-3.5" />
            Catálogo de Relatórios
          </TabsTrigger>
          <TabsTrigger
            value="agendamentos"
            className="data-[state=active]:bg-background data-[state=active]:text-[#005B2E] data-[state=active]:shadow-sm font-semibold text-xs flex items-center gap-2"
          >
            <CalendarClock className="w-3.5 h-3.5" />
            Agendamentos Automáticos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="relatorios" className="space-y-4">
          <BiReportCenter key={`rep-${refreshKey}`} />
        </TabsContent>

        <TabsContent value="agendamentos" className="space-y-4">
          <div key={`sched-${refreshKey}`} className="rounded-xl border border-border bg-card">
            <ReportSchedulesPage />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
