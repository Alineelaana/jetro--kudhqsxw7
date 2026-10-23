import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Bot, Zap, GitBranch, RefreshCw, Building2 } from 'lucide-react'
import { useBrand } from '@/hooks/use-brand'
import { toast } from '@/hooks/use-toast'
import { AiAgents } from '@/components/ai-module/ai-agents'
import { AiAutomations } from '@/components/ai-module/ai-automations'
import { AiSmartFlows } from '@/components/ai-module/ai-smart-flows'

export function ScreenAgentesAutomacoes() {
  const { brand, empresasDisponiveis, empresaAtivaId } = useBrand()
  const [activeTab, setActiveTab] = useState<'agentes' | 'automacoes' | 'fluxos'>('agentes')
  const [refreshKey, setRefreshKey] = useState(0)

  const empresaAtualNome =
    empresasDisponiveis?.find((e: any) => e.id === empresaAtivaId)?.nome_fantasia ||
    brand?.nomeExibicao ||
    'Todas as Empresas'

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1)
    toast({ title: 'Agentes, Automações e Fluxos atualizados' })
  }

  return (
    <div className="space-y-4">
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#005B2E] text-white shadow-sm">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                Agentes e Automações
              </h1>
              <Badge
                variant="outline"
                className="text-xs bg-[#005B2E]/10 text-[#005B2E] font-bold border-[#005B2E]/30"
              >
                Inteligência Artificial
              </Badge>
              {empresaAtivaId && (
                <Badge variant="secondary" className="text-xs flex items-center gap-1 font-medium">
                  <Building2 className="w-3 h-3 text-[#005B2E]" />
                  {empresaAtualNome}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Gestão de agentes especializados, rotinas automatizadas por eventos e fluxos
              inteligentes por etapas.
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

      {/* SUB-ABAS: Agentes · Automações · Fluxos */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as 'agentes' | 'automacoes' | 'fluxos')}
        className="space-y-4"
      >
        <TabsList className="bg-muted/60 p-1 border border-border">
          <TabsTrigger
            value="agentes"
            className="data-[state=active]:bg-background data-[state=active]:text-[#005B2E] data-[state=active]:shadow-sm font-semibold text-xs flex items-center gap-2"
          >
            <Bot className="w-3.5 h-3.5" />
            Agentes
          </TabsTrigger>
          <TabsTrigger
            value="automacoes"
            className="data-[state=active]:bg-background data-[state=active]:text-[#005B2E] data-[state=active]:shadow-sm font-semibold text-xs flex items-center gap-2"
          >
            <Zap className="w-3.5 h-3.5" />
            Automações
          </TabsTrigger>
          <TabsTrigger
            value="fluxos"
            className="data-[state=active]:bg-background data-[state=active]:text-[#005B2E] data-[state=active]:shadow-sm font-semibold text-xs flex items-center gap-2"
          >
            <GitBranch className="w-3.5 h-3.5" />
            Fluxos Inteligentes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="agentes" className="space-y-4">
          <AiAgents key={`agents-${refreshKey}`} />
        </TabsContent>

        <TabsContent value="automacoes" className="space-y-4">
          <AiAutomations key={`automations-${refreshKey}`} />
        </TabsContent>

        <TabsContent value="fluxos" className="space-y-4">
          <AiSmartFlows key={`flows-${refreshKey}`} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
