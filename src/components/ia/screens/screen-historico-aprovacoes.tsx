import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { History, ShieldCheck, Settings, RefreshCw, Building2 } from 'lucide-react'
import { useBrand } from '@/hooks/use-brand'
import { toast } from '@/hooks/use-toast'
import { AiInteractionHistory } from '@/components/ai-module/ai-interaction-history'
import { AiApprovals } from '@/components/ai-module/ai-approvals'
import { AiSettingsPanel } from '@/components/ai-module/ai-settings'

export function ScreenHistoricoAprovacoes() {
  const { brand, empresasDisponiveis, empresaAtivaId } = useBrand()
  const [activeTab, setActiveTab] = useState<'historico' | 'aprovacoes' | 'configuracoes'>(
    'historico',
  )
  const [refreshKey, setRefreshKey] = useState(0)

  const empresaAtualNome =
    empresasDisponiveis?.find((e: any) => e.id === empresaAtivaId)?.nome_fantasia ||
    brand?.nomeExibicao ||
    'Todas as Empresas'

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1)
    toast({ title: 'Histórico, Aprovações e Configurações atualizados' })
  }

  return (
    <div className="space-y-4">
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#005B2E] text-white shadow-sm">
            <History className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-foreground tracking-tight">
                Histórico e Aprovações
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
              Auditoria de interações do assistente, esteira de homologação humana de ações críticas
              e parâmetros globais do módulo.
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

      {/* SUB-ABAS: Histórico · Aprovações · Configurações */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as 'historico' | 'aprovacoes' | 'configuracoes')}
        className="space-y-4"
      >
        <TabsList className="bg-muted/60 p-1 border border-border">
          <TabsTrigger
            value="historico"
            className="data-[state=active]:bg-background data-[state=active]:text-[#005B2E] data-[state=active]:shadow-sm font-semibold text-xs flex items-center gap-2"
          >
            <History className="w-3.5 h-3.5" />
            Histórico de Interações
          </TabsTrigger>
          <TabsTrigger
            value="aprovacoes"
            className="data-[state=active]:bg-background data-[state=active]:text-[#005B2E] data-[state=active]:shadow-sm font-semibold text-xs flex items-center gap-2"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Aprovações Humanas
          </TabsTrigger>
          <TabsTrigger
            value="configuracoes"
            className="data-[state=active]:bg-background data-[state=active]:text-[#005B2E] data-[state=active]:shadow-sm font-semibold text-xs flex items-center gap-2"
          >
            <Settings className="w-3.5 h-3.5" />
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="historico" className="space-y-4">
          <AiInteractionHistory key={`history-${refreshKey}`} />
        </TabsContent>

        <TabsContent value="aprovacoes" className="space-y-4">
          <AiApprovals key={`approvals-${refreshKey}`} />
        </TabsContent>

        <TabsContent value="configuracoes" className="space-y-4">
          <AiSettingsPanel key={`settings-${refreshKey}`} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
