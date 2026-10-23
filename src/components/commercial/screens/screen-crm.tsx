import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { GitCommit, Users, Calendar, Settings, BarChart2, Building2 } from 'lucide-react'
import { useBrand } from '@/hooks/use-brand'
import { CrmFunnel } from '@/components/crm/crm-funnel'
import { CrmLeads } from '@/components/crm/crm-leads'
import { CrmAgenda } from '@/components/crm/crm-agenda'
import { CrmFunnelConfig } from '@/components/crm/crm-funnel-config'
import { CrmReports } from '@/components/crm/crm-reports'

export function ScreenCRM() {
  const { brand, empresasDisponiveis, empresaAtivaId } = useBrand()
  const [currentTab, setCurrentTab] = useState('funil')

  const empresaAtualNome =
    empresasDisponiveis?.find((e: any) => e.id === empresaAtivaId)?.nome_fantasia ||
    brand?.nomeExibicao ||
    'Todas as Empresas'

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#005B2E] text-white shadow-sm">
            <GitCommit className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                CRM & Pipeline Comercial
              </h1>
              <Badge
                variant="outline"
                className="text-xs bg-[#005B2E]/10 text-[#005B2E] font-bold border-[#005B2E]/30"
              >
                Relacionamento & Oportunidades
              </Badge>
              {empresaAtivaId && (
                <Badge variant="secondary" className="text-xs flex items-center gap-1 font-medium">
                  <Building2 className="w-3 h-3 text-[#005B2E]" />
                  {empresaAtualNome}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Funil de vendas interativo, cadastro e qualificação de leads, agenda de atividades e
              relatórios analíticos de conversão.
            </p>
          </div>
        </div>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
        <TabsList className="bg-muted/60 p-1 rounded-xl grid grid-cols-5 max-w-2xl h-auto gap-1">
          <TabsTrigger value="funil" className="text-xs py-2 font-bold flex items-center gap-1.5">
            <GitCommit className="w-3.5 h-3.5 text-[#005B2E]" />
            <span>Funil de Vendas</span>
          </TabsTrigger>
          <TabsTrigger value="leads" className="text-xs py-2 font-bold flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-blue-600" />
            <span>Leads & Oportunidades</span>
          </TabsTrigger>
          <TabsTrigger value="agenda" className="text-xs py-2 font-bold flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-amber-600" />
            <span>Agenda & Atividades</span>
          </TabsTrigger>
          <TabsTrigger value="config" className="text-xs py-2 font-bold flex items-center gap-1.5">
            <Settings className="w-3.5 h-3.5 text-slate-600" />
            <span>Configurações</span>
          </TabsTrigger>
          <TabsTrigger
            value="relatorios"
            className="text-xs py-2 font-bold flex items-center gap-1.5"
          >
            <BarChart2 className="w-3.5 h-3.5 text-purple-600" />
            <span>Relatórios CRM</span>
          </TabsTrigger>
        </TabsList>

        {/* ABA 1: FUNIL DE VENDAS */}
        <TabsContent value="funil" className="space-y-4">
          <CrmFunnel />
        </TabsContent>

        {/* ABA 2: LEADS E OPORTUNIDADES */}
        <TabsContent value="leads" className="space-y-4">
          <CrmLeads />
        </TabsContent>

        {/* ABA 3: AGENDA E ATIVIDADES */}
        <TabsContent value="agenda" className="space-y-4">
          <CrmAgenda />
        </TabsContent>

        {/* ABA 4: CONFIGURAÇÕES DO FUNIL */}
        <TabsContent value="config" className="space-y-4">
          <CrmFunnelConfig />
        </TabsContent>

        {/* ABA 5: RELATÓRIOS CRM */}
        <TabsContent value="relatorios" className="space-y-4">
          <CrmReports />
        </TabsContent>
      </Tabs>
    </div>
  )
}
