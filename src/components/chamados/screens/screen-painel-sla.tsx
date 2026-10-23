import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, Clock, RefreshCw, Building2 } from 'lucide-react'
import { useBrand } from '@/hooks/use-brand'
import { toast } from '@/hooks/use-toast'

// Reutilização dos componentes existentes
import PainelChamadosScreen from '@/components/chamados/painel-chamados-screen'
import ConfiguracaoSlaScreen from '@/components/chamados/configuracao-sla-screen'

export function ScreenPainelSla() {
  const { brand, empresasDisponiveis, empresaAtivaId } = useBrand()
  const [searchParams, setSearchParams] = useSearchParams()

  const tabParam = searchParams.get('tab')
  const initialTab = tabParam === 'sla' ? 'sla' : 'painel'

  const [activeTab, setActiveTab] = useState<'painel' | 'sla'>(initialTab)
  const [refreshKey, setRefreshKey] = useState(0)

  const empresaAtualNome =
    empresasDisponiveis?.find((e: any) => e.id === empresaAtivaId)?.nome_fantasia ||
    brand?.nomeExibicao ||
    'Todas as Empresas'

  const handleTabChange = (val: string) => {
    const nextTab = val as 'painel' | 'sla'
    setActiveTab(nextTab)
    const newParams = new URLSearchParams(searchParams)
    newParams.set('tab', nextTab)
    setSearchParams(newParams, { replace: true })
  }

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1)
    toast({ title: 'Painel e regras de SLA atualizados' })
  }

  return (
    <div className="space-y-4">
      {/* CABEÇALHO PADRÃO MULTITENANT */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#005B2E] text-white shadow-sm">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-foreground tracking-tight">Painel e SLA</h1>
              <Badge
                variant="outline"
                className="text-xs bg-[#005B2E]/10 text-[#005B2E] font-bold border-[#005B2E]/30"
              >
                TI & Atendimento
              </Badge>
              {empresaAtivaId && (
                <Badge variant="secondary" className="text-xs flex items-center gap-1 font-medium">
                  <Building2 className="w-3 h-3 text-[#005B2E]" />
                  {empresaAtualNome}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Fila gerencial da equipe técnica, monitoramento de cumprimento de prazos e matriz de
              SLA por setor.
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

      {/* SUB-ABAS: Painel de Atendimento · SLA */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList className="bg-muted/60 p-1 border border-border">
          <TabsTrigger
            value="painel"
            className="data-[state=active]:bg-background data-[state=active]:text-[#005B2E] data-[state=active]:shadow-sm font-semibold text-xs flex items-center gap-2"
          >
            <Users className="w-3.5 h-3.5" />
            Painel de Atendimento
          </TabsTrigger>
          <TabsTrigger
            value="sla"
            className="data-[state=active]:bg-background data-[state=active]:text-[#005B2E] data-[state=active]:shadow-sm font-semibold text-xs flex items-center gap-2"
          >
            <Clock className="w-3.5 h-3.5" />
            SLA
          </TabsTrigger>
        </TabsList>

        {/* 1. Painel de Atendimento (Fila da equipe de TI) */}
        <TabsContent value="painel" className="space-y-4">
          <PainelChamadosScreen key={`painel-${refreshKey}`} />
        </TabsContent>

        {/* 2. Regras, Prazos e Matriz de SLA */}
        <TabsContent value="sla" className="space-y-4">
          <ConfiguracaoSlaScreen key={`sla-${refreshKey}`} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
